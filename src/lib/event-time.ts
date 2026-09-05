export function isEventTime(value: unknown): value is string {
  return typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function toEventTime(hour: string, minute: string, period: string): string | null {
  if (!/^(?:[1-9]|1[0-2])$/.test(hour) || !/^[0-5]\d$/.test(minute)
    || (period !== "AM" && period !== "PM")) return null;
  const hour24 = Number(hour) % 12 + (period === "PM" ? 12 : 0);
  return `${String(hour24).padStart(2, "0")}:${minute}`;
}

export function setupArrivalTime(time: string): string {
  const [hour, minute] = time.split(":").map(Number);
  const arrivalHour = (hour + 23) % 24;
  return `${arrivalHour % 12 || 12}:${String(minute).padStart(2, "0")} ${arrivalHour >= 12 ? "PM" : "AM"}`;
}
