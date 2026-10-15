export interface OwnAccount {
  id?: string;
  bank_name: string;
  account_name: string;
  account_number_last4: string;
}

export interface PartyInfo {
  name?: string | null;
  account?: string | null;
}

export interface TypeDetectionResult {
  type: 'income' | 'expense';
  needs_type_review: boolean;
  matched_side?: 'sender' | 'receiver' | 'both' | 'none';
  matched_account?: OwnAccount;
}

export interface SlipAccountDigits {
  visibleDigits: string;
  hasTrailingMask: boolean;
  rawDigits: string;
}

/**
 * Normalizes party names by removing Thai and English titles, punctuation, and extra spaces.
 */
export function normalizePartyName(name: string | null | undefined): string {
  if (!name) return '';

  let normalized = name.trim().toLowerCase();

  // Strip prefixes / titles
  const prefixes = [
    // Thai prefixes
    'นางสาว', 'นาง', 'นาย', 'น.ส.', 'น.ส', 'ด.ช.', 'ด.ญ.',
    'บจก.', 'บมจ.', 'หจก.',
    // English prefixes
    'mr.', 'mr ', 'mrs.', 'mrs ', 'ms.', 'ms ', 'miss ',
  ];

  for (const prefix of prefixes) {
    if (normalized.startsWith(prefix)) {
      normalized = normalized.substring(prefix.length).trim();
    }
  }

  // Remove common punctuation and compress spaces
  return normalized
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts visible significant digits and masking characteristics from a bank/wallet slip account string.
 * Supports patterns from all major Thai financial institutions:
 * - KBank / TTB: xxx-x-x6789-x -> visibleDigits: '6789', hasTrailingMask: true
 * - SCB / Krungthai: xxx-xxx789-0, xxx-x-xx789-0 -> visibleDigits: '7890', hasTrailingMask: false
 * - Bangkok Bank: xxx-x-xx789-x -> visibleDigits: '789', hasTrailingMask: true
 * - GSB: 020-x-xxxx78-9 -> visibleDigits: '789', hasTrailingMask: false
 * - PromptPay ID: x-xxxx-xxxxx-12-3 -> visibleDigits: '123', hasTrailingMask: false
 * - PromptPay Mobile: xxx-xxx-5678, 081-xxx-5678 -> visibleDigits: '5678', hasTrailingMask: false
 */
export function extractSlipAccountDigits(account: string | null | undefined): SlipAccountDigits {
  if (!account) {
    return { visibleDigits: '', hasTrailingMask: false, rawDigits: '' };
  }

  const trimmed = account.trim();
  const rawDigits = trimmed.replace(/\D/g, '');

  // Check if slip ends with a masked character (e.g. -x, -X, -*, x, X, *)
  const hasTrailingMask = /[-_/]?[xX*•]\s*$/.test(trimmed);

  // Remove trailing masked character and separators to inspect the visible cluster
  const withoutTrailingMask = trimmed.replace(/[-_/]?[xX*•]+\s*$/, '');

  // Find the last occurrence of any mask character [xX*•]
  const lastMaskIndex = Math.max(
    withoutTrailingMask.lastIndexOf('x'),
    withoutTrailingMask.lastIndexOf('X'),
    withoutTrailingMask.lastIndexOf('*'),
    withoutTrailingMask.lastIndexOf('•'),
  );

  let visibleDigits = '';
  if (lastMaskIndex !== -1) {
    // Extract only digits occurring after the last mask character
    const afterLastMask = withoutTrailingMask.substring(lastMaskIndex + 1);
    visibleDigits = afterLastMask.replace(/\D/g, '');
  } else {
    // No mask character found, take all digits
    visibleDigits = withoutTrailingMask.replace(/\D/g, '');
  }

  // Fallback: if visibleDigits is empty, take rawDigits (or last 4 digits)
  if (!visibleDigits && rawDigits) {
    visibleDigits = rawDigits.length >= 4 ? rawDigits.slice(-4) : rawDigits;
  }

  return {
    visibleDigits,
    hasTrailingMask,
    rawDigits,
  };
}

/**
 * Legacy helper maintained for backward compatibility.
 * Extracts the last 4 digits from an account string.
 */
export function extractLast4Digits(account: string | null | undefined): string {
  if (!account) return '';
  const digits = account.replace(/\D/g, '');
  if (digits.length >= 4) {
    return digits.slice(-4);
  }
  return digits;
}

/**
 * Checks if a user's registered account matches a slip account number,
 * accounting for Thai bank masking offsets, check digit masking, and PromptPay formats.
 */
export function isAccountNumberMatching(
  userAccountStr: string | null | undefined,
  slipAccountStr: string | null | undefined,
): boolean {
  if (!userAccountStr || !slipAccountStr) return false;

  const userDigits = userAccountStr.replace(/\D/g, '');
  const { visibleDigits: slipDigits, hasTrailingMask, rawDigits } = extractSlipAccountDigits(slipAccountStr);

  if (!userDigits || !slipDigits) return false;

  // 1. Direct equality (e.g. user entered "6789" from KBank slip, or "789" from BBL slip)
  if (userDigits === slipDigits) {
    return true;
  }

  // 2. Full account registered (>= 8 digits, e.g. 10-digit bank account, 12-digit GSB, 13-digit citizen ID, 10-digit mobile)
  if (userDigits.length >= 8) {
    // The slip visible digits appear inside the full account number
    if (userDigits.includes(slipDigits)) {
      return true;
    }
    // Or full raw digits match tail of full account
    if (rawDigits.length >= 4 && userDigits.endsWith(rawDigits)) {
      return true;
    }
  }

  // 3. User entered 4 digits (e.g. true last 4 digits of their account "7890")
  if (userDigits.length === 4) {
    if (hasTrailingMask) {
      // Case 3a: KBank / TTB slip (xxx-x-x6789-x).
      // Last digit is masked, so slipDigits "6789" represents digits 6-9 of account.
      // User's true last 4 digits "7890" represents digits 7-10.
      // They overlap on digits 7, 8, 9 ("789")!
      if (slipDigits.length === 4) {
        if (userDigits.slice(0, 3) === slipDigits.slice(-3)) {
          return true;
        }
      }
      // Case 3b: Bangkok Bank slip (xxx-x-xx789-x).
      // Slip only displays 3 digits "789" before the trailing mask.
      // User's true last 4 digits "7890" has first 3 digits "789".
      if (slipDigits.length === 3) {
        if (userDigits.slice(0, 3) === slipDigits) {
          return true;
        }
      }
    } else {
      // Case 3c: GSB slip (020-x-xxxx78-9) or PromptPay Citizen ID (x-xxxx-xxxxx-12-3).
      // Check digit is shown at end, and slip shows 3 digits total (e.g. "789" or "123").
      // User's last 4 digits "6789" ends with "789".
      if (slipDigits.length === 3) {
        if (userDigits.slice(-3) === slipDigits) {
          return true;
        }
      }
    }
  }

  // 4. User entered 3 digits (e.g. "789")
  if (userDigits.length === 3) {
    if (hasTrailingMask && slipDigits.length === 4) {
      // User entered "789", slip shows "6789-x"
      if (slipDigits.slice(-3) === userDigits) {
        return true;
      }
    }
    if (!hasTrailingMask && slipDigits.length === 4) {
      // User entered "890", slip shows "7890"
      if (slipDigits.slice(-3) === userDigits) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Checks if a party (sender or receiver) matches an own account.
 */
export function matchesOwnAccount(party: PartyInfo, account: OwnAccount): boolean {
  // 1. Check account number match
  if (party.account && account.account_number_last4) {
    if (isAccountNumberMatching(account.account_number_last4, party.account)) {
      return true;
    }
  }

  // 2. Fuzzy name match
  const normalizedPartyName = normalizePartyName(party.name);
  const normalizedOwnName = normalizePartyName(account.account_name);

  if (normalizedPartyName && normalizedOwnName) {
    // Exact match
    if (normalizedPartyName === normalizedOwnName) {
      return true;
    }

    // Substring match (minimum length 3 characters to avoid false short matches)
    if (
      normalizedPartyName.length >= 3 &&
      normalizedOwnName.length >= 3 &&
      (normalizedPartyName.includes(normalizedOwnName) ||
        normalizedOwnName.includes(normalizedPartyName))
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Determines transaction type ('income' | 'expense') based on sender, receiver, and user's registered accounts.
 * - Sender matches -> 'expense'
 * - Receiver matches -> 'income'
 * - Neither matches -> 'expense' (needs_type_review = true)
 */
export function determineTransactionType(
  sender: PartyInfo,
  receiver: PartyInfo,
  ownAccounts: OwnAccount[],
): TypeDetectionResult {
  if (!ownAccounts || ownAccounts.length === 0) {
    return {
      type: 'expense',
      needs_type_review: true,
      matched_side: 'none',
    };
  }

  let matchedSenderAccount: OwnAccount | undefined;
  let matchedReceiverAccount: OwnAccount | undefined;

  for (const account of ownAccounts) {
    if (!matchedSenderAccount && matchesOwnAccount(sender, account)) {
      matchedSenderAccount = account;
    }
    if (!matchedReceiverAccount && matchesOwnAccount(receiver, account)) {
      matchedReceiverAccount = account;
    }
  }

  // Both match (internal transfer between user's own accounts)
  if (matchedSenderAccount && matchedReceiverAccount) {
    return {
      type: 'expense',
      needs_type_review: true,
      matched_side: 'both',
      matched_account: matchedSenderAccount,
    };
  }

  // Sender is user's account -> Expense
  if (matchedSenderAccount) {
    return {
      type: 'expense',
      needs_type_review: false,
      matched_side: 'sender',
      matched_account: matchedSenderAccount,
    };
  }

  // Receiver is user's account -> Income
  if (matchedReceiverAccount) {
    return {
      type: 'income',
      needs_type_review: false,
      matched_side: 'receiver',
      matched_account: matchedReceiverAccount,
    };
  }

  // Neither matched -> Default expense, flag for review
  return {
    type: 'expense',
    needs_type_review: true,
    matched_side: 'none',
  };
}
