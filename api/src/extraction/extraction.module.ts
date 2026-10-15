import { Module } from '@nestjs/common';
import { TemplateSlipExtractorService } from './template-slip-extractor.service';
import { SLIP_EXTRACTOR_TOKEN } from './interfaces/slip-extractor.interface';

@Module({
  providers: [
    TemplateSlipExtractorService,
    {
      provide: SLIP_EXTRACTOR_TOKEN,
      useClass: TemplateSlipExtractorService,
    },
  ],
  exports: [SLIP_EXTRACTOR_TOKEN, TemplateSlipExtractorService],
})
export class ExtractionModule {}
