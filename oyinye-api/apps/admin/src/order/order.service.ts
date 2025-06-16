// order.service.ts
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Response, Request } from "express";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository} from "typeorm";
import { getDataFromCart } from "libs/common/utils/getDataFromCart";
import { ClientProxy } from "@nestjs/microservices";
import { EMAIL_SERVICE } from "../constants/service";
import { lastValueFrom } from "rxjs";
import { EmailType } from "libs/common/interfaces";
import { Order } from "./order.entity";
import { Cart } from "../cart/cart.entity";

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @Inject(EMAIL_SERVICE) private readonly emailClient: ClientProxy
  ) {}

  async getOrders(page: number, perPage: number, res: Response) {
    try {
      const [orders, count] = await this.orderRepository.findAndCount({
        order: { createdAt: "DESC" },
        skip: (page - 1) * perPage,
        take: perPage,
        relations: {user: true}
      });

      const currentPage = page;
      const hasPreviousPage = currentPage > 1;
      const hasNextPage = count > currentPage * perPage;
      const lastPage = Math.ceil(count / perPage);

      if (orders.length === 0) {
        return res.status(200).json({
          hasNextPage,
          hasPreviousPage,
          lastPage,
          currentPage,
          isActivePage: page,
          nextPage: currentPage + 1,
          previousPage: currentPage - 1,
          orders,
        });
      }

      const updatedOrders = orders.map((order) => ({
        id: order.id,
        items: order.items.map((item) => {
          let price: number = 0;
          let frontBase64Images: string[] = [];
          let colorType: string = "";
          let size: number = 0;
          item.product.colors.forEach((color: any) => {
            if (
              color.sizes.find(
                (size: any) => size.variant_id === item.variant_id
              )
            ) {
              price = color.sizes.find(
                (size: any) => size.variant_id === item.variant_id
              ).price;
              size = color.sizes.find(
                (size: any) => size.variant_id === item.variant_id
              ).number;
              frontBase64Images = color.image_front_base64;
              colorType = color.names;
            }
          });
          return {
            quantity: item.quantity,
            variantId: item.variant_id,
            productType: item.product.type,
            total: price * item.quantity,
            frontBase64Images,
            color: colorType,
            size,
          };
        }),
        totalQuantity: order.items
          .map((item) => item.quantity)
          .reduce((prev: number, current: number) => prev + current, 0),
        sales: order.sales,
        date: order.createdAt,
        status: order.status,
        paymentType: order.payment_type ?? "",
        paymentStatus: order.payment_status ?? "",
        shippingMethod: order.shipping_method ?? "",
      }));

      return res.status(200).json({
        hasNextPage,
        hasPreviousPage,
        lastPage,
        currentPage,
        isActivePage: page,
        nextPage: currentPage + 1,
        previousPage: currentPage - 1,
        orders: updatedOrders,
        success: true,
      });
    } catch (error) {
      return res.status(500).json({
        error: error.message,
      });
    }
  }

  async handlePostRequest(
    orderId: string,
    req: Request,
    res: Response,
    body: any,
    action?: string
  ) {
    try {
      //retrieving order data for the current checkout session
      const order = await this.orderRepository.findOne({
        where: {
          id: orderId,
        },
        relations: {user: true}
      });

      if (!order) throw new NotFoundException("order with id doesn't exist");

      //getting cartid for reminder and deletion when payment status is 'paid'
      const cartId = getDataFromCart(req);

      if (!cartId) throw new BadRequestException("Invalid cart id");

      switch (action) {
        case "payment-status": {
          const { paymentStatus } = body;

          if (paymentStatus === "paid") {
            //closing order for when order is paid, and destroying related cart
            order.status = "closed";
            order.payment_status = paymentStatus;
            await this.orderRepository.save(order);
            

            await this.cartRepository.delete(cartId);

            //clearing cart cookie for paid order
            res.clearCookie("cart");

            return res.status(201).json({
              message: "order updated",
              success: true,
            });
          }

          order.payment_status = paymentStatus;
          await this.orderRepository.save(order);

          return res.status(201).json({
            message: "order updated",
            success: true,
          });
        }
        case "reminder": {
          const { items } = body;
          const cart = await this.cartRepository.findOne({
            where: { id: cartId },
          });

          //dispatching cart reminder job
          await lastValueFrom(
            this.emailClient.emit("cart_reminder", {
              email: order.user.email,
              emailType: EmailType.request,
              emailBody: {
                link: `${process.env.WEB_DOMAIN}/cart`,
                id: cartId,
                total: cart!.total_amount,
                items,
              },
              access_token: req.cookies['access_token']
            })
          );

          return res.status(201).json({
            message: "cart reminder sent",
            success: true,
          });
        }

        case "payment-request": {
          const { link, id, total } = body;

          //dispatchign payment request reminder job
          await lastValueFrom(
            this.emailClient.emit("payment_request_reminder", {
              email: order.user.email,
              emailType: EmailType.request,
              userId: order.user.id,
              emailBody: {
                link,
                id,
                total,
              },
              access_token: req.cookies['access_token']
            })
          );

          return res.status(201).json({
            message: "payment request sent",
            success: true,
          });
        }
      }
    } catch (error) {
      return res.status(500).json({
        error: error.message,
      });
    }
  }

  async updateOrder(orderId: string, data: any) {
    await this.orderRepository.update(orderId, data);
  }

  async createOrder(data: any) {
    await this.orderRepository.save(data);
  }
}
