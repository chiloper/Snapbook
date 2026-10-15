import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createWorker, Worker } from 'tesseract.js';
import { ISlipExtractor, RawSlipExtraction } from './interfaces/slip-extractor.interface';
import { parseSlipWithTemplates } from './templates/slip-templates';

@Injectable()
export class TemplateSlipExtractorService implements ISlipExtractor, OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TemplateSlipExtractorService.name);
  private worker: Worker | null = null;
  private isInitializing = false;

  async onModuleInit() {
    this.logger.log('Pre-warming Local Tesseract OCR Engine (tha+eng)...');
    await this.initWorker();
  }

  async onModuleDestroy() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }

  private async initWorker(): Promise<Worker> {
    if (this.worker) {
      return this.worker;
    }

    if (this.isInitializing) {
      // Wait for initialization to complete
      while (this.isInitializing) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      if (this.worker) return this.worker;
    }

    this.isInitializing = true;
    try {
      this.worker = await createWorker(['tha', 'eng']);
      this.logger.log('Local Tesseract OCR Engine (tha+eng) initialized successfully! Zero AI token usage.');
      return this.worker;
    } catch (err: any) {
      this.logger.error(`Failed to initialize Tesseract worker: ${err.message}`);
      throw err;
    } finally {
      this.isInitializing = false;
    }
  }

  async extractFromImage(buffer: Buffer, mimeType: string): Promise<RawSlipExtraction> {
    try {
      this.logger.log(`Performing Local Template OCR extraction on image (${buffer.length} bytes, ${mimeType})...`);

      const worker = await this.initWorker();
      const { data: { text } } = await worker.recognize(buffer);

      this.logger.log(`OCR text recognized (${text.length} chars). Applying Bank Layout Template matching...`);

      // Apply Bank Slip Layout Template parser
      const extraction = parseSlipWithTemplates(text);

      this.logger.log(
        `Template Slip parsed: bank=${extraction.bank_name}, amount=${extraction.amount}, is_bank_slip=${extraction.is_bank_slip}, ref=${extraction.transaction_ref}`,
      );

      return extraction;
    } catch (err: any) {
      this.logger.error(`Template extraction failed: ${err.message}`);
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
        error: err.message,
      };
    }
  }
}
