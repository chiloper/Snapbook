import { RawSlipExtraction } from '../interfaces/slip-extractor.interface';
import { parseThaiDateTimeToIso } from '../utils/buddhist-year';

export interface BankTemplate {
  id: string;
  bankName: string;
  triggerKeywords: string[];
  statusKeywords: string[];
  senderAnchorKeywords: string[];
  receiverAnchorKeywords: string[];
  amountAnchorKeywords: string[];
  refAnchorKeywords: string[];
  feeAnchorKeywords: string[];
  memoAnchorKeywords: string[];
}

export const COMMON_REF_ANCHORS = [
  'หมายเลขทำรายการ',
  'เลขที่ทำรายการ',
  'รหัสทำรายการ',
  'หมายเลขอ้างอิง',
  'เลขที่รายการ',
  'รหัสอ้างอิง',
  'เลขที่อ้างอิง',
  'รหัสรายการ',
  'transaction id',
  'transaction ref',
  'ref no',
  'ref.',
  'ref',
];

export const BANK_TEMPLATES: BankTemplate[] = [
  {
    id: 'kbank',
    bankName: 'KBank',
    triggerKeywords: ['กสิกร', 'kbank', 'k plus', 'kplus', 'kasikorn'],
    statusKeywords: ['โอนเงินสำเร็จ', 'โอนสำเร็จ', 'โอนเงินเรียบร้อย', 'transfer successful'],
    senderAnchorKeywords: ['จาก', 'ผู้โอน', 'from'],
    receiverAnchorKeywords: ['ไปยัง', 'ถึง', 'ผู้รับ', 'ผู้รับเงิน', 'to'],
    amountAnchorKeywords: ['จำนวนเงิน', 'ยอดเงิน', 'จำนวน', 'amount'],
    refAnchorKeywords: COMMON_REF_ANCHORS,
    feeAnchorKeywords: ['ค่าธรรมเนียม', 'fee'],
    memoAnchorKeywords: ['บันทึกช่วยจำ', 'บันทึก', 'memo', 'note'],
  },
  {
    id: 'scb',
    bankName: 'SCB',
    triggerKeywords: ['ไทยพาณิชย์', 'scb', 'scb easy', 'siam commercial'],
    statusKeywords: ['โอนเงินสำเร็จ', 'โอนสำเร็จ', 'transfer successful'],
    senderAnchorKeywords: ['จาก', 'ผู้โอน', 'from'],
    receiverAnchorKeywords: ['ไปยัง', 'ถึง', 'ผู้รับ', 'to'],
    amountAnchorKeywords: ['จำนวนเงิน', 'ยอดเงิน', 'amount'],
    refAnchorKeywords: COMMON_REF_ANCHORS,
    feeAnchorKeywords: ['ค่าธรรมเนียม', 'fee'],
    memoAnchorKeywords: ['บันทึกช่วยจำ', 'บันทึก', 'memo'],
  },
  {
    id: 'krungthai',
    bankName: 'Krungthai',
    triggerKeywords: ['กรุงไทย', 'krungthai', 'ktb', 'เป๋าตัง', 'next'],
    statusKeywords: ['โอนเงินสำเร็จ', 'โอนสำเร็จ', 'รายการสำเร็จ'],
    senderAnchorKeywords: ['จาก', 'ผู้โอน', 'from'],
    receiverAnchorKeywords: ['ไปยัง', 'ถึง', 'ผู้รับ', 'to'],
    amountAnchorKeywords: ['จำนวนเงิน', 'ยอดเงิน', 'amount'],
    refAnchorKeywords: COMMON_REF_ANCHORS,
    feeAnchorKeywords: ['ค่าธรรมเนียม', 'fee'],
    memoAnchorKeywords: ['บันทึกช่วยจำ', 'บันทึก', 'memo'],
  },
  {
    id: 'bbl',
    bankName: 'Bangkok Bank',
    triggerKeywords: ['กรุงเทพ', 'bangkok bank', 'bualuang', 'bbl'],
    statusKeywords: ['รายการสำเร็จ', 'โอนเงินสำเร็จ', 'โอนสำเร็จ'],
    senderAnchorKeywords: ['จาก', 'ผู้โอน', 'from'],
    receiverAnchorKeywords: ['ถึง', 'ไปยัง', 'ผู้รับ', 'to'],
    amountAnchorKeywords: ['จำนวนเงิน', 'ยอดเงิน', 'amount'],
    refAnchorKeywords: COMMON_REF_ANCHORS,
    feeAnchorKeywords: ['ค่าธรรมเนียม', 'fee'],
    memoAnchorKeywords: ['บันทึกช่วยจำ', 'บันทึก', 'memo'],
  },
  {
    id: 'ttb',
    bankName: 'TTB',
    triggerKeywords: ['ทีทีบี', 'ttb', 'ttb touch', 'tmb', 'thanachart'],
    statusKeywords: ['โอนสำเร็จ', 'โอนเงินสำเร็จ'],
    senderAnchorKeywords: ['จาก', 'ผู้โอน', 'from'],
    receiverAnchorKeywords: ['ไปยัง', 'ถึง', 'ผู้รับ', 'to'],
    amountAnchorKeywords: ['จำนวนเงิน', 'ยอดเงิน', 'amount'],
    refAnchorKeywords: COMMON_REF_ANCHORS,
    feeAnchorKeywords: ['ค่าธรรมเนียม', 'fee'],
    memoAnchorKeywords: ['บันทึกช่วยจำ', 'บันทึก', 'memo'],
  },
  {
    id: 'krungsri',
    bankName: 'Krungsri',
    triggerKeywords: ['กรุงศรี', 'krungsri', 'kma', 'bay', 'ayudhya'],
    statusKeywords: ['โอนเงินสำเร็จ', 'โอนสำเร็จ', 'รายการสำเร็จ'],
    senderAnchorKeywords: ['จาก', 'ผู้โอน', 'from'],
    receiverAnchorKeywords: ['ถึง', 'ไปยัง', 'ผู้รับ', 'to'],
    amountAnchorKeywords: ['จำนวนเงิน', 'ยอดเงิน', 'amount'],
    refAnchorKeywords: COMMON_REF_ANCHORS,
    feeAnchorKeywords: ['ค่าธรรมเนียม', 'fee'],
    memoAnchorKeywords: ['บันทึกช่วยจำ', 'บันทึก', 'memo'],
  },
  {
    id: 'gsb',
    bankName: 'GSB',
    triggerKeywords: ['ออมสิน', 'gsb', 'mymo'],
    statusKeywords: ['โอนเงินสำเร็จ', 'โอนสำเร็จ'],
    senderAnchorKeywords: ['จาก', 'ผู้โอน', 'from'],
    receiverAnchorKeywords: ['ไปยัง', 'ถึง', 'ผู้รับ', 'to'],
    amountAnchorKeywords: ['จำนวนเงิน', 'ยอดเงิน', 'amount'],
    refAnchorKeywords: COMMON_REF_ANCHORS,
    feeAnchorKeywords: ['ค่าธรรมเนียม', 'fee'],
    memoAnchorKeywords: ['บันทึกช่วยจำ', 'บันทึก', 'memo'],
  },
  {
    id: 'baac',
    bankName: 'BAAC',
    triggerKeywords: ['ธ.ก.ส', 'ธกส', 'baac', 'a-mobile'],
    statusKeywords: ['โอนเงินสำเร็จ', 'โอนสำเร็จ'],
    senderAnchorKeywords: ['จาก', 'ผู้โอน', 'from'],
    receiverAnchorKeywords: ['ไปยัง', 'ถึง', 'ผู้รับ', 'to'],
    amountAnchorKeywords: ['จำนวนเงิน', 'ยอดเงิน', 'amount'],
    refAnchorKeywords: COMMON_REF_ANCHORS,
    feeAnchorKeywords: ['ค่าธรรมเนียม', 'fee'],
    memoAnchorKeywords: ['บันทึกช่วยจำ', 'บันทึก', 'memo'],
  },
  {
    id: 'truemoney',
    bankName: 'TrueMoney',
    triggerKeywords: ['truemoney', 'ทรูมันนี่', 'true money'],
    statusKeywords: ['โอนเงินสำเร็จ', 'ชำระเงินสำเร็จ', 'โอนสำเร็จ'],
    senderAnchorKeywords: ['จาก', 'ผู้โอน', 'from'],
    receiverAnchorKeywords: ['ไปยัง', 'ถึง', 'ผู้รับ', 'to'],
    amountAnchorKeywords: ['จำนวนเงิน', 'ยอดเงิน', 'amount'],
    refAnchorKeywords: COMMON_REF_ANCHORS,
    feeAnchorKeywords: ['ค่าธรรมเนียม', 'fee'],
    memoAnchorKeywords: ['ข้อความ', 'บันทึก', 'memo'],
  },
  {
    id: 'promptpay',
    bankName: 'PromptPay',
    triggerKeywords: ['พร้อมเพย์', 'promptpay', 'prompt pay'],
    statusKeywords: ['โอนเงินสำเร็จ', 'โอนสำเร็จ', 'ชำระเงินสำเร็จ'],
    senderAnchorKeywords: ['จาก', 'ผู้โอน', 'from'],
    receiverAnchorKeywords: ['ไปยัง', 'ถึง', 'ผู้รับ', 'to'],
    amountAnchorKeywords: ['จำนวนเงิน', 'ยอดเงิน', 'amount'],
    refAnchorKeywords: COMMON_REF_ANCHORS,
    feeAnchorKeywords: ['ค่าธรรมเนียม', 'fee'],
    memoAnchorKeywords: ['บันทึกช่วยจำ', 'บันทึก', 'memo'],
  },
];

export const GENERIC_TEMPLATE: BankTemplate = {
  id: 'generic',
  bankName: 'Bank',
  triggerKeywords: [],
  statusKeywords: ['โอนเงินสำเร็จ', 'โอนสำเร็จ', 'รายการสำเร็จ', 'transfer successful', 'ชำระเงินสำเร็จ'],
  senderAnchorKeywords: ['จาก', 'ผู้โอน', 'from'],
  receiverAnchorKeywords: ['ไปยัง', 'ถึง', 'ผู้รับ', 'ผู้รับเงิน', 'to'],
  amountAnchorKeywords: ['จำนวนเงิน', 'ยอดเงิน', 'จำนวน', 'amount'],
  refAnchorKeywords: COMMON_REF_ANCHORS,
  feeAnchorKeywords: ['ค่าธรรมเนียม', 'fee'],
  memoAnchorKeywords: ['บันทึกช่วยจำ', 'บันทึก', 'memo', 'note'],
};

/**
 * Collapses spaces between Thai characters caused by Tesseract OCR.
 * Example: "ห ม า ย เ ล ข ท ำ ร า ย ก า ร" -> "หมายเลขทำรายการ"
 */
export function collapseThaiSpaces(str: string): string {
  if (!str) return '';
  let prev = str;
  let curr = str.replace(/([\u0E00-\u0E7F])\s+(?=[\u0E00-\u0E7F])/g, '$1');
  while (curr !== prev) {
    prev = curr;
    curr = curr.replace(/([\u0E00-\u0E7F])\s+(?=[\u0E00-\u0E7F])/g, '$1');
  }
  return curr;
}

/**
 * Identifies which bank template matches the OCR text.
 */
export function identifyBankTemplate(text: string): BankTemplate {
  const lower = collapseThaiSpaces(text).toLowerCase();
  for (const template of BANK_TEMPLATES) {
    for (const kw of template.triggerKeywords) {
      if (lower.includes(collapseThaiSpaces(kw).toLowerCase())) {
        return template;
      }
    }
  }
  return GENERIC_TEMPLATE;
}

/**
 * Clean and normalizes a line of OCR text.
 */
function cleanLine(line: string): string {
  return line.replace(/[\r\t]+/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Filters out common non-name headers or noise words.
 */
function isCleanNameCandidate(str: string): boolean {
  if (!str || str.length < 2) return false;
  const lower = str.toLowerCase();
  // Filter out pure numbers or account formats
  if (/^[\d\s\-xX*•]+$/.test(str)) return false;
  // Filter out bank names or system labels
  const noiseKeywords = [
    'โอนเงิน', 'สำเร็จ', 'บาท', 'thb', 'จาก', 'ไปยัง', 'ถึง', 'จำนวนเงิน',
    'ค่าธรรมเนียม', 'รหัสอ้างอิง', 'บันทึก', 'memo', 'ref', 'k plus', 'scb easy',
    'krungthai next', 'ธนาคาร', 'bank', 'promptpay', 'พร้อมเพย์'
  ];
  if (noiseKeywords.some((k) => lower === k)) return false;
  return true;
}

/**
 * Extracts account number from text or block of lines.
 * Matches: xxx-x-x6789-x, xxx-xxx789-0, xxx-x-xx789-x, 020-x-xxxx78-9, xxx-xxx-1234, x-xxxx-xxxxx-12-3
 */
export function extractAccountPattern(text: string): string {
  if (!text) return '';

  // Patterns for Thai bank masked accounts:
  // - KBank / TTB: xxx-x-x6789-x
  // - SCB: xxx-xxx789-0
  // - Krungthai: xxx-x-xx789-0
  // - Bangkok Bank: xxx-x-xx789-x
  // - GSB: 020-x-xxxx78-9
  // - PromptPay mobile: xxx-xxx-5678 or 081-xxx-5678
  // - PromptPay citizen ID: x-xxxx-xxxxx-12-3
  const accountRegex = /\b(?:[xX*•\d]{1,6}[-_ ]+){1,5}[xX*•\d]{1,6}\b/g;
  const matches = text.match(accountRegex);
  if (matches && matches.length > 0) {
    // Pick matches that actually contain digits or mask characters and at least 6 chars
    const valid = matches
      .map((m) => m.replace(/\s+/g, ''))
      .filter((m) => m.length >= 6 && /[xX*•]/.test(m))
      .sort((a, b) => b.length - a.length);

    if (valid.length > 0) {
      return valid[0];
    }
  }

  // Fallback: look for 10 to 15 digit plain numbers
  const plainDigits = text.match(/\b\d{10,15}\b/);
  if (plainDigits) {
    return plainDigits[0];
  }

  return '';
}

/**
 * Extracts amount (e.g. 500.00, 1,500.50) from OCR text.
 */
export function extractAmount(text: string, template: BankTemplate): number {
  const lines = text.split('\n').map(cleanLine).filter(Boolean);

  // Strategy 1: Find line with amount anchor
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const hasAmountAnchor = template.amountAnchorKeywords.some((k) =>
      line.toLowerCase().includes(k.toLowerCase()),
    );

    if (hasAmountAnchor) {
      // Check current line for number
      const matchSameLine = line.match(/(?:[:\s]|^)([0-9]{1,3}(?:,[0-9]{3})*\.[0-9]{2}|[0-9]+\.[0-9]{2})/);
      if (matchSameLine) {
        return parseFloat(matchSameLine[1].replace(/,/g, ''));
      }
      // Check next line
      if (i + 1 < lines.length) {
        const matchNextLine = lines[i + 1].match(/([0-9]{1,3}(?:,[0-9]{3})*\.[0-9]{2}|[0-9]+\.[0-9]{2})/);
        if (matchNextLine) {
          return parseFloat(matchNextLine[1].replace(/,/g, ''));
        }
      }
    }
  }

  // Strategy 2: Look for prominent decimal amount in the whole text (exclude fees like 0.00)
  const allDecimalMatches = text.match(/\b([0-9]{1,3}(?:,[0-9]{3})*\.[0-9]{2}|[0-9]+\.[0-9]{2})\b/g);
  if (allDecimalMatches) {
    const amounts = allDecimalMatches
      .map((m) => parseFloat(m.replace(/,/g, '')))
      .filter((n) => !isNaN(n) && n > 0);

    // Usually the transfer amount is the largest decimal number on the slip
    if (amounts.length > 0) {
      return Math.max(...amounts);
    }
  }

  return 0;
}

/**
 * Extracts fee (defaults to 0.00).
 */
export function extractFee(text: string, template: BankTemplate): number {
  for (const kw of template.feeAnchorKeywords) {
    const regex = new RegExp(`${kw}\\s*[:.]?\\s*([0-9]+(?:\\.[0-9]{2})?|ฟรี|free)`, 'i');
    const match = text.match(regex);
    if (match) {
      if (match[1].toLowerCase().includes('ฟรี') || match[1].toLowerCase().includes('free')) {
        return 0;
      }
      const val = parseFloat(match[1]);
      if (!isNaN(val)) return val;
    }
  }
  return 0;
}

/**
 * Helper to extract a valid reference code from a text segment (after stripping anchor labels).
 */
function parseRefCandidateFromSegment(segment: string): string {
  if (!segment) return '';

  // Remove Thai characters and English anchor labels
  const cleaned = segment
    .replace(/[\u0E00-\u0E7F]+/g, ' ')
    .replace(/\b(?:transaction\s*id|transaction\s*ref|ref\s*no\.?|ref\.?|no\.?)\b/gi, ' ')
    .replace(/[:.#]/g, ' ')
    .trim();

  if (!cleaned) return '';

  // 1. Check if OCR split the reference code with spaces on the reference line (e.g., "0142811035 22BOR05412" or "2026102012 34567890")
  const tokens = cleaned.match(/[A-Za-z0-9_-]+/g);
  if (tokens && tokens.length >= 2) {
    const joined = tokens.join('');
    const digitCount = (joined.match(/\d/g) || []).length;
    if (joined.length >= 8 && joined.length <= 35 && digitCount >= 5 && !/[xX]{2,}/.test(joined)) {
      return joined;
    }
  }

  // 2. Check for a single contiguous alphanumeric token (8-35 chars, >=3 digits, not masked account)
  const singleMatch = cleaned.match(/\b([A-Za-z0-9_-]{8,35})\b/g);
  if (singleMatch) {
    for (const token of singleMatch) {
      const digitCount = (token.match(/\d/g) || []).length;
      if (digitCount >= 3 && !/[xX]{2,}/.test(token)) {
        return token.trim();
      }
    }
  }

  return '';
}

/**
 * Extracts transaction reference / slip ID (หมายเลขทำรายการ / รหัสอ้างอิง / เลขที่รายการ).
 */
export function extractTransactionRef(text: string, template: BankTemplate): string {
  const lines = text.split('\n').map(cleanLine).filter(Boolean);
  const allAnchors = Array.from(new Set([...template.refAnchorKeywords, ...COMMON_REF_ANCHORS]));

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const collapsedLine = collapseThaiSpaces(rawLine);
    const lowerCollapsed = collapsedLine.toLowerCase();

    const matchedAnchor = allAnchors.find((k) =>
      lowerCollapsed.includes(collapseThaiSpaces(k).toLowerCase()),
    );

    if (matchedAnchor) {
      const normalizedAnchor = collapseThaiSpaces(matchedAnchor).toLowerCase();
      const idx = lowerCollapsed.indexOf(normalizedAnchor);
      const afterAnchor = idx !== -1
        ? collapsedLine.substring(idx + normalizedAnchor.length)
        : collapsedLine;

      // 1. Try same line after the anchor keyword
      const sameLineRef = parseRefCandidateFromSegment(afterAnchor);
      if (sameLineRef) {
        return sameLineRef;
      }

      // 2. Try next line (and i + 2 if i + 1 was empty/noise)
      for (let offset = 1; offset <= 2 && i + offset < lines.length; offset++) {
        const nextLine = collapseThaiSpaces(lines[i + offset]);
        // Stop if next line is another known field anchor (like memo/fee)
        const isOtherAnchor =
          template.memoAnchorKeywords.some((k) => nextLine.toLowerCase().includes(k.toLowerCase())) ||
          template.feeAnchorKeywords.some((k) => nextLine.toLowerCase().includes(k.toLowerCase()));
        if (isOtherAnchor) break;

        const nextLineRef = parseRefCandidateFromSegment(nextLine);
        if (nextLineRef) {
          return nextLineRef;
        }
      }
    }
  }

  // Fallback 1: look for 15-30 char alphanumeric/digit reference strings (e.g. KBank 014281103522BOR05412 or 16-25 digit refs)
  const allCandidates = text.match(/\b[A-Za-z0-9]{14,30}\b/g);
  if (allCandidates) {
    for (const candidate of allCandidates) {
      const digitCount = (candidate.match(/\d/g) || []).length;
      if (digitCount >= 6 && !/[xX]{2,}/.test(candidate)) {
        return candidate;
      }
    }
  }

  return '';
}

/**
 * Extracts date & time and converts to ISO 8601 Asia/Bangkok (+07:00).
 */
export function extractTransactionDateTime(text: string): string {
  // Regex for Thai Buddhist dates: e.g. "15 ต.ค. 2567 10:25" or "15/10/2567 10:25"
  const thaiDateRegex = /(\d{1,2}\s+[^\s0-9]+\s+\d{2,4}\s+\d{1,2}:\d{2}(?::\d{2})?|\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}\s+\d{1,2}:\d{2}(?::\d{2})?)/;
  const match = text.match(thaiDateRegex);
  if (match) {
    try {
      return parseThaiDateTimeToIso(match[1]);
    } catch {
      // Fallback
    }
  }
  return new Date().toISOString();
}

/**
 * Extracts memo / note from the slip.
 */
export function extractMemo(text: string, template: BankTemplate): string {
  const lines = text.split('\n').map(cleanLine).filter(Boolean);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const kw of template.memoAnchorKeywords) {
      if (line.toLowerCase().includes(kw.toLowerCase())) {
        const parts = line.split(new RegExp(kw, 'i'));
        if (parts[1] && parts[1].trim()) {
          return parts[1].replace(/^[:\s-]+/, '').trim();
        }
        if (i + 1 < lines.length) {
          return lines[i + 1].trim();
        }
      }
    }
  }
  return '';
}

/**
 * Extracts sender and receiver names and accounts using positional zones defined by anchors.
 */
export function extractParties(
  text: string,
  template: BankTemplate,
): {
  senderName: string;
  senderAccount: string;
  receiverName: string;
  receiverAccount: string;
} {
  const lines = text.split('\n').map(cleanLine).filter(Boolean);

  let senderStartIndex = -1;
  let receiverStartIndex = -1;
  let amountStartIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();

    if (senderStartIndex === -1 && template.senderAnchorKeywords.some((k) => line.startsWith(k) || line.includes(k))) {
      senderStartIndex = i;
      continue;
    }

    if (receiverStartIndex === -1 && template.receiverAnchorKeywords.some((k) => line.startsWith(k) || line.includes(k))) {
      receiverStartIndex = i;
      continue;
    }

    if (amountStartIndex === -1 && template.amountAnchorKeywords.some((k) => line.includes(k))) {
      amountStartIndex = i;
      continue;
    }
  }

  // Determine Sender Zone: lines from senderStartIndex to receiverStartIndex (or min 2 lines)
  const senderLines: string[] = [];
  if (senderStartIndex !== -1) {
    const end = receiverStartIndex !== -1 && receiverStartIndex > senderStartIndex
      ? receiverStartIndex
      : Math.min(lines.length, senderStartIndex + 4);
    for (let i = senderStartIndex; i < end; i++) {
      senderLines.push(lines[i]);
    }
  }

  // Determine Receiver Zone: lines from receiverStartIndex to amountStartIndex
  const receiverLines: string[] = [];
  if (receiverStartIndex !== -1) {
    const end = amountStartIndex !== -1 && amountStartIndex > receiverStartIndex
      ? amountStartIndex
      : Math.min(lines.length, receiverStartIndex + 4);
    for (let i = receiverStartIndex; i < end; i++) {
      receiverLines.push(lines[i]);
    }
  }

  // Extract from zones
  const senderText = senderLines.join('\n');
  const receiverText = receiverLines.join('\n');

  const senderAccount = extractAccountPattern(senderText);
  const receiverAccount = extractAccountPattern(receiverText);

  // Find candidate names
  let senderName = '';
  for (const line of senderLines) {
    // Strip anchor keyword if present
    let candidate = line;
    for (const kw of template.senderAnchorKeywords) {
      if (candidate.toLowerCase().startsWith(kw)) {
        candidate = candidate.substring(kw.length).replace(/^[:\s-]+/, '');
      }
    }
    if (isCleanNameCandidate(candidate)) {
      senderName = candidate.trim();
      break;
    }
  }

  let receiverName = '';
  for (const line of receiverLines) {
    let candidate = line;
    for (const kw of template.receiverAnchorKeywords) {
      if (candidate.toLowerCase().startsWith(kw)) {
        candidate = candidate.substring(kw.length).replace(/^[:\s-]+/, '');
      }
    }
    if (isCleanNameCandidate(candidate)) {
      receiverName = candidate.trim();
      break;
    }
  }

  return {
    senderName,
    senderAccount,
    receiverName,
    receiverAccount,
  };
}

/**
 * Main Template Parser function that parses any Thai bank slip without AI.
 */
export function parseSlipWithTemplates(rawText: string): RawSlipExtraction {
  if (!rawText || !rawText.trim()) {
    return {
      bank_name: '',
      amount: 0,
      fee: 0,
      transaction_datetime: new Date().toISOString(),
      sender_name: '',
      sender_account: '',
      receiver_name: '',
      receiver_account: '',
      transaction_ref: '',
      memo: '',
      is_bank_slip: false,
      confidence: 0,
    };
  }

  // 1. Identify bank template
  const template = identifyBankTemplate(rawText);

  // 2. Check is_bank_slip
  const lower = collapseThaiSpaces(rawText).toLowerCase();
  const hasStatusKeyword = template.statusKeywords.some((k) =>
    lower.includes(collapseThaiSpaces(k).toLowerCase()),
  );
  const hasBankTrigger = template.triggerKeywords.some((k) =>
    lower.includes(collapseThaiSpaces(k).toLowerCase()),
  );
  const hasAmountOrRef =
    template.amountAnchorKeywords.some((k) => lower.includes(collapseThaiSpaces(k).toLowerCase())) ||
    template.refAnchorKeywords.some((k) => lower.includes(collapseThaiSpaces(k).toLowerCase()));

  const isBankSlip = hasStatusKeyword || (hasBankTrigger && hasAmountOrRef);

  // 3. Extract Amount & Fee
  const amount = extractAmount(rawText, template);
  const fee = extractFee(rawText, template);

  // 4. Extract Date & Time
  const transactionDatetime = extractTransactionDateTime(rawText);

  // 5. Extract Reference & Memo
  const transactionRef = extractTransactionRef(rawText, template);
  const memo = extractMemo(rawText, template);

  // 6. Extract Parties (Sender & Receiver)
  const { senderName, senderAccount, receiverName, receiverAccount } = extractParties(rawText, template);

  return {
    bank_name: template.bankName,
    amount,
    fee,
    transaction_datetime: transactionDatetime,
    sender_name: senderName,
    sender_account: senderAccount,
    receiver_name: receiverName,
    receiver_account: receiverAccount,
    transaction_ref: transactionRef,
    memo,
    is_bank_slip: isBankSlip,
    confidence: isBankSlip && amount > 0 ? 0.95 : 0.5,
  };
}
