const JAKARTA_TIMEZONE = "Asia/Jakarta";

export function parseDate(value: Date | string | null | undefined): Date | null {
  if (!value) {
    return null;
  }

  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatEventDate(value: Date | string | null | undefined): string {
  const parsed = parseDate(value);
  if (!parsed) {
    return "No date yet";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    timeZone: JAKARTA_TIMEZONE,
    year: "numeric",
  }).format(parsed);
}

export function formatEventTime(start: Date | string | null | undefined, end?: Date | string | null | undefined): string {
  const parsedStart = parseDate(start);
  if (!parsedStart) {
    return "Time TBD";
  }

  const formattedStart = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: JAKARTA_TIMEZONE,
  }).format(parsedStart);

  const parsedEnd = parseDate(end);
  if (!parsedEnd) {
    return formattedStart;
  }

  const formattedEnd = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: JAKARTA_TIMEZONE,
  }).format(parsedEnd);

  return `${formattedStart} - ${formattedEnd}`;
}

export function formatMonthLabel(value: Date | string): string {
  const parsed = parseDate(value);
  if (!parsed) {
    return "Unknown month";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    timeZone: JAKARTA_TIMEZONE,
    year: "numeric",
  }).format(parsed);
}
