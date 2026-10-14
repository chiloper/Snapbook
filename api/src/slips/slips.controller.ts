import {
  Controller,
  Post,
  Get,
  Param,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { SlipsService } from './slips.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/interfaces/user.interface';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

@ApiBearerAuth()
@ApiTags('Slips')
@Controller('slips')
export class SlipsController {
  constructor(private readonly slipsService: SlipsService) {}

  @Post()
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // Stricter rate limit on upload
  @ApiOperation({
    summary: 'Upload and process up to 10 Thai bank transfer slip images',
    description:
      'Uploads images to Supabase Storage, extracts transaction details with Google Gemini, classifies income/expense, suggests category, and creates pending_review transactions.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Slip image files (max 10 files, 5MB each, jpeg/png/webp)',
        },
      },
      required: ['files'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Slips processed successfully',
  })
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      limits: {
        fileSize: MAX_FILE_SIZE,
      },
      fileFilter: (_req, file, callback) => {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          return callback(
            new BadRequestException(
              `ไฟล์ ${file.originalname} ไม่รองรับ (รองรับเฉพาะไฟล์รูปภาพ JPG, PNG, WEBP เท่านั้น)`,
            ),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async uploadSlips(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('กรุณาเลือกไฟล์สลิปอย่างน้อย 1 ไฟล์');
    }

    if (files.length > 10) {
      throw new BadRequestException('สามารถอัปโหลดได้สูงสุดไม่เกิน 10 ไฟล์ต่อครั้ง');
    }

    return this.slipsService.processSlips(user.id, files);
  }

  @Get(':id/image')
  @ApiOperation({
    summary: 'Get 10-minute signed URL for slip image',
  })
  @ApiResponse({
    status: 200,
    description: 'Signed URL returned',
  })
  @ApiResponse({
    status: 404,
    description: 'Slip not found',
  })
  async getImageUrl(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.slipsService.getSlipImageUrl(user.id, id);
  }
}
