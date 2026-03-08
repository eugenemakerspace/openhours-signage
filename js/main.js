import { OPEN_HOURS_CAL, EVENTS_CAL, REFRESH_INTERVAL_MS } from './config.js';
import { fetchEvents } from './calendar-api.js';
import { buildDaySequence } from './date-utils.js';
import { renderDayList, renderEvents } from './render.js';

async function loadAll() {
  const days = buildDaySequence();
  const timeMin = days[0];
  const timeMax = days[days.length - 1];

  renderDayList();

  const results = await Promise.allSettled([
    fetchEvents(OPEN_HOURS_CAL, timeMin, timeMax),
    fetchEvents(EVENTS_CAL, timeMin, timeMax),
  ]);

  if (results[0].status === 'fulfilled') {
    renderEvents(results[0].value.items || [], '.day-open-hours');
  } else {
    console.error("Open Hours fetch failed:", results[0].reason.message);
  }

  if (results[1].status === 'fulfilled') {
    renderEvents(results[1].value.items || [], '.day-events');
  } else {
    console.error("Events fetch failed:", results[1].reason.message);
  }
}

// Initial load
loadAll();

// Refresh periodically
window.refreshTimer = new (class {
  timerId = null;
  intervalMs = REFRESH_INTERVAL_MS;
  constructor() {
    if (this.intervalMs) {
      Promise.resolve().then(() => this.start());
    }
  }
  start() {
    this.stop();
    this.timerId = setInterval(() => loadAll(), this.intervalMs);
  }
  stop() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }
})();
