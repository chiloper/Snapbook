import { suggestCategoryName } from './category-rules';

describe('category-rules', () => {
  describe('suggestCategoryName - expense', () => {
    it('should match food keywords like 7-Eleven, ร้าน, food, คาเฟ่ to อาหาร', () => {
      expect(suggestCategoryName('7-Eleven สาขา 1234', '', 'expense')).toBe('อาหาร');
      expect(suggestCategoryName('ร้านก๋วยเตี๋ยวเรือ', 'มื้อเย็น', 'expense')).toBe('อาหาร');
      expect(suggestCategoryName('Starbucks Coffee', 'กาแฟ', 'expense')).toBe('อาหาร');
      expect(suggestCategoryName('Lineman Food', 'สั่งอาหาร', 'expense')).toBe('อาหาร');
      expect(suggestCategoryName('KFC Thailand', '', 'expense')).toBe('อาหาร');
    });

    it('should match transport keywords like BTS, MRT, Grab, PTT to เดินทาง', () => {
      expect(suggestCategoryName('BTS Mochit', 'เติมเที่ยวเดินทาง', 'expense')).toBe('เดินทาง');
      expect(suggestCategoryName('MRT Sukhumvit', '', 'expense')).toBe('เดินทาง');
      expect(suggestCategoryName('Grab Ride', 'ไปทำงาน', 'expense')).toBe('เดินทาง');
      expect(suggestCategoryName('ปตท สาขาวิภาวดี', 'ค่าน้ำมัน', 'expense')).toBe('เดินทาง');
      expect(suggestCategoryName('Easy Pass Topup', 'ทางด่วน', 'expense')).toBe('เดินทาง');
    });

    it('should match bill and utility keywords like การไฟฟ้า, การประปา, AIS, True to บิล/ค่าน้ำไฟ', () => {
      expect(suggestCategoryName('การไฟฟ้านครหลวง (MEA)', 'ค่าไฟเดือนกันยายน', 'expense')).toBe('บิล/ค่าน้ำไฟ');
      expect(suggestCategoryName('การประปาส่วนภูมิภาค', 'ค่าน้ำประปา', 'expense')).toBe('บิล/ค่าน้ำไฟ');
      expect(suggestCategoryName('AIS Bill Payment', 'ค่าบริการรายเดือน', 'expense')).toBe('บิล/ค่าน้ำไฟ');
      expect(suggestCategoryName('True Corporation', 'เน็ตบ้าน', 'expense')).toBe('บิล/ค่าน้ำไฟ');
      expect(suggestCategoryName('Netflix Subscription', '', 'expense')).toBe('บิล/ค่าน้ำไฟ');
    });

    it('should match shopping keywords like Shopee, Lazada, Lotus, Uniqlo to ช้อปปิ้ง', () => {
      expect(suggestCategoryName('ShopeePay Thailand', 'ซื้อของออนไลน์', 'expense')).toBe('ช้อปปิ้ง');
      expect(suggestCategoryName('Lazada Express', '', 'expense')).toBe('ช้อปปิ้ง');
      expect(suggestCategoryName('Lotus Supermarket', 'ซื้อของใช้เข้าบ้าน', 'expense')).toBe('ช้อปปิ้ง');
      expect(suggestCategoryName('Uniqlo Central World', 'เสื้อผ้า', 'expense')).toBe('ช้อปปิ้ง');
    });

    it('should match housing keywords like ค่าเช่า, คอนโด, Agoda to ที่พัก', () => {
      expect(suggestCategoryName('นิติบุคคลคอนโดมิเนียม', 'ค่าส่วนกลาง', 'expense')).toBe('ที่พัก');
      expect(suggestCategoryName('คุณสมหมาย เจ้าของหอ', 'ค่าเช่าห้องเดือนนี้', 'expense')).toBe('ที่พัก');
      expect(suggestCategoryName('Agoda Company', 'จองห้องพัก', 'expense')).toBe('ที่พัก');
    });

    it('should match health keywords like โรงพยาบาล, คลินิก, ร้านยา to สุขภาพ', () => {
      expect(suggestCategoryName('โรงพยาบาลกรุงเทพ', 'ตรวจสุขภาพ', 'expense')).toBe('สุขภาพ');
      expect(suggestCategoryName('คลินิกทันตกรรม', 'ทำฟัน', 'expense')).toBe('สุขภาพ');
      expect(suggestCategoryName('ร้านยาฟาร์มาซี', 'ซื้อยา', 'expense')).toBe('สุขภาพ');
    });

    it('should match entertainment keywords like Major, SF, Steam to บันเทิง', () => {
      expect(suggestCategoryName('Major Cineplex', 'ตั๋วหนัง 2 ที่นั่ง', 'expense')).toBe('บันเทิง');
      expect(suggestCategoryName('Steam Games', '', 'expense')).toBe('บันเทิง');
    });
  });

  describe('suggestCategoryName - income', () => {
    it('should match salary keywords like เงินเดือน, salary, payroll to เงินเดือน', () => {
      expect(suggestCategoryName('ACME Co., Ltd.', 'เงินเดือนประจำเดือน', 'income')).toBe('เงินเดือน');
      expect(suggestCategoryName('Payroll Transfer', 'Salary Oct 2026', 'income')).toBe('เงินเดือน');
    });

    it('should match side income keywords like ฟรีแลนซ์, ค่าจ้าง, ปันผล to รายได้เสริม', () => {
      expect(suggestCategoryName('ลูกค้าออกแบบเว็บ', 'ค่าจ้างฟรีแลนซ์', 'income')).toBe('รายได้เสริม');
      expect(suggestCategoryName('บลจ. กสิกรไทย', 'เงินปันผลกองทุน', 'income')).toBe('รายได้เสริม');
    });

    it('should match transfer in / refund keywords like คืนเงิน, refund, cashback to เงินโอนเข้า', () => {
      expect(suggestCategoryName('Shopee Thailand', 'คืนเงินค่าสินค้า', 'income')).toBe('เงินโอนเข้า');
      expect(suggestCategoryName('TrueMoney', 'Cashback เติมเงิน', 'income')).toBe('เงินโอนเข้า');
    });
  });

  describe('fallback and empty', () => {
    it('should return null when no keywords match or text is empty', () => {
      expect(suggestCategoryName('', '', 'expense')).toBeNull();
      expect(suggestCategoryName('นายสมคิด มีทรัพย์', 'โอนให้เพื่อน', 'expense')).toBeNull();
    });
  });
});
