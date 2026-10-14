/**
 * Editable Thai Keyword Rules for Category Suggestion.
 * Matches keywords against counterparty_name and memo.
 */

export interface CategoryRule {
  categoryName: string;
  type: 'income' | 'expense';
  keywords: string[];
}

export const CATEGORY_RULES: CategoryRule[] = [
  // --- Expense Rules ---
  {
    categoryName: 'เดินทาง',
    type: 'expense',
    keywords: [
      'bts', 'mrt', 'srt', 'grab', 'bolt', 'taxi', 'แท็กซี่', 'วินมอเตอร์ไซค์', 'วิน',
      'มอเตอร์ไซค์', 'ค่าน้ำมัน', 'น้ำมัน', 'ปตท', 'ptt', 'bcp', 'บางจาก', 'caltex',
      'shell', 'esso', 'ทางด่วน', 'easy pass', 'm-flow', 'รถไฟ', 'รถเมล์', 'บขส',
      'ตั๋วเครื่องบิน', 'airasia', 'nokair', 'vietjet', 'lion air', 'thai airways',
      'การบินไทย', 'ที่จอดรถ', 'ค่าจอด', 'เติมน้ำมัน',
    ],
  },
  {
    categoryName: 'สุขภาพ',
    type: 'expense',
    keywords: [
      'โรงพยาบาล', 'รพ.', 'คลินิก', 'clinic', 'hospital', 'ฟาร์มาซี', 'pharmacy',
      'ร้านขายยา', 'ร้านยา', 'เภสัช', 'หมอ', 'ทันตกรรม', 'ทำฟัน', 'แว่นตา', 'หอแว่น',
      'ฟิตเนส', 'gym', 'fitness', 'วิตามิน', 'แล็บ', 'medical', 'dental',
    ],
  },
  {
    categoryName: 'บิล/ค่าน้ำไฟ',
    type: 'expense',
    keywords: [
      'การไฟฟ้านครหลวง', 'การไฟฟ้าส่วนภูมิภาค', 'การไฟฟ้า', 'กฟภ', 'กฟน', 'mea', 'pea',
      'การประปานครหลวง', 'การประปาส่วนภูมิภาค', 'การประปา', 'กปน', 'กปภ', 'mwa', 'pwa',
      'ais', 'true', 'dtac', '3bb', 'nt broadband', 'ค่าโทรศัพท์', 'อินเทอร์เน็ต',
      'เน็ตบ้าน', 'เน็ต', 'ค่าไฟ', 'ค่าน้ำประปา', 'ค่าน้ำ', 'บิล', 'bill', 'netflix',
      'spotify', 'youtube', 'disney', 'บัตรเครดิต', 'สินเชื่อ', 'ประกัน', 'insurance',
    ],
  },
  {
    categoryName: 'ที่พัก',
    type: 'expense',
    keywords: [
      'ค่าเช่าห้อง', 'ค่าเช่า', 'หอพัก', 'คอนโด', 'อพาร์ทเมนท์', 'airbnb', 'agoda',
      'booking', 'โรงแรม', 'hotel', 'resort', 'ที่พัก', 'นิติบุคคล', 'ส่วนกลาง',
    ],
  },
  {
    categoryName: 'บันเทิง',
    type: 'expense',
    keywords: [
      'major cineplex', 'sf cinema', 'โรงหนัง', 'ดูหนัง', 'คอนเสิร์ต', 'concert',
      'game', 'steam', 'playstation', 'nintendo', 'คาราโอเกะ', 'บอร์ดเกม',
    ],
  },
  {
    categoryName: 'อาหาร',
    type: 'expense',
    keywords: [
      '7-eleven', '7-11', 'seven', 'เซเว่น', 'ร้านอาหาร', 'ร้านข้าว', 'ร้านกาแฟ',
      'ร้าน', 'food', 'อาหาร', 'กิน', 'ข้าว', 'ก๋วยเตี๋ยว', 'ชาบู', 'สุกี้',
      'หมูกระทะ', 'cafe', 'coffee', 'คาเฟ่', 'กาแฟ', 'starbucks', 'amazon',
      'เต่าบิน', 'lineman', 'grabfood', 'shopeefood', 'foodpanda', 'robinhood',
      'เบเกอรี่', 'bakery', 'ครัว', 'kfc', 'mcdonald', 'burger king', 'pizza',
      'sushi', 'mk', 'bar b q', 'ส้มตำ', 'กะเพรา',
    ],
  },
  {
    categoryName: 'ช้อปปิ้ง',
    type: 'expense',
    keywords: [
      'shopee', 'lazada', 'tiktok shop', 'central', 'the mall', 'robinson', 'lotus',
      'โลตัส', 'big c', 'บิ๊กซี', 'watson', 'boots', 'uniqlo', 'zara', 'h&m', 'muji',
      'เสื้อผ้า', 'ห้าง', 'ตลาด', 'supermarket', 'gourmet', 'tops', 'cj express',
      'mr. diy', 'diy', 'ikea', 'homepro', 'ไทวัสดุ',
    ],
  },

  // --- Income Rules ---
  {
    categoryName: 'เงินเดือน',
    type: 'income',
    keywords: [
      'เงินเดือน', 'salary', 'payroll', 'โบนัส', 'bonus', 'wage', 'ค่าตอบแทนประจำ',
    ],
  },
  {
    categoryName: 'รายได้เสริม',
    type: 'income',
    keywords: [
      'ฟรีแลนซ์', 'freelance', 'ค่าจ้าง', 'คอมมิชชั่น', 'commission', 'ปันผล',
      'dividend', 'ดอกเบี้ย', 'interest', 'ขายของ', 'ค่าสอน', 'รีวิว',
    ],
  },
  {
    categoryName: 'เงินโอนเข้า',
    type: 'income',
    keywords: [
      'คืนเงิน', 'refund', 'เงินคืน', 'แคชแบ็ก', 'cashback', 'ฝากเงิน',
    ],
  },
];

/**
 * Suggests category name based on counterparty name, memo, and transaction type.
 * Prioritizes the longest keyword match to ensure more specific keywords
 * (e.g. 'ค่าน้ำมัน' -> เดินทาง, 'ร้านขายยา' -> สุขภาพ) win over general prefixes (e.g. 'ค่าน้ำ' -> บิล, 'ร้าน' -> อาหาร).
 */
export function suggestCategoryName(
  counterpartyName: string | null | undefined,
  memo: string | null | undefined,
  type: 'income' | 'expense',
): string | null {
  const combinedText = `${counterpartyName || ''} ${memo || ''}`.toLowerCase();
  if (!combinedText.trim()) {
    return null;
  }

  let bestMatch: { categoryName: string; matchLength: number } | null = null;

  // Search matching rules of the given type
  for (const rule of CATEGORY_RULES) {
    if (rule.type === type) {
      for (const keyword of rule.keywords) {
        const lowerKeyword = keyword.toLowerCase();
        if (combinedText.includes(lowerKeyword)) {
          if (!bestMatch || lowerKeyword.length > bestMatch.matchLength) {
            bestMatch = {
              categoryName: rule.categoryName,
              matchLength: lowerKeyword.length,
            };
          }
        }
      }
    }
  }

  if (bestMatch) {
    return bestMatch.categoryName;
  }

  // Fallback to rules of other types
  for (const rule of CATEGORY_RULES) {
    if (rule.type !== type) {
      for (const keyword of rule.keywords) {
        const lowerKeyword = keyword.toLowerCase();
        if (combinedText.includes(lowerKeyword)) {
          if (!bestMatch || lowerKeyword.length > bestMatch.matchLength) {
            bestMatch = {
              categoryName: rule.categoryName,
              matchLength: lowerKeyword.length,
            };
          }
        }
      }
    }
  }

  return bestMatch ? bestMatch.categoryName : null;
}
