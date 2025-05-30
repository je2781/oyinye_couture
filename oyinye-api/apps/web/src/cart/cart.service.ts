import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Cart } from "./cart.entity";
import { User } from "../user/user.entity";
import { Product } from "../product/product.entity";
import { Order } from "../order/order.entity";
import { Request, Response } from "express";
import { getDataFromCart } from "libs/common/utils/getDataFromCart";
import { getUserData } from "libs/common/utils/getUserData";
import { getVisitData } from "libs/common/utils/getVisitData";
import { ADMIN_SERVICE } from "../constants/service";
import { ClientProxy } from "@nestjs/microservices";
import { lastValueFrom } from "rxjs";
import { Visitor } from "../visitor/visitor.entity";
import * as crypto from "crypto";
import { CartItemDto } from "./dto/cart-item.dto";
import { CreateCartDto } from "./dto";
import { getDataFromOrder } from "libs/common/utils/getDataFromOrder";

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Product)
    private productRepository: Repository<Product>,

    @InjectRepository(Order)
    private orderRepository: Repository<Order>,

    @InjectRepository(Visitor)
    private visitorRepo: Repository<Visitor>,

    @Inject(ADMIN_SERVICE) private adminClient: ClientProxy
  ) {}

  async getCart(cartId: string, res: Response) {
    try {
      const cart = await this.cartRepository.findOne({
        where: { id: cartId },
        relations: { user: true },
      });

      if (!cart) throw new BadRequestException("Invalid cart id");

      const cartItems = cart.items.map((item) => ({
        product: item.product,
        quantity: item.quantity,
        variantId: item.variant_id,
      }));

      return res.status(200).json({ cartItems, total: cart.total_amount });
    } catch (error) {
      const e = error as Error;
      return res.status(500).json({
        error: e.message,
      });
    }
  }

  async removeFromCart(req: Request, res: Response) {
    try {
      //retrieving user cookie and cart cookie
      const userId = getUserData(req);
      const cartId = getDataFromCart(req);

      const { quantity, variantId, price } = req.body;

      if (cartId && userId) {
        const cart = await this.cartRepository.findOne({
          where: { id: cartId },
          relations: { user: true },
        });
        //protecting against unauthorized access
        if (cart!.user.id !== userId) {
          throw new UnauthorizedException();
        }

        await cart!.deductFromCart(variantId, quantity, price);

        const updatedCartItems = cart!.items.filter(
          (item) => item.quantity > 0
        );

        cart!.items = updatedCartItems;

        await this.cartRepository.save(cart!);

        //dispatching cart_updated job
        await lastValueFrom(
          this.adminClient.emit("cart_updated", {
            id: cartId,
            data: cart!,
          })
        );

        if (cart!.items.length === 0) {
          await this.cartRepository.delete(cartId);

          //dispatching cart_destroyed job
          await lastValueFrom(this.adminClient.emit("cart_destroyed", cartId));

          const updatedRes = res.clearCookie("cart");

          return updatedRes.status(204).json({
            message: "Cart updated successfully",
            totalAmount: 0,
            items: [],
          });
        }

        const cartItems = cart!.items.map((item) => ({
          product: item.product,
          quantity: item.quantity,
          variantId: item.variant_id,
        }));

        return res.status(201).json({
          message: "Cart updated successfully",
          totalAmount: cart!.total_amount,
          items: cartItems,
          success: true,
        });
      } else {
        throw new BadRequestException("inavlid cart id");
      }
    } catch (error) {
      const e = error as Error;
      return res.status(500).json({
        error: e.message,
      });
    }
  }

  async addToCart(
    cartId: string,
    userId: string,
    dto: CartItemDto,
    res: Response
  ) {
    let cart = await this.cartRepository.findOneBy({ id: cartId });

    //protecting against unauthorized access
    if (cart!.user.id != userId) {
      throw new UnauthorizedException("Not Authorized");
    }

    await cart!.addToCart(
      dto.product,
      dto.quantity,
      dto.variantId,
      parseFloat(dto.price.toFixed(2))
    );

    const cartItems = cart!.items.map((item) => ({
      product: item.product,
      quantity: item.quantity,
      variantId: item.variant_id,
    }));

    return res.status(201).json({
      message: "Cart updated successfully",
      totalAmount: cart!.total_amount,
      items: cartItems,
      success: true,
    });
  }

  async createCart(dto: CreateCartDto, req: Request, res: Response) {
    try {
      const { price, quantity, variantId, id, totalAmount } = dto;

      //retrieving cookies
      const userId = getUserData(req);
      const visitId = getVisitData(req);
      const cartId = getDataFromCart(req);

      const product = await this.productRepository.findOne({
        where: {
          id,
        },
      });

      if (!product) throw new NotFoundException("Product not found");

      let user = await this.userRepository.findOne({
        where: {
          id: userId,
        },
      });

      if (!cartId) {
        //setting up response for cookie
        const remainingMilliseconds = 5184000000; // 2 months
        const expiryDate = new Date(Date.now() + remainingMilliseconds);

        const updatedRes = res.status(201).json({
          message: "Cart created successfully",
          success: true,
        });

        if (!user) {
          const getVisitor = await this.visitorRepo.findOne({
            where: { id: visitId },
          });
          user = this.userRepository.create({
            visitor: getVisitor!,
          });

          await this.userRepository.save(user);

          //dispatching user_created job
          await lastValueFrom(this.adminClient.emit("user_created", user));

          updatedRes.cookie("user", user.id, {
            httpOnly: true,
            expires: expiryDate,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
          });
        }

        const cart = this.cartRepository.create({
          items: [
            {
              id: (await crypto.randomBytes(6)).toString("hex"),
              variant_id: variantId,
              quantity,
              product,
            },
          ],
          user,
          total_amount: parseFloat(totalAmount.toFixed(2)),
        });

        await this.cartRepository.save(cart);

        //dispatching cart_created job
        await lastValueFrom(this.adminClient.emit("cart_created", cart));

        updatedRes.cookie("cart", cart.id, {
          httpOnly: true,
          expires: expiryDate,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/",
        });

        return updatedRes;
      } else {
        await this.addToCart(
          cartId,
          userId,
          { product, quantity, variantId, price },
          res
        );
      }
    } catch (error) {
      const e = error as Error;
      return res.status(500).json({
        error: e.message,
      });
    }
  }

  async updateCart(req: Request, res: Response) {
    try {
      const { userId } = req.body;

      const cartId = getDataFromCart(req);

      //creating checkout session token
      const buffer = await crypto.randomBytes(32);
      const hashedToken = buffer.toString("hex");

      const remainingMilliseconds = 5184000000; // 2 month
      const now = new Date();
      const expiryDate = new Date(now.getTime() + remainingMilliseconds);

      if (!cartId) throw new BadRequestException("invalid cart id");

      //retrieving cart and user data for the current public session
      const cart = await this.cartRepository.findOneBy({ id: cartId });

      const user = await this.userRepository.findOneBy({ id: userId });

      if (!user) throw new NotFoundException("user not found");

      //creating add to cart state in order
      const order = this.orderRepository.create({
        status: "add to cart",
        sales: cart!.total_amount,
        user,
      });

      await this.orderRepository.save(order);

      //dispatching order_created job
      await lastValueFrom(this.adminClient.emit("order_created", order));

      const updatedRes = res.status(201).json({
        message: "Order created!",
        checkout_session_token: hashedToken,
        success: true,
      });

      updatedRes.cookie("checkout_session_token", hashedToken, {
        expires: expiryDate,
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      updatedRes.cookie("order", order.id, {
        expires: expiryDate,
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      return updatedRes;
    } catch (error) {
      const e = error as Error;
      return res.status(500).json({
        error: e.message,
      });
    }
  }

  async checkout(req: Request, res: Response) {
    try {
      const cartId = getDataFromCart(req);
      let orderItems: any[] = [];

      const [orderId, checkoutSessionToken] = getDataFromOrder(req);

      if (!orderId && !cartId) throw new BadRequestException("invalid cart id");

      // Retrieving order data for the current checkout session
      const order = await this.orderRepository.findOneBy({ id: orderId });

      if (!order) throw new NotFoundException("No order has been created");

      // Retrieving cart data for the current public session
      const cart = await this.cartRepository.findOneBy({ id: cartId });

      if (!cart)
        throw new NotFoundException(
          "cart doesn't exist. Create a cart and start adding items"
        );

      const cartItems = cart.items.map((item, i) => {
        return {
          product: item.product,
          quantity: item.quantity,
          variant_id: item.variant_id,
        };
      });

      for (let item of cartItems) {
        orderItems.push({
          id: (await crypto.randomBytes(6)).toString("hex"),
          variant_id: item.variant_id,
          quantity: item.quantity,
          product: item.product,
        });
      }

      //updating order with checkout state
      order.items = orderItems;
      order.status = "checkout";
      order.sales = cart.total_amount;

      await order.save();

      //dispatching order_updated job
      await lastValueFrom(this.adminClient.emit("order_updated", order));

      return res.status(200).json({
        message: "session token retrieved",
        checkout_session_token: checkoutSessionToken,
        success: true,
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
