import {
  determineTransactionType,
  extractLast4Digits,
  extractSlipAccountDigits,
  isAccountNumberMatching,
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
    {
      bank_name: 'Bangkok Bank',
      account_name: 'สมเกียรติ ยิ่งเจริญ',
      account_number_last4: '1234567890', // registered with full 10-digit account
    },
  ];

  describe('normalizePartyName', () => {
    it('should strip Thai prefixes like นาย, นาง, นางสาว, น.ส.', () => {
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

  describe('extractSlipAccountDigits', () => {
    it('should extract visible digits and trailing mask for KBank (xxx-x-x6789-x)', () => {
      const res = extractSlipAccountDigits('xxx-x-x6789-x');
      expect(res.visibleDigits).toBe('6789');
      expect(res.hasTrailingMask).toBe(true);
    });

    it('should extract visible digits and no trailing mask for SCB (xxx-xxx789-0)', () => {
      const res = extractSlipAccountDigits('xxx-xxx789-0');
      expect(res.visibleDigits).toBe('7890');
      expect(res.hasTrailingMask).toBe(false);
    });

    it('should extract visible digits and no trailing mask for Krungthai (xxx-x-xx789-0)', () => {
      const res = extractSlipAccountDigits('xxx-x-xx789-0');
      expect(res.visibleDigits).toBe('7890');
      expect(res.hasTrailingMask).toBe(false);
    });

    it('should extract 3 visible digits and trailing mask for Bangkok Bank (xxx-x-xx789-x)', () => {
      const res = extractSlipAccountDigits('xxx-x-xx789-x');
      expect(res.visibleDigits).toBe('789');
      expect(res.hasTrailingMask).toBe(true);
    });

    it('should extract visible digits for TTB (xxx-x-x1234-x)', () => {
      const res = extractSlipAccountDigits('xxx-x-x1234-x');
      expect(res.visibleDigits).toBe('1234');
      expect(res.hasTrailingMask).toBe(true);
    });

    it('should extract visible digits ignoring branch code for GSB (020-x-xxxx78-9)', () => {
      const res = extractSlipAccountDigits('020-x-xxxx78-9');
      expect(res.visibleDigits).toBe('789');
      expect(res.hasTrailingMask).toBe(false);
    });

    it('should extract visible digits for PromptPay Citizen ID (x-xxxx-xxxxx-12-3)', () => {
      const res = extractSlipAccountDigits('x-xxxx-xxxxx-12-3');
      expect(res.visibleDigits).toBe('123');
      expect(res.hasTrailingMask).toBe(false);
    });

    it('should extract visible digits for PromptPay Mobile (xxx-xxx-5678 and 081-xxx-5678)', () => {
      const res1 = extractSlipAccountDigits('xxx-xxx-5678');
      expect(res1.visibleDigits).toBe('5678');
      expect(res1.hasTrailingMask).toBe(false);

      const res2 = extractSlipAccountDigits('081-xxx-5678');
      expect(res2.visibleDigits).toBe('5678');
      expect(res2.hasTrailingMask).toBe(false);
    });

    it('should handle unmasked digits (1234)', () => {
      const res = extractSlipAccountDigits('1234');
      expect(res.visibleDigits).toBe('1234');
      expect(res.hasTrailingMask).toBe(false);
    });
  });

  describe('isAccountNumberMatching', () => {
    describe('KBank slip format (xxx-x-x6789-x)', () => {
      const slip = 'xxx-x-x6789-x';

      it('matches when user registers exact 4 visible digits (6789)', () => {
        expect(isAccountNumberMatching('6789', slip)).toBe(true);
      });

      it('matches when user registers true last 4 digits (7890) via 3-digit overlap', () => {
        expect(isAccountNumberMatching('7890', slip)).toBe(true);
      });

      it('matches when user registers full 10-digit account (1234567890)', () => {
        expect(isAccountNumberMatching('1234567890', slip)).toBe(true);
      });

      it('does not match unrelated account digits', () => {
        expect(isAccountNumberMatching('9999', slip)).toBe(false);
        expect(isAccountNumberMatching('1111', slip)).toBe(false);
      });
    });

    describe('SCB and Krungthai slip format (xxx-xxx789-0, xxx-x-xx789-0)', () => {
      const scbSlip = 'xxx-xxx789-0';
      const ktbSlip = 'xxx-x-xx789-0';

      it('matches when user registers last 4 digits (7890)', () => {
        expect(isAccountNumberMatching('7890', scbSlip)).toBe(true);
        expect(isAccountNumberMatching('7890', ktbSlip)).toBe(true);
      });

      it('matches when user registers full 10-digit account (1234567890)', () => {
        expect(isAccountNumberMatching('1234567890', scbSlip)).toBe(true);
        expect(isAccountNumberMatching('1234567890', ktbSlip)).toBe(true);
      });

      it('does not match incorrect digits', () => {
        expect(isAccountNumberMatching('1234', scbSlip)).toBe(false);
      });
    });

    describe('Bangkok Bank slip format (xxx-x-xx789-x)', () => {
      const bblSlip = 'xxx-x-xx789-x';

      it('matches when user registers 3 visible digits (789)', () => {
        expect(isAccountNumberMatching('789', bblSlip)).toBe(true);
      });

      it('matches when user registers true last 4 digits (7890)', () => {
        expect(isAccountNumberMatching('7890', bblSlip)).toBe(true);
      });

      it('matches when user registers full 10-digit account (1234567890)', () => {
        expect(isAccountNumberMatching('1234567890', bblSlip)).toBe(true);
      });
    });

    describe('GSB slip format (020-x-xxxx78-9)', () => {
      const gsbSlip = '020-x-xxxx78-9';

      it('matches when user registers 3 visible digits (789)', () => {
        expect(isAccountNumberMatching('789', gsbSlip)).toBe(true);
      });

      it('matches when user registers true last 4 digits (6789)', () => {
        expect(isAccountNumberMatching('6789', gsbSlip)).toBe(true);
      });

      it('matches when user registers 12-digit full account (020123456789)', () => {
        expect(isAccountNumberMatching('020123456789', gsbSlip)).toBe(true);
      });
    });

    describe('PromptPay formats', () => {
      it('matches PromptPay Citizen ID (x-xxxx-xxxxx-12-3)', () => {
        const idSlip = 'x-xxxx-xxxxx-12-3';
        expect(isAccountNumberMatching('123', idSlip)).toBe(true);
        expect(isAccountNumberMatching('0123', idSlip)).toBe(true);
        expect(isAccountNumberMatching('1234567890123', idSlip)).toBe(true);
      });

      it('matches PromptPay Mobile (xxx-xxx-5678)', () => {
        const phoneSlip = 'xxx-xxx-5678';
        expect(isAccountNumberMatching('5678', phoneSlip)).toBe(true);
        expect(isAccountNumberMatching('0812345678', phoneSlip)).toBe(true);
      });
    });
  });

  describe('extractLast4Digits (legacy compatibility)', () => {
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
    it('should match when account digits match (KBank slip)', () => {
      const match = matchesOwnAccount(
        { name: 'ใครบางคน', account: 'xxx-x-x1234-x' },
        ownAccounts[0],
      );
      expect(match).toBe(true);
    });

    it('should match when full 10-digit registered account matches Bangkok Bank slip', () => {
      const match = matchesOwnAccount(
        { name: 'ร้านค้า', account: 'xxx-x-xx789-x' },
        ownAccounts[2], // registered with '1234567890'
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
        { name: 'นายสมชาย สายลม', account: 'xxx-x-x1234-x' },
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
        { name: 'นางสาว สมหญิง จริงใจ', account: 'xxx-xxx567-8' },
        ownAccounts,
      );

      expect(result.type).toBe('income');
      expect(result.needs_type_review).toBe(false);
      expect(result.matched_side).toBe('receiver');
    });

    it('should detect internal transfer when both sender and receiver match own accounts', () => {
      const result = determineTransactionType(
        { name: 'สมชาย สายลม', account: 'xxx-x-x1234-x' },
        { name: 'สมหญิง จริงใจ', account: 'xxx-xxx567-8' },
        ownAccounts,
      );

      expect(result.type).toBe('expense');
      expect(result.needs_type_review).toBe(true);
      expect(result.matched_side).toBe('both');
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

