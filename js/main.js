// Auto-refresh every 10 minutes for kiosk display
const REFRESH_INTERVAL_MS = 10 * 60 * 1000;

setTimeout(function() {
  location.reload();
}, REFRESH_INTERVAL_MS);
