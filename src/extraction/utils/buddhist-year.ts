/**
 * Utility for converting Thai Buddhist Era (พ.ศ.) date-time strings to ISO 8601 (Asia/Bangkok, +07:00).
 * Thai bank transfer slips commonly express dates using Buddhist Era (พ.ศ. = ค.ศ. + 543).
 */

const THAI_MONTH_MAP: Record<string, number> = {
  // Abbreviations with dots or without dots
  'ม.ค.': 1, 'ม.ค': 1, 'มค': 1, 'มกราคม': 1, 'jan': 1, 'january': 1,
  'ก.พ.': 2, 'ก.พ': 2, 'กพ': 2, 'กุมภาพันธ์': 2, 'feb': 2, 'february': 2,
  'มี.ค.': 3, 'มี.ค': 3, 'มีค': 3, 'มีนาคม': 3, 'mar': 3, 'march': 3,
  'เม.ย.': 4, 'เม.ย': 4, 'เมย': 4, 'เมษายน': 4, 'apr': 4, 'april': 4,
  'พ.ค.': 5, 'พ.ค': 5, 'พค': 5, 'พฤษภาคม': 5, 'may': 5,
  'มิ.ย.': 6, 'มิ.ย': 6, 'มิย': 6, 'มิถุนายน': 6, 'jun': 6, 'june': 6,
  'ก.ค.': 7, 'ก.ค': 7, 'กค': 7, 'กรกฎาคม': 7, 'jul': 7, 'july': 7,
  'ส.ค.': 8, 'ส.ค': 8, 'สค': 8, 'สิงหาคม': 8, 'aug': 8, 'august': 8,
  'ก.ย.': 9, 'ก.ย': 9, 'กย': 9, 'กันยายน': 9, 'sep': 9, 'september': 9,
  'ต.ค.': 10, 'ต.ค': 10, 'ตค': 10, 'ตุลาคม': 10, 'oct': 10, 'october': 10,
  'พ.ย.': 11, 'พ.ย': 11, 'พย': 11, 'พฤศจิกายน': 11, 'nov': 11, 'november': 11,
  'ธ.ค.': 12, 'ธ.ค': 12, 'ธค': 12, 'ธันวาคม': 12, 'dec': 12, 'december': 12,
};

/**
 * Converts Buddhist Year to Gregorian Year if necessary.
 * e.g. 2567 -> 2024, 2568 -> 2025
 */
export function convertBuddhistYearToGregorian(year: number): number {
  if (year >= 2400 && year <= 2700) {
    return year - 543;
  }
  // 2-digit BE year (e.g. 67 -> 2567 -> 2024)
  if (year >= 40 && year <= 99) {
    return (year + 2500) - 543;
  }
  return year;
}

/**
 * Parses and formats any Thai or standard datetime string to ISO 8601 with Asia/Bangkok timezone offset (+07:00).
 */
export function parseThaiDateTimeToIso(input: string): string {
  if (!input || typeof input !== 'string') {
    throw new Error('Invalid datetime input: input is empty');
  }

  const clean = input.trim().replace(/\s+/g, ' ');

  // Case 1: Standard ISO format e.g. 2567-10-14T14:30:00 or 2024-10-14T14:30:00+07:00
  const isoMatch = clean.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T\s](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?(?:\.\d+)?(?:Z|([+-]\d{2}:?\d{2}))?$/i);
  if (isoMatch) {
    let year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10);
    const day = parseInt(isoMatch[3], 10);
    const hour = parseInt(isoMatch[4] || '0', 10);
    const minute = parseInt(isoMatch[5] || '0', 10);
    const second = parseInt(isoMatch[6] || '0', 10);

    year = convertBuddhistYearToGregorian(year);

    return formatIsoBangkok(year, month, day, hour, minute, second);
  }

  // Case 2: Slash/dash delimited with Day first, e.g. "14/10/2567 14:30:00" or "14-10-2567 14:30"
  const dmyMatch = clean.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})(?:[,\s]+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10);
    let year = parseInt(dmyMatch[3], 10);
    const hour = parseInt(dmyMatch[4] || '0', 10);
    const minute = parseInt(dmyMatch[5] || '0', 10);
    const second = parseInt(dmyMatch[6] || '0', 10);

    year = convertBuddhistYearToGregorian(year);

    return formatIsoBangkok(year, month, day, hour, minute, second);
  }

  // Case 3: Thai text format with month name e.g. "14 ต.ค. 2567 14:30:00" or "14 ตุลาคม 2567 เวลา 14:30 น."
  // Strip words like "เวลา", "น.", "พ.ศ."
  const sanitized = clean
    .replace(/พ\.ศ\./g, '')
    .replace(/พ\.ศ/g, '')
    .replace(/เวลา/g, '')
    .replace(/น\./g, '')
    .trim();

  // Pattern: day (1-31), month name, year (2-4 digits), optional time HH:mm[:ss]
  const thaiTextMatch = sanitized.match(/^(\d{1,2})\s+([^\s\d]+)\s+(\d{2,4})(?:[,\s]+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/i);
  if (thaiTextMatch) {
    const day = parseInt(thaiTextMatch[1], 10);
    const monthStr = thaiTextMatch[2].toLowerCase();
    let year = parseInt(thaiTextMatch[3], 10);
    const hour = parseInt(thaiTextMatch[4] || '0', 10);
    const minute = parseInt(thaiTextMatch[5] || '0', 10);
    const second = parseInt(thaiTextMatch[6] || '0', 10);

    const month = THAI_MONTH_MAP[monthStr];
    if (!month) {
      throw new Error(`Unknown month string: ${monthStr}`);
    }

    year = convertBuddhistYearToGregorian(year);

    return formatIsoBangkok(year, month, day, hour, minute, second);
  }

  // Fallback: try Date.parse
  const parsedTimestamp = Date.parse(clean);
  if (!isNaN(parsedTimestamp)) {
    const d = new Date(parsedTimestamp);
    let year = d.getFullYear();
    year = convertBuddhistYearToGregorian(year);
    return formatIsoBangkok(
      year,
      d.getMonth() + 1,
      d.getDate(),
      d.getHours(),
      d.getMinutes(),
      d.getSeconds(),
    );
  }

  throw new Error(`Unable to parse datetime: "${input}"`);
}

function padZero(num: number): string {
  return num < 10 ? `0${num}` : `${num}`;
}

function formatIsoBangkok(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
): string {
  if (month < 1 || month > 12) {
    throw new Error(`Invalid month: ${month}`);
  }
  if (day < 1 || day > 31) {
    throw new Error(`Invalid day: ${day}`);
  }
  return `${year}-${padZero(month)}-${padZero(day)}T${padZero(hour)}:${padZero(minute)}:${padZero(second)}+07:00`;
}
