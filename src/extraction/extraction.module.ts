import { Module } from '@nestjs/common';
import { GeminiSlipExtractorService } from './gemini-slip-extractor.service';
import { SLIP_EXTRACTOR_TOKEN } from './interfaces/slip-extractor.interface';

@Module({
  providers: [
    GeminiSlipExtractorService,
    {
      provide: SLIP_EXTRACTOR_TOKEN,
      useClass: GeminiSlipExtractorService,
    },
  ],
  exports: [SLIP_EXTRACTOR_TOKEN, GeminiSlipExtractorService],
})
export class ExtractionModule {}
