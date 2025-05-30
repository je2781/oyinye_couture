import { IsNotEmpty, IsNumber, IsString } from "class-validator"
import { Product } from "../../product/product.entity";

export class CartItemDto{
    @IsNotEmpty()
    product: Product;

    @IsNumber()
    quantity: number; 

    @IsString()
    variantId: string;

    @IsNumber()
    price: number;
}
