import {
  determineTransactionType,
  extractLast4Digits,
  matchesOwnAccount,
  normalizePartyName,
  OwnAccount,
} from './account-matcher';

describe('account-matcher', () => {
  const ownAccounts: OwnAccount[] = [
    {
      bank_name: 'KBank',
      account_name: 'นายสมชาย สายลม',
      account_number_last4: '1234',
    },
    {
      bank_name: 'SCB',
      account_name: 'สมหญิง จริงใจ',
      account_number_last4: '5678',
    },
  ];

  describe('normalizePartyName', () => {
    it('should strip Thai prefixes like นาย, นาง, นางสาว', () => {
      expect(normalizePartyName('นายสมชาย')).toBe('สมชาย');
      expect(normalizePartyName('นางสมหญิง')).toBe('สมหญิง');
      expect(normalizePartyName('นางสาวดวงใจ')).toBe('ดวงใจ');
      expect(normalizePartyName('น.ส. ดวงใจ')).toBe('ดวงใจ');
    });

    it('should strip English prefixes like Mr, Mrs, Ms, Miss', () => {
      expect(normalizePartyName('Mr. Somchai')).toBe('somchai');
      expect(normalizePartyName('Mrs. Somying')).toBe('somying');
      expect(normalizePartyName('Ms. Duangjai')).toBe('duangjai');
      expect(normalizePartyName('Miss Alice')).toBe('alice');
    });

    it('should handle extra whitespace and special characters', () => {
      expect(normalizePartyName('  นาย   สมชาย   สายลม  ')).toBe('สมชาย สายลม');
      expect(normalizePartyName('Mr. John (Doe)')).toBe('john doe');
    });
  });

  describe('extractLast4Digits', () => {
    it('should extract last 4 digits from masked account numbers', () => {
      expect(extractLast4Digits('xxx-x-x1234')).toBe('1234');
      expect(extractLast4Digits('012-3-45678-9')).toBe('6789');
      expect(extractLast4Digits('1234')).toBe('1234');
    });

    it('should handle short strings or null', () => {
      expect(extractLast4Digits('12')).toBe('12');
      expect(extractLast4Digits(null)).toBe('');
      expect(extractLast4Digits(undefined)).toBe('');
    });
  });

  describe('matchesOwnAccount', () => {
    it('should match when last 4 digits of account match', () => {
      const match = matchesOwnAccount(
        { name: 'ใครบางคน', account: 'xxx-x-x1234' },
        ownAccounts[0],
      );
      expect(match).toBe(true);
    });

    it('should match when normalized name matches without title', () => {
      const match = matchesOwnAccount(
        { name: 'สมชาย สายลม', account: 'xxx-x-x9999' },
        ownAccounts[0],
      );
      expect(match).toBe(true);
    });

    it('should not match when neither account nor name match', () => {
      const match = matchesOwnAccount(
        { name: 'นายอานนท์ มีทรัพย์', account: 'xxx-x-x0000' },
        ownAccounts[0],
      );
      expect(match).toBe(false);
    });
  });

  describe('determineTransactionType', () => {
    it('should classify as expense when sender matches own account', () => {
      const result = determineTransactionType(
        { name: 'นายสมชาย สายลม', account: 'xxx-x-x1234' },
        { name: 'ร้านเซเว่น อีเลฟเว่น', account: 'xxx-x-x9999' },
        ownAccounts,
      );

      expect(result.type).toBe('expense');
      expect(result.needs_type_review).toBe(false);
      expect(result.matched_side).toBe('sender');
    });

    it('should classify as income when receiver matches own account', () => {
      const result = determineTransactionType(
        { name: 'บจก. เพย์โรล จำกัด', account: 'xxx-x-x8888' },
        { name: 'นางสาว สมหญิง จริงใจ', account: 'xxx-x-x5678' },
        ownAccounts,
      );

      expect(result.type).toBe('income');
      expect(result.needs_type_review).toBe(false);
      expect(result.matched_side).toBe('receiver');
    });

    it('should default to expense and flag needs_type_review when neither matches', () => {
      const result = determineTransactionType(
        { name: 'บุคคลภายนอก A', account: 'xxx-x-x1111' },
        { name: 'บุคคลภายนอก B', account: 'xxx-x-x2222' },
        ownAccounts,
      );

      expect(result.type).toBe('expense');
      expect(result.needs_type_review).toBe(true);
      expect(result.matched_side).toBe('none');
    });

    it('should handle case when user has no registered accounts', () => {
      const result = determineTransactionType(
        { name: 'สมชาย', account: '1234' },
        { name: 'ร้านค้า', account: '5678' },
        [],
      );

      expect(result.type).toBe('expense');
      expect(result.needs_type_review).toBe(true);
    });
  });
});
