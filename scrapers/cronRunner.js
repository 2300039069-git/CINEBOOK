/**
 * ============================================================================
 * BookMyShow (BMS) Background Scheduled Cron Runner
 * ============================================================================
 * Periodically executes bmsScraper for all target cities in the background.
 * Ensures the API server responds instantly from disk cache with zero lag.
 *
 * Usage:
 *  - One-time batch refresh:  node scrapers/cronRunner.js --once
 *  - Continuous cron daemon:   node scrapers/cronRunner.js --interval=30
 * ============================================================================
 */

const { scrapeBMS } = require('./bmsScraper');

const TARGET_CITIES = ['guntur', 'vijayawada', 'tenali', 'hyderabad'];
const DEFAULT_INTERVAL_MINUTES = 30;

// Parse CLI flags
const isOnce = process.argv.includes('--once');
const intervalArg = process.argv.find(arg => arg.startsWith('--interval='));
const intervalMinutes = intervalArg
  ? parseInt(intervalArg.split('=')[1], 10)
  : DEFAULT_INTERVAL_MINUTES;

async function runScheduledBatch() {
  console.log(`\n⏰ [Cron Runner] Starting scheduled scrape batch at ${new Date().toISOString()}...`);
  console.log(`🎯 Target Cities: [${TARGET_CITIES.join(', ')}]`);

  for (const city of TARGET_CITIES) {
    try {
      console.log(`⏳ Refreshing cache for: ${city.toUpperCase()}...`);
      const result = await scrapeBMS(city);
      console.log(`   ✓ ${city.toUpperCase()}: ${result.totalMovies} movies, ${result.totalTheatres} theatres updated.`);
    } catch (err) {
      console.error(`   ✕ Failed to update ${city}:`, err.message);
    }
  }

  console.log(`✨ [Cron Runner] Batch complete! All JSON caches are warm.\n`);
}

// Execution Entrypoint
if (isOnce) {
  runScheduledBatch()
    .then(() => process.exit(0))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
} else {
  console.log(`🚀 [Cron Runner] Background daemon started. Running every ${intervalMinutes} minutes.`);
  runScheduledBatch();

  setInterval(runScheduledBatch, intervalMinutes * 60 * 1000);
}

module.exports = {
  runScheduledBatch,
  TARGET_CITIES
};
