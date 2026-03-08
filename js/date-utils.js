export function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

export function getKeyFromDate(date) {
  const d = new Date(date.getTime());
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

export function buildDaySequence() {
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

export function fmtTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function fmtDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}
