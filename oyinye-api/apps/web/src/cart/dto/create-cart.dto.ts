import { IsNumber, IsString } from "class-validator"

export class CreateCartDto{
    @IsNumber()
    price: number;

    @IsNumber()
    quantity: number; 

    @IsString()
    variantId: string;

    @IsString()
    id: string;

    @IsNumber()
    totalAmount: number;

}
