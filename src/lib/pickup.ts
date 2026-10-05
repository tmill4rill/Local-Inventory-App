export type Hours = { open: number; close: number }; // 24h clock, whole hours

export type PickupSlot = { iso: string; label: string };
export type SlotDay = { key: string; label: string; slots: PickupSlot[] };

const HOUR_MS = 60 * 60 * 1000;

function dayLabel(date: Date, today: Date): string {
  const diff = Math.round(
    (new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() -
      new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) /
      (24 * HOUR_MS),
  );
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

export function formatHour(hour: number): string {
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h}${hour < 12 || hour === 24 ? 'am' : 'pm'}`;
}

/**
 * Hourly pickup slots across the next `days` days. A slot must start at least
 * `leadHours` from `now` (the store needs time to pull the order) and end by closing.
 */
export function generateSlots(hours: Hours, now: Date, days = 3, leadHours = 2): SlotDay[] {
  const earliest = now.getTime() + leadHours * HOUR_MS;
  const result: SlotDay[] = [];
  for (let d = 0; d < days; d++) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d);
    const slots: PickupSlot[] = [];
    for (let h = hours.open; h < hours.close; h++) {
      const start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), h);
      if (start.getTime() < earliest) continue;
      slots.push({ iso: start.toISOString(), label: formatHour(h) });
    }
    if (slots.length) {
      result.push({ key: day.toDateString(), label: dayLabel(day, now), slots });
    }
  }
  return result;
}

export function formatSlot(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  return `${dayLabel(date, now)}, ${formatHour(date.getHours())}`;
}

export function isOpenNow(hours: Hours, now: Date = new Date()): boolean {
  const h = now.getHours();
  return h >= hours.open && h < hours.close;
}

const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no 0/O/1/I/L

export function makePickupCode(random: () => number = Math.random): string {
  let out = '';
  for (let i = 0; i < 5; i++) out += CODE_ALPHABET[Math.floor(random() * CODE_ALPHABET.length)];
  return `LP-${out}`;
}
