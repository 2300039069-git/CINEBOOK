import { bookingApi } from './bookingApi';

const STORAGE_KEY_LOCKS = 'cinebook_global_seat_locks';
const STORAGE_KEY_BOOKED = 'cinebook_global_booked_seats';
const BROADCAST_CHANNEL_NAME = 'cinebook_seat_lock_channel';
const LOCK_DURATION_MS = 8 * 60 * 1000; // 8 minutes

// Safe broadcast channel initialization
let broadcastChannel = null;
try {
  if (typeof window !== 'undefined' && window.BroadcastChannel) {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  }
} catch (e) {
  console.warn('BroadcastChannel not available, using storage event fallback:', e);
}

// Get or generate unique ID for current browser tab
export const getTabId = () => {
  if (typeof window === 'undefined') return 'server_tab';
  let tabId = sessionStorage.getItem('cinebook_tab_id');
  if (!tabId) {
    tabId = `tab_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem('cinebook_tab_id', tabId);
  }
  return tabId;
};

// Generate standardized unique key for a show
export const getShowKey = (show, theatre, movie, date) => {
  const sId = typeof show === 'string' ? show : (show?.id || 'sh-001');
  const tId = typeof theatre === 'string' ? theatre : (theatre?.id || (typeof show === 'object' ? show?.theatreId : null) || 'th-001');
  const sDate = typeof date === 'string' ? date : (typeof show === 'object' ? show?.showDate || show?.date : null) || new Date().toISOString().split('T')[0];
  return `show_${tId}_${sId}_${sDate}`;
};

// Helper to read and clean expired locks from localStorage
export const getCleanLocksMap = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOCKS);
    if (!raw) return {};
    const locks = JSON.parse(raw);
    const now = Date.now();
    let changed = false;

    // Prune expired locks
    Object.keys(locks).forEach((showKey) => {
      Object.keys(locks[showKey] || {}).forEach((seatId) => {
        const item = locks[showKey][seatId];
        if (item.status === 'LOCKED' && item.expiresAt <= now) {
          delete locks[showKey][seatId];
          changed = true;
        }
      });
      if (Object.keys(locks[showKey] || {}).length === 0) {
        delete locks[showKey];
        changed = true;
      }
    });

    if (changed) {
      localStorage.setItem(STORAGE_KEY_LOCKS, JSON.stringify(locks));
    }
    return locks;
  } catch (err) {
    console.warn('Error parsing seat locks:', err);
    return {};
  }
};

// Helper to get permanently booked seats map
export const getBookedSeatsMap = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BOOKED);
    const booked = raw ? JSON.parse(raw) : {};

    // Also include seats from confirmed cinebook_bookings in localStorage
    const userBookings = JSON.parse(localStorage.getItem('cinebook_bookings') || '[]');
    userBookings.forEach((b) => {
      if (b.status === 'CANCELLED' || b.status === 'REFUNDED') return;
      const sId = b.show?.id || b.showId || (typeof b.show === 'string' ? b.show : null);
      const tId = b.theatre?.id || b.theatreId || (typeof b.theatre === 'string' ? b.theatre : null);
      const mId = b.movie?.id || b.movieId || (typeof b.movie === 'string' ? b.movie : null);
      const sDate = b.showDate || b.date;
      if (!sId) return;

      const showKey = getShowKey(sId, tId, mId, sDate);
      if (!booked[showKey]) booked[showKey] = {};
      (b.seats || []).forEach((seat) => {
        const seatId = typeof seat === 'string' ? seat : seat.id;
        if (seatId) {
          booked[showKey][seatId] = {
            status: 'BOOKED',
            bookingId: b.bookingId,
            bookedAt: b.bookedAt || Date.now()
          };
        }
      });
    });

    return booked;
  } catch (err) {
    return {};
  }
};

export const seatLockManager = {
  // Get live lock & booking statuses for all seats of a show
  getShowSeatStatuses: (showKey) => {
    const locks = getCleanLocksMap();
    const booked = getBookedSeatsMap();
    const currentTabId = getTabId();

    const showLocks = locks[showKey] || {};
    const showBooked = booked[showKey] || {};

    const statusMap = {};

    // 1. Mark booked seats
    Object.keys(showBooked).forEach((seatId) => {
      statusMap[seatId] = {
        status: 'BOOKED',
        isLockedByCurrentTab: false,
        isLockedByOtherTab: false,
        ...showBooked[seatId]
      };
    });

    // 2. Mark active locks
    Object.keys(showLocks).forEach((seatId) => {
      const lock = showLocks[seatId];
      const isMine = lock.tabId === currentTabId;
      statusMap[seatId] = {
        status: 'LOCKED',
        isLockedByCurrentTab: isMine,
        isLockedByOtherTab: !isMine,
        lockToken: lock.lockToken,
        tabId: lock.tabId,
        expiresAt: lock.expiresAt
      };
    });

    return statusMap;
  },

  // Check if a seat is locked by another tab
  isSeatLockedByOtherTab: (showKey, seatId) => {
    const locks = getCleanLocksMap();
    const showLocks = locks[showKey] || {};
    const lock = showLocks[seatId];
    if (!lock) return false;
    const currentTabId = getTabId();
    return lock.tabId !== currentTabId && lock.expiresAt > Date.now();
  },

  // Check if a seat is already booked
  isSeatBooked: (showKey, seatId) => {
    const booked = getBookedSeatsMap();
    return Boolean(booked[showKey]?.[seatId]);
  },

  // Get active lock token held by current tab for a show
  getHeldToken: (showKey) => {
    const locks = getCleanLocksMap();
    const showLocks = locks[showKey] || {};
    const currentTabId = getTabId();
    for (const seatId of Object.keys(showLocks)) {
      if (showLocks[seatId].tabId === currentTabId && showLocks[seatId].lockToken) {
        return showLocks[seatId].lockToken;
      }
    }
    return null;
  },

  // Attempt to atomically lock a seat for current tab
  lockSeat: async (showKey, seatId, showId, existingLockToken) => {
    const currentTabId = getTabId();
    const locks = getCleanLocksMap();
    const booked = getBookedSeatsMap();

    // Check if already booked locally
    if (booked[showKey]?.[seatId]) {
      return { success: false, status: 409, reason: 'SEAT_ALREADY_BOOKED', message: `Seat ${seatId} has already been booked.` };
    }

    // Check if locked by another tab
    const existingLock = locks[showKey]?.[seatId];
    if (existingLock && existingLock.tabId !== currentTabId && existingLock.expiresAt > Date.now()) {
      return {
        success: false,
        status: 409,
        reason: 'SEAT_LOCKED_BY_ANOTHER_USER',
        message: `Seat ${seatId} is currently held by another customer in a different session.`
      };
    }

    let backendLockToken = existingLockToken || null;
    // Sync with backend API if showId provided
    if (showId) {
      try {
        const res = await bookingApi.lockSeats(showId, [seatId], currentTabId, existingLockToken);
        if (res && res.lock_token) {
          backendLockToken = res.lock_token;
        }
      } catch (err) {
        // Immediately record as remote lock in local storage so UI disables it immediately
        const updatedLocks = getCleanLocksMap();
        if (!updatedLocks[showKey]) updatedLocks[showKey] = {};
        updatedLocks[showKey][seatId] = {
          tabId: 'remote_holder',
          lockToken: 'remote_token',
          expiresAt: Date.now() + LOCK_DURATION_MS,
          status: 'LOCKED'
        };
        localStorage.setItem(STORAGE_KEY_LOCKS, JSON.stringify(updatedLocks));

        // Broadcast to all other tabs
        seatLockManager.broadcastChange(showKey, { action: 'LOCK', seatId, tabId: 'remote_holder' });

        return {
          success: false,
          status: err.status || 409,
          reason: 'SEAT_ALREADY_BOOKED',
          message: err.message || `Seat ${seatId} is already booked or held by another customer.`
        };
      }
    }

    // Set lock locally
    const currentLocks = getCleanLocksMap();
    if (!currentLocks[showKey]) currentLocks[showKey] = {};
    const lockToken = backendLockToken || `lock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const expiresAt = Date.now() + LOCK_DURATION_MS;

    currentLocks[showKey][seatId] = {
      tabId: currentTabId,
      lockToken,
      expiresAt,
      status: 'LOCKED'
    };

    localStorage.setItem(STORAGE_KEY_LOCKS, JSON.stringify(currentLocks));

    // Broadcast change across tabs
    seatLockManager.broadcastChange(showKey, { action: 'LOCK', seatId, tabId: currentTabId, expiresAt });

    return { success: true, lockToken, expiresAt };
  },

  // Unlock a seat
  unlockSeat: async (showKey, seatId, showId) => {
    const currentTabId = getTabId();
    const locks = getCleanLocksMap();

    if (locks[showKey]?.[seatId]) {
      const lock = locks[showKey][seatId];
      // Only unlock if owned by this tab or expired
      if (lock.tabId === currentTabId || lock.expiresAt <= Date.now()) {
        const lockToken = lock.lockToken;
        delete locks[showKey][seatId];
        localStorage.setItem(STORAGE_KEY_LOCKS, JSON.stringify(locks));

        seatLockManager.broadcastChange(showKey, { action: 'UNLOCK', seatId, tabId: currentTabId });

        if (showId && lockToken) {
          bookingApi.releaseSeats(showId, lockToken).catch(() => {});
        }
      }
    }

    return { success: true };
  },

  // Release all seats locked by current tab for a show
  releaseCurrentTabLocks: (showKey, showId) => {
    const currentTabId = getTabId();
    const locks = getCleanLocksMap();
    if (!locks[showKey]) return;

    let releasedAny = false;
    let lastToken = null;

    Object.keys(locks[showKey]).forEach((seatId) => {
      if (locks[showKey][seatId].tabId === currentTabId) {
        lastToken = locks[showKey][seatId].lockToken;
        delete locks[showKey][seatId];
        releasedAny = true;
      }
    });

    if (releasedAny) {
      localStorage.setItem(STORAGE_KEY_LOCKS, JSON.stringify(locks));
      seatLockManager.broadcastChange(showKey, { action: 'RELEASE_ALL', tabId: currentTabId });

      if (showId && lastToken) {
        bookingApi.releaseSeats(showId, lastToken).catch(() => {});
      }
    }
  },

  // Permanently mark seats as BOOKED upon checkout payment confirmation
  confirmBooking: (showKey, seatIds, bookingId, showId) => {
    const currentTabId = getTabId();
    const booked = getBookedSeatsMap();
    const locks = getCleanLocksMap();

    if (!booked[showKey]) booked[showKey] = {};
    if (!locks[showKey]) locks[showKey] = {};

    seatIds.forEach((seat) => {
      const seatId = typeof seat === 'string' ? seat : seat.id;
      if (seatId) {
        booked[showKey][seatId] = {
          status: 'BOOKED',
          bookingId: bookingId || `CB-${Date.now()}`,
          bookedAt: Date.now()
        };
        // Remove from temporary locks
        delete locks[showKey][seatId];
      }
    });

    localStorage.setItem(STORAGE_KEY_BOOKED, JSON.stringify(booked));
    localStorage.setItem(STORAGE_KEY_LOCKS, JSON.stringify(locks));

    seatLockManager.broadcastChange(showKey, { action: 'BOOKED_CONFIRMED', seatIds, bookingId });
  },

  // Broadcast change across tabs
  broadcastChange: (showKey, payload) => {
    const msg = { showKey, timestamp: Date.now(), ...payload };
    if (broadcastChannel) {
      try {
        broadcastChannel.postMessage(msg);
      } catch (e) {
        console.warn('Broadcast error:', e);
      }
    }
    // Also touch localStorage key to fire window storage events for older browsers
    try {
      localStorage.setItem('cinebook_last_seat_event', JSON.stringify(msg));
    } catch (e) {}
  },

  // Subscribe to real-time seat lock changes across tabs
  subscribe: (callback) => {
    const handleBroadcast = (event) => {
      if (event.data) {
        callback(event.data);
      }
    };

    const handleStorage = (event) => {
      if (event.key === STORAGE_KEY_LOCKS || event.key === STORAGE_KEY_BOOKED || event.key === 'cinebook_last_seat_event') {
        try {
          const data = event.newValue ? JSON.parse(event.newValue) : {};
          callback(data);
        } catch (e) {
          callback({});
        }
      }
    };

    if (broadcastChannel) {
      broadcastChannel.addEventListener('message', handleBroadcast);
    }
    window.addEventListener('storage', handleStorage);

    // Periodic fast tick for expiry checking & backend layout polling
    const intervalId = setInterval(() => {
      callback({ type: 'TICK_CHECK' });
    }, 1000);

    return () => {
      if (broadcastChannel) {
        broadcastChannel.removeEventListener('message', handleBroadcast);
      }
      window.removeEventListener('storage', handleStorage);
      clearInterval(intervalId);
    };
  }
};
