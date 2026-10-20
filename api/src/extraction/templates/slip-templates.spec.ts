import {
  identifyBankTemplate,
  extractAmount,
  extractAccountPattern,
  extractParties,
  extractTransactionRef,
  parseSlipWithTemplates,
} from './slip-templates';

describe('slip-templates', () => {
  describe('identifyBankTemplate', () => {
    it('identifies KBank from keywords', () => {
      expect(identifyBankTemplate('ธนาคารกสิกรไทย โอนเงินสำเร็จ').id).toBe('kbank');
      expect(identifyBankTemplate('K PLUS Transfer Successful').id).toBe('kbank');
    });

    it('identifies SCB from keywords', () => {
      expect(identifyBankTemplate('ธนาคารไทยพาณิชย์ โอนเงินสำเร็จ').id).toBe('scb');
      expect(identifyBankTemplate('SCB EASY โอนเงินสำเร็จ').id).toBe('scb');
    });

    it('identifies Krungthai from keywords', () => {
      expect(identifyBankTemplate('ธนาคารกรุงไทย Krungthai NEXT').id).toBe('krungthai');
    });

    it('identifies Bangkok Bank from keywords', () => {
      expect(identifyBankTemplate('ธนาคารกรุงเทพ Bualuang mBanking').id).toBe('bbl');
    });

    it('identifies TTB from keywords', () => {
      expect(identifyBankTemplate('ทีทีบี ttb touch โอนสำเร็จ').id).toBe('ttb');
    });

    it('identifies GSB from keywords', () => {
      expect(identifyBankTemplate('ธนาคารออมสิน MyMo โอนเงินสำเร็จ').id).toBe('gsb');
    });

    it('identifies TrueMoney from keywords', () => {
      expect(identifyBankTemplate('TrueMoney Wallet โอนเงินสำเร็จ').id).toBe('truemoney');
    });
  });

  describe('extractAccountPattern', () => {
    it('extracts KBank masked account xxx-x-x6789-x', () => {
      expect(extractAccountPattern('ธ.กสิกรไทย xxx-x-x6789-x')).toBe('xxx-x-x6789-x');
    });

    it('extracts SCB masked account xxx-xxx789-0', () => {
      expect(extractAccountPattern('SCB xxx-xxx789-0')).toBe('xxx-xxx789-0');
    });

    it('extracts GSB masked account 020-x-xxxx78-9', () => {
      expect(extractAccountPattern('GSB 020-x-xxxx78-9')).toBe('020-x-xxxx78-9');
    });

    it('extracts PromptPay mobile xxx-xxx-5678', () => {
      expect(extractAccountPattern('พร้อมเพย์ xxx-xxx-5678')).toBe('xxx-xxx-5678');
    });
  });

  describe('KBank (K PLUS) Template Full Extraction', () => {
    const kbankOcrText = `
โอนเงินสำเร็จ
15 ต.ค. 2567 10:25 น.
จาก
นาย สมชาย สายลม
ธ.กสิกรไทย xxx-x-x6789-x
ไปยัง
นางสาว สมหญิง จริงใจ
ธ.ไทยพาณิชย์ xxx-xxx123-4
จำนวนเงิน
1,500.00 บาท
ค่าธรรมเนียม 0.00 บาท
รหัสอ้างอิง: 202410151234567890
บันทึกช่วยจำ: ค่าอาหารกลางวัน
    `;

    it('extracts all fields accurately according to KBank template', () => {
      const result = parseSlipWithTemplates(kbankOcrText);

      expect(result.bank_name).toBe('KBank');
      expect(result.is_bank_slip).toBe(true);
      expect(result.amount).toBe(1500.00);
      expect(result.fee).toBe(0.00);
      expect(result.sender_name).toBe('นาย สมชาย สายลม');
      expect(result.sender_account).toBe('xxx-x-x6789-x');
      expect(result.receiver_name).toBe('นางสาว สมหญิง จริงใจ');
      expect(result.receiver_account).toBe('xxx-xxx123-4');
      expect(result.transaction_ref).toBe('202410151234567890');
      expect(result.memo).toBe('ค่าอาหารกลางวัน');
      expect(result.confidence).toBe(0.95);
    });
  });

  describe('SCB EASY Template Full Extraction', () => {
    const scbOcrText = `
SCB EASY
โอนเงินสำเร็จ
14 ต.ค. 2567 - 18:45
จาก
สมเกียรติ ยิ่งเจริญ
SCB xxx-xxx999-0
ไปยัง
ร้านค้า สะดวกซื้อ
พร้อมเพย์ xxx-xxx-1122
จำนวนเงิน
350.50 บาท
ค่าธรรมเนียม 0.00 บาท
เลขที่รายการ: 20241014987654321
    `;

    it('extracts all fields accurately according to SCB template', () => {
      const result = parseSlipWithTemplates(scbOcrText);

      expect(result.bank_name).toBe('SCB');
      expect(result.is_bank_slip).toBe(true);
      expect(result.amount).toBe(350.50);
      expect(result.sender_name).toBe('สมเกียรติ ยิ่งเจริญ');
      expect(result.sender_account).toBe('xxx-xxx999-0');
      expect(result.receiver_name).toBe('ร้านค้า สะดวกซื้อ');
      expect(result.receiver_account).toBe('xxx-xxx-1122');
      expect(result.transaction_ref).toBe('20241014987654321');
    });
  });

  describe('Bangkok Bank (BBL) Template Extraction', () => {
    const bblOcrText = `
ธนาคารกรุงเทพ Bualuang mBanking
รายการสำเร็จ
10 ต.ค. 2567 09:12
จาก
นาย เอกชัย ใจดี
xxx-x-xx123-x
ถึง
นาง มาลี มีสุข
xxx-x-xx456-x
จำนวนเงิน
2,000.00 บาท
รหัสอ้างอิง: BBL20241010001122
    `;

    it('extracts all fields according to BBL template', () => {
      const result = parseSlipWithTemplates(bblOcrText);

      expect(result.bank_name).toBe('Bangkok Bank');
      expect(result.is_bank_slip).toBe(true);
      expect(result.amount).toBe(2000.00);
      expect(result.sender_name).toBe('นาย เอกชัย ใจดี');
      expect(result.sender_account).toBe('xxx-x-xx123-x');
      expect(result.receiver_name).toBe('นาง มาลี มีสุข');
      expect(result.receiver_account).toBe('xxx-x-xx456-x');
      expect(result.transaction_ref).toBe('BBL20241010001122');
    });
  });

  describe('Non-slip image rejection', () => {
    it('sets is_bank_slip to false for non-bank receipt or random text', () => {
      const randomText = `
ใบเสร็จรับเงิน ค่าบริการซักรีด
จำนวนเงิน 100 บาท
ขอบคุณที่ใช้บริการ
      `;
      const result = parseSlipWithTemplates(randomText);
      expect(result.is_bank_slip).toBe(false);
    });
  });

  describe('extractTransactionRef (หมายเลขทำรายการ / รหัสอ้างอิง)', () => {
    it('extracts reference with "หมายเลขทำรายการ" label on same line or next line', () => {
      const template = identifyBankTemplate('ธนาคารกรุงเทพ');
      expect(
        extractTransactionRef('หมายเลขทำรายการ: 202610201234567890', template),
      ).toBe('202610201234567890');
      expect(
        extractTransactionRef('หมายเลขทำรายการ\n014281103522BOR05412', template),
      ).toBe('014281103522BOR05412');
    });

    it('extracts reference even when Tesseract puts spaces between Thai characters', () => {
      const template = identifyBankTemplate('กสิกร');
      const spacedText = 'ห ม า ย เ ล ข ท ำ ร า ย ก า ร : 014281103522BOR05412';
      expect(extractTransactionRef(spacedText, template)).toBe('014281103522BOR05412');
    });

    it('extracts reference when OCR splits alphanumeric ref with space on same line', () => {
      const template = identifyBankTemplate('ไทยพาณิชย์');
      const splitRefText = 'เลขที่รายการ: 2026102012 34567890';
      expect(extractTransactionRef(splitRefText, template)).toBe('202610201234567890');
    });

    it('falls back to 14-30 char alphanumeric slip ID when label is missing', () => {
      const template = identifyBankTemplate('K PLUS');
      const noLabelText = 'โอนเงินสำเร็จ\nจำนวน 500.00 บาท\n014281103522BOR05412';
      expect(extractTransactionRef(noLabelText, template)).toBe('014281103522BOR05412');
    });
  });
});
