import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI, Type } from '@google/genai';
import {
  ISlipExtractor,
  RawSlipExtraction,
} from './interfaces/slip-extractor.interface';
import { parseThaiDateTimeToIso } from './utils/buddhist-year';

@Injectable()
export class GeminiSlipExtractorService implements ISlipExtractor {
  private readonly logger = new Logger(GeminiSlipExtractorService.name);
  private readonly aiClient: GoogleGenAI;
  private readonly modelName: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY', '');
    this.modelName = this.configService.get<string>(
      'GEMINI_MODEL',
      'gemini-2.5-flash',
    );

    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY is not configured');
    }

    this.aiClient = new GoogleGenAI({ apiKey });
  }

  async extractFromImage(
    buffer: Buffer,
    mimeType: string,
  ): Promise<RawSlipExtraction> {
    const systemPrompt = `You are an expert OCR and data extraction system specialized in Thai bank transfer slips and mobile banking transactions.
Analyze the provided image carefully. Slips in Thailand originate from financial institutions including:
- Kasikornbank (KBank / K PLUS)
- Siam Commercial Bank (SCB / SCB EASY)
- Krungthai Bank (Krungthai NEXT / เป๋าตัง)
- Bangkok Bank (Bualuang mBanking)
- Bank of Ayudhya (Krungsri / KMA)
- TMBThanachart (TTB / ttb touch)
- Government Savings Bank (GSB / MyMo)
- Bank for Agriculture and Agricultural Cooperatives (BAAC / A-Mobile)
- PromptPay (พร้อมเพย์)
- TrueMoney Wallet

CRITICAL INSTRUCTIONS:
1. Identify if the image is genuinely a Thai bank or e-wallet transfer slip. If it is a photo of something else (receipt, landscape, random text, memes), set is_bank_slip to false.
2. Extract the transfer amount accurately. Amounts on Thai slips often have commas and decimals (e.g. 1,500.00). Fee is often 0.00 or 'ฟรีค่าธรรมเนียม'.
3. For dates, Thai bank slips usually print dates in Buddhist Era (พ.ศ.) such as 2567 or 2568, and Thai month names/abbreviations (เช่น 14 ต.ค. 2567 14:30 น.).
   Convert the Buddhist year (พ.ศ.) to Common Era (ค.ศ.) by subtracting 543 (e.g., 2567 - 543 = 2024, 2568 - 543 = 2025).
   Provide the output as an ISO 8601 string in the Asia/Bangkok timezone (+07:00), e.g. "2024-10-14T14:30:00+07:00".
4. Extract sender name and account/wallet number exactly as printed on the slip, preserving any masking characters like 'x', 'X', '*', or '-' (e.g. 'xxx-x-x6789-x', 'xxx-xxx789-0', 'xxx-x-xx789-x', '020-x-xxxx78-9', 'xxx-xxx-1234', 'x-xxxx-xxxxx-12-3'). Do NOT alter or guess masked digits.
5. Extract receiver/payee name and account/promptpay number exactly as printed on the slip, preserving any masking characters.
6. Extract the unique transaction reference number (รหัสอ้างอิง / Transaction ID / Slip ID).
7. Extract any memo, note (บันทึกช่วยจำ), or purpose if present.
8. Output strictly adhering to the JSON schema.`;

    try {
      const response = await this.aiClient.models.generateContent({
        model: this.modelName,
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: buffer.toString('base64'),
                },
              },
              {
                text: systemPrompt,
              },
            ],
          },
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              bank_name: {
                type: Type.STRING,
                description: 'Bank or provider name (e.g. KBank, SCB, Krungthai, Bangkok Bank, Krungsri, TTB, GSB, PromptPay, TrueMoney)',
              },
              amount: {
                type: Type.NUMBER,
                description: 'Transfer amount (positive number)',
              },
              fee: {
                type: Type.NUMBER,
                description: 'Transfer fee (0 if free)',
              },
              transaction_datetime: {
                type: Type.STRING,
                description: 'ISO 8601 Asia/Bangkok datetime (e.g. 2024-10-14T14:30:00+07:00) with Buddhist year converted to Gregorian',
              },
              sender_name: {
                type: Type.STRING,
                description: 'Sender full name',
              },
              sender_account: {
                type: Type.STRING,
                description: 'Sender account number or PromptPay ID',
              },
              receiver_name: {
                type: Type.STRING,
                description: 'Receiver full name or merchant name',
              },
              receiver_account: {
                type: Type.STRING,
                description: 'Receiver account number or PromptPay ID',
              },
              transaction_ref: {
                type: Type.STRING,
                description: 'Unique transaction reference code or slip number',
              },
              memo: {
                type: Type.STRING,
                description: 'Note, memo, or remarks from the slip',
              },
              is_bank_slip: {
                type: Type.BOOLEAN,
                description: 'True if image is a bank transfer slip',
              },
              confidence: {
                type: Type.NUMBER,
                description: 'Confidence score from 0.0 to 1.0',
              },
            },
            required: ['is_bank_slip', 'confidence'],
          },
        },
      });

      const responseText = response.text || '{}';
      const parsed = JSON.parse(responseText);

      // Post-process date with our Buddhist year converter to ensure ISO 8601 with +07:00
      let normalizedDate = new Date().toISOString();
      if (parsed.transaction_datetime) {
        try {
          normalizedDate = parseThaiDateTimeToIso(parsed.transaction_datetime);
        } catch {
          // If parse fails, fallback to current time
          normalizedDate = new Date().toISOString();
        }
      }

      const result: RawSlipExtraction = {
        bank_name: String(parsed.bank_name || '').trim(),
        amount: parsed.amount !== undefined && parsed.amount !== null ? Number(parsed.amount) : 0,
        fee: parsed.fee !== undefined && parsed.fee !== null ? Number(parsed.fee) : 0,
        transaction_datetime: normalizedDate,
        sender_name: String(parsed.sender_name || '').trim(),
        sender_account: String(parsed.sender_account || '').trim(),
        receiver_name: String(parsed.receiver_name || '').trim(),
        receiver_account: String(parsed.receiver_account || '').trim(),
        transaction_ref: String(parsed.transaction_ref || '').trim(),
        memo: String(parsed.memo || '').trim(),
        is_bank_slip: Boolean(parsed.is_bank_slip),
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.8,
      };

      // Safe logging (never log account numbers, names, or tokens)
      this.logger.log(`Slip processed: is_bank_slip=${result.is_bank_slip}, confidence=${result.confidence}`);

      return result;
    } catch (err: any) {
      this.logger.error(`Gemini extraction failed: ${err.message}`);
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
  }
}
