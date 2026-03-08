const API_KEY = 'AIzaSyD2Mkerhq7MqClIdEuxFnLMoJGRkerE5Mo';
const OPEN_HOURS_CAL = 'c_ce674574ced32a95fd95e1e5c6b5db66ffc11e188c433ac79a4ed57544d35543@group.calendar.google.com';
const EVENTS_CAL = 'eugenemakerspace@gmail.com';

const REFRESH_INTERVAL_MS = 10 * 60 * 1000;

async function fetchEvents(calendarId, timeMin, timeMax) {
  const params = new URLSearchParams({
    key: API_KEY,
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '50',
  });
  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params}`;
  const resp = await fetch(url);
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error?.message || `HTTP ${resp.status}`);
  return data;
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

function getKeyFromDate(date) {
  const d = new Date(date.getTime());
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

function buildDaySequence() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = [];
  for (let i = -1; i <= 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
}

function fmtTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function fmtDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function createElem(name, cssClass, content = null) {
  let elem = document.createElement(name);
  let classList = Array.isArray(cssClass) ? cssClass : [cssClass];
  elem.classList.add(...classList);
  if (content !== null) {
    elem.textContent = content;
  }
  return elem;
}

function createEventElement(event) {
  const isAllDay = !!event.start.date;
  const eventDate = new Date(isAllDay ? event.start.date : event.start.dateTime);
  const timeStr = isAllDay
    ? fmtDate(event.start.date)
    : `${fmtTime(event.start.dateTime)} - ${fmtTime(event.end.dateTime)}`;
  const eventHoursOffset = eventDate.getHours() + Math.round(eventDate.getMinutes() / 60);

  const container = createElem("div", "event");
  container.dataset.hourOffset = eventHoursOffset;
  container.style.gridRow = eventHoursOffset + 1;
  const summary = createElem("div", "summary", event.summary || '(no title)');
  const time = createElem("div", "time", timeStr);
  container.appendChild(summary);
  container.appendChild(time);
  return container;
}

function renderDayItem(elem, { date, isToday, isPast } = {}) {
  const dateKey = date ? getKeyFromDate(date): "-";
  const label = date ? date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) : ""

  elem.classList.toggle('is-today', isToday);
  elem.classList.toggle('is-past', isPast);
  elem.dataset.date = dateKey;
  elem.querySelector(".day-date").textContent = `${label}`;
  elem.querySelector(".day-events").textContent = "";
  elem.querySelector(".day-open-hours").textContent = "";
}

function renderDayList() {
  const sectionElement = document.getElementById("day-list-container");
  const listElement = sectionElement.querySelector(".day-list");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = buildDaySequence();
  const dayElements = Array.from(listElement.children);

  dayElements.forEach((dayItem, index) => {
    const day = index >= days.length ? null : days[index];
    renderDayItem(dayItem, {
      date: day,
      isToday: isSameDay(day, today),
      isPast: day < today,
    });
  });
}

function renderEvents(events, columnSelector) {
  const listElement = document.querySelector("#day-list-container .day-list");

  for (let e of events) {
    const startDayDate = new Date(e.start.date || e.start.dateTime);

    const dateKey = getKeyFromDate(startDayDate);
    const dayElement = listElement.querySelector(`[data-date="${dateKey}"]`);
    if (!dayElement) {
      console.warn("No day list item found for event on date:", dateKey);
      continue;
    }
    let eventDetail = createEventElement(e);

    dayElement.querySelector(columnSelector).appendChild(eventDetail);
    dayElement.classList.toggle('empty', false);
  }
}

async function loadAll() {
  const now = new Date();
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
// setInterval(loadAll, REFRESH_INTERVAL_MS);
