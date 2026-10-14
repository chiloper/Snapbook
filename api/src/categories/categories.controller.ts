import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/interfaces/user.interface';

@ApiBearerAuth()
@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all categories (system defaults + user created)' })
  @ApiResponse({ status: 200, description: 'List of categories' })
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.categoriesService.findAll(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new custom category for the user' })
  @ApiResponse({ status: 201, description: 'Category created' })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateCategoryDto,
  ) {
    return this.categoriesService.create(user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user-created category' })
  @ApiResponse({ status: 200, description: 'Category updated' })
  @ApiResponse({ status: 403, description: 'Cannot modify system category' })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user-created category' })
  @ApiResponse({ status: 200, description: 'Category deleted' })
  @ApiResponse({ status: 403, description: 'Cannot delete system category' })
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.categoriesService.remove(user.id, id);
  }
}
