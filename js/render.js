import { isSameDay, getKeyFromDate, buildDaySequence, fmtTime, fmtDate } from './date-utils.js';

function createElem(name, cssClass, content = null) {
  let elem = document.createElement(name);
  let classList = Array.isArray(cssClass) ? cssClass : [cssClass];
  elem.classList.add(...classList);
  if (content !== null) {
    elem.textContent = content;
  }
  return elem;
}

export function createEventElement(event) {
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
  const dateKey = date ? getKeyFromDate(date) : "-";
  const label = date ? date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) : "";

  elem.classList.toggle('is-today', isToday);
  elem.classList.toggle('is-past', isPast);
  elem.dataset.date = dateKey;
  elem.querySelector(".day-date").textContent = `${label}`;
  elem.querySelector(".day-events").textContent = "";
  elem.querySelector(".day-open-hours").textContent = "";
}

export function renderDayList() {
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

export function renderEvents(events, columnSelector) {
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
