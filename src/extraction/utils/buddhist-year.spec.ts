import {
  convertBuddhistYearToGregorian,
  parseThaiDateTimeToIso,
} from './buddhist-year';

describe('buddhist-year conversion', () => {
  describe('convertBuddhistYearToGregorian', () => {
    it('should subtract 543 for 4-digit Buddhist years', () => {
      expect(convertBuddhistYearToGregorian(2567)).toBe(2024);
      expect(convertBuddhistYearToGregorian(2568)).toBe(2025);
      expect(convertBuddhistYearToGregorian(2569)).toBe(2026);
    });

    it('should convert 2-digit Buddhist years', () => {
      expect(convertBuddhistYearToGregorian(67)).toBe(2024);
      expect(convertBuddhistYearToGregorian(68)).toBe(2025);
    });

    it('should leave already Gregorian years unchanged', () => {
      expect(convertBuddhistYearToGregorian(2024)).toBe(2024);
      expect(convertBuddhistYearToGregorian(2026)).toBe(2026);
    });
  });

  describe('parseThaiDateTimeToIso', () => {
    it('should parse ISO date with Buddhist Year and convert to Gregorian +07:00', () => {
      const result = parseThaiDateTimeToIso('2567-10-14T14:30:25+07:00');
      expect(result).toBe('2024-10-14T14:30:25+07:00');
    });

    it('should parse ISO date that is already in Gregorian Year', () => {
      const result = parseThaiDateTimeToIso('2024-10-14T14:30:25+07:00');
      expect(result).toBe('2024-10-14T14:30:25+07:00');
    });

    it('should parse Thai textual date with month abbreviation and time', () => {
      const result = parseThaiDateTimeToIso('14 ต.ค. 2567 14:30:00');
      expect(result).toBe('2024-10-14T14:30:00+07:00');
    });

    it('should parse Thai full month name with "เวลา" and "น."', () => {
      const result = parseThaiDateTimeToIso('14 ตุลาคม 2567 เวลา 14:30 น.');
      expect(result).toBe('2024-10-14T14:30:00+07:00');
    });

    it('should parse slash delimited Thai date (DD/MM/YYYY)', () => {
      const result = parseThaiDateTimeToIso('14/10/2567 09:15');
      expect(result).toBe('2024-10-14T09:15:00+07:00');
    });

    it('should parse date with 2-digit BE year (e.g. 14 ต.ค. 67)', () => {
      const result = parseThaiDateTimeToIso('14 ต.ค. 67 10:20:30');
      expect(result).toBe('2024-10-14T10:20:30+07:00');
    });

    it('should throw error for invalid datetime string', () => {
      expect(() => parseThaiDateTimeToIso('invalid-date')).toThrow();
    });
  });
});
