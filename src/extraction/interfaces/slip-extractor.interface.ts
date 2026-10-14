export interface RawSlipExtraction {
  bank_name: string;
  amount: number | string;
  fee: number | string;
  transaction_datetime: string; // ISO 8601, Asia/Bangkok
  sender_name: string;
  sender_account: string;
  receiver_name: string;
  receiver_account: string;
  transaction_ref: string;
  memo: string;
  is_bank_slip: boolean;
  confidence: number;
}

export interface ISlipExtractor {
  extractFromImage(buffer: Buffer, mimeType: string): Promise<RawSlipExtraction>;
}

export const SLIP_EXTRACTOR_TOKEN = 'SLIP_EXTRACTOR_TOKEN';
