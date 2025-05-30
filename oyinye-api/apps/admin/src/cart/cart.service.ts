import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Cart } from "./cart.entity";

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>
  ) {}

  async deleteCart(cartId: string) {
    await this.cartRepository.delete(cartId);
  }

  async updateCart(cartId: string, data: any) {
    await this.cartRepository.update(cartId, data);
  }

  async createCart(data: any) {
    await this.cartRepository.save(data);
  }
}
