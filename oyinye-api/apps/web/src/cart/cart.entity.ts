import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToOne,
} from "typeorm";

import { AbstractEntity } from "@app/common/index";
import { User } from "../user/user.entity";

@Entity("carts")
export class Cart extends AbstractEntity<Cart> {
  @Column({ type: "jsonb", default: [] })
  items: any[];

  @Column("float")
  total_amount: number;

  @OneToOne(() => User, (user) => user.cart)
  @JoinColumn({ name: "user_id" })
  user: User;

  @CreateDateColumn({ name: "createdAt" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updatedAt" })
  updatedAt: Date;

  async clearCart() {
    this.items = [];
    return this.save();
  }

  async addToCart(
    product: any,
    quantity: number,
    variantId: string,
    price: number
  ) {
    const updatedCartItems = [...this.items];
    const index = updatedCartItems.findIndex((i) => i.variant_id === variantId);
    const item = updatedCartItems[index];

    if (item) {
      updatedCartItems[index] = {
        ...item,
        quantity: item.quantity + quantity,
      };
    } else {
      updatedCartItems.push({
        variant_id: variantId,
        quantity,
        product,
      });
    }

    this.items = updatedCartItems;
    this.total_amount += price * quantity;

    return this.save();
  }

  async deductFromCart(variantId: string, quantity: number, price: number) {
    const updatedCartItems = [...this.items];
    const index = updatedCartItems.findIndex((i) => i.variant_id === variantId);
    if (index === -1) throw new Error("Item not found in the cart");

    const item = updatedCartItems[index];
    const remaining = item.quantity - quantity;

    if (remaining === 0) {
      updatedCartItems.splice(index, 1);
    } else {
      updatedCartItems[index] = {
        ...item,
        quantity: remaining,
      };
    }

    this.items = updatedCartItems;
    this.total_amount -= price * quantity;

    return this.save();
  }
}
