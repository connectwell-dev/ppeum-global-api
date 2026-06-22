import { ApiProperty } from '@nestjs/swagger';
import { GetProductCategoryProductListResDto } from '@modules/admin-product-setting/product-category-setting/dto/get-product-category-product/response.dto';

export class GetMenuBoardProductListResDto extends GetProductCategoryProductListResDto {
  @ApiProperty({ description: '순서', example: 1 })
  order: number;
}