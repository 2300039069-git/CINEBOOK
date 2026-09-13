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

// Get or generate consistent unique lock token for current browser tab session
export const getTabLockToken = () => {
  if (typeof window === 'undefined') return 'lock_server';
  let token = sessionStorage.getItem('cinebook_tab_lock_token');
  if (!token || token === 'lock_init') {
    token = `lock_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem('cinebook_tab_lock_token', token);
  }
  return token;
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
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    return {};
  }
};

export const seatLockManager = {
  // Synchronize local cache with ground truth from the server layout
  syncWithBackend: (showKey, tiers) => {
    try {
      const locks = getCleanLocksMap();
      const booked = JSON.parse(localStorage.getItem(STORAGE_KEY_BOOKED) || '{}');
      let locksChanged = false;
      let bookedChanged = false;

      (tiers || []).forEach((tier) => {
        (tier.rows || []).forEach((row) => {
          (row.seats || []).forEach((seat) => {
            // If server reports seat as AVAILABLE (not booked on server):
            if (seat.status === 'AVAILABLE' && !seat.isLockedByOther) {
              if (booked[showKey]?.[seat.id]) {
                delete booked[showKey][seat.id];
                bookedChanged = true;
              }
              // If it's marked locked by another session in stale local storage, clear it
              if (locks[showKey]?.[seat.id] && locks[showKey][seat.id].tabId !== getTabId()) {
                delete locks[showKey][seat.id];
                locksChanged = true;
              }
            } else if (seat.status === 'BOOKED') {
              if (!booked[showKey]) booked[showKey] = {};
              booked[showKey][seat.id] = { status: 'BOOKED', bookedAt: Date.now() };
              bookedChanged = true;
            }
          });
        });
      });

      if (locksChanged) localStorage.setItem(STORAGE_KEY_LOCKS, JSON.stringify(locks));
      if (bookedChanged) localStorage.setItem(STORAGE_KEY_BOOKED, JSON.stringify(booked));
    } catch (e) {}
  },

  // Get live lock & booking statuses for all seats of a show
  getShowSeatStatuses: (showKey) => {
    const locks = getCleanLocksMap();
    const booked = getBookedSeatsMap();
    const currentTabId = getTabId();
    const currentLockToken = getTabLockToken();

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
      const isMine = lock.tabId === currentTabId || (currentLockToken && lock.lockToken === currentLockToken);
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
    const currentLockToken = getTabLockToken();
    const isMine = lock.tabId === currentTabId || (currentLockToken && lock.lockToken === currentLockToken);
    return !isMine && lock.expiresAt > Date.now();
  },

  // Check if a seat is already booked
  isSeatBooked: (showKey, seatId) => {
    const booked = getBookedSeatsMap();
    return Boolean(booked[showKey]?.[seatId]);
  },

  // Get active lock token held by current tab for a show
  getHeldToken: (showKey) => {
    return getTabLockToken();
  },

  // Attempt to atomically lock a seat for current tab
  lockSeat: async (showKey, seatId, showId, customToken) => {
    const currentTabId = getTabId();
    const lockToken = customToken || getTabLockToken();
    const locks = getCleanLocksMap();
    const booked = getBookedSeatsMap();

    // Check if already booked locally
    if (booked[showKey]?.[seatId]) {
      return { success: false, status: 409, reason: 'SEAT_ALREADY_BOOKED', message: `Seat ${seatId} has already been booked.` };
    }

    // Check if locked by another tab
    const existingLock = locks[showKey]?.[seatId];
    if (existingLock && existingLock.tabId !== currentTabId && existingLock.lockToken !== lockToken && existingLock.expiresAt > Date.now()) {
      return {
        success: false,
        status: 409,
        reason: 'SEAT_LOCKED_BY_ANOTHER_USER',
        message: `Seat ${seatId} is currently held by another customer in a different session.`
      };
    }

    // Sync with backend API if showId provided
    if (showId) {
      try {
        await bookingApi.lockSeats(showId, [seatId], currentTabId, lockToken);
      } catch (err) {
        if (err.status === 409 || err.message?.toLowerCase().includes('already booked') || err.message?.toLowerCase().includes('held by another')) {
          // Immediately record as remote lock in local storage so other UI reflects it
          const updatedLocks = getCleanLocksMap();
          if (!updatedLocks[showKey]) updatedLocks[showKey] = {};
          updatedLocks[showKey][seatId] = {
            tabId: 'remote_holder',
            lockToken: 'remote_token',
            expiresAt: Date.now() + LOCK_DURATION_MS,
            status: 'LOCKED'
          };
          localStorage.setItem(STORAGE_KEY_LOCKS, JSON.stringify(updatedLocks));
          seatLockManager.broadcastChange(showKey, { action: 'LOCK', seatId, tabId: 'remote_holder' });

          return {
            success: false,
            status: err.status || 409,
            reason: 'SEAT_ALREADY_BOOKED',
            message: err.message || `Seat ${seatId} is already booked or held by another customer.`
          };
        }
      }
    }

    // Set lock locally for this tab
    const currentLocks = getCleanLocksMap();
    if (!currentLocks[showKey]) currentLocks[showKey] = {};
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
    const currentLockToken = getTabLockToken();
    const locks = getCleanLocksMap();

    let lockToken = currentLockToken;
    if (locks[showKey]?.[seatId]) {
      const lock = locks[showKey][seatId];
      if (lock.tabId === currentTabId || lock.lockToken === currentLockToken || lock.expiresAt <= Date.now()) {
        lockToken = lock.lockToken || currentLockToken;
        delete locks[showKey][seatId];
        localStorage.setItem(STORAGE_KEY_LOCKS, JSON.stringify(locks));
      }
    }

    // Broadcast change immediately across tabs
    seatLockManager.broadcastChange(showKey, { action: 'UNLOCK', seatId, tabId: currentTabId });

    // Release seat lock in database immediately
    if (showId) {
      bookingApi.releaseSeats(showId, lockToken, [seatId]).catch(() => {});
    }

    return { success: true };
  },

  // Release all seats locked by current tab for a show
  releaseCurrentTabLocks: (showKey, showId) => {
    const currentTabId = getTabId();
    const currentLockToken = getTabLockToken();
    const locks = getCleanLocksMap();
    if (!locks[showKey]) return;

    let releasedAny = false;
    let lastToken = currentLockToken;

    Object.keys(locks[showKey]).forEach((seatId) => {
      if (locks[showKey][seatId].tabId === currentTabId || locks[showKey][seatId].lockToken === currentLockToken) {
        lastToken = locks[showKey][seatId].lockToken || lastToken;
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

  // Explicitly release seats on modal dismissal, checkout exit, or payment failure
  releaseSeats: async (showKey, showId, seatIds, customToken) => {
    const currentTabId = getTabId();
    const token = customToken || getTabLockToken();
    const locks = getCleanLocksMap();

    if (locks[showKey]) {
      if (Array.isArray(seatIds) && seatIds.length > 0) {
        seatIds.forEach((s) => {
          const sId = typeof s === 'string' ? s : s.id;
          delete locks[showKey][sId];
        });
      } else {
        delete locks[showKey];
      }
      localStorage.setItem(STORAGE_KEY_LOCKS, JSON.stringify(locks));
    }

    seatLockManager.broadcastChange(showKey, { action: 'RELEASE_SEATS', seatIds, tabId: currentTabId });

    try {
      await bookingApi.releaseSeats(showId, token, seatIds);
    } catch (e) {}

    return { success: true };
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
