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
 * Extracts the last 4 digits from an account string (handles masked digits like xxx-x-x1234 or 1234).
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
 * Checks if a party (sender or receiver) matches an own account.
 */
export function matchesOwnAccount(party: PartyInfo, account: OwnAccount): boolean {
  const partyAccountLast4 = extractLast4Digits(party.account);
  const ownAccountLast4 = extractLast4Digits(account.account_number_last4);

  // If last 4 digits match and both have at least 4 digits
  if (partyAccountLast4 && ownAccountLast4 && partyAccountLast4.length === 4 && ownAccountLast4.length === 4) {
    if (partyAccountLast4 === ownAccountLast4) {
      return true;
    }
  }

  // Fuzzy name match
  const normalizedPartyName = normalizePartyName(party.name);
  const normalizedOwnName = normalizePartyName(account.account_name);

  if (normalizedPartyName && normalizedOwnName) {
    // Exact or substring match (ignoring titles and extra spaces)
    if (
      normalizedPartyName === normalizedOwnName ||
      normalizedPartyName.includes(normalizedOwnName) ||
      normalizedOwnName.includes(normalizedPartyName)
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
