// order.service.ts
import { BadRequestException, HttpException, HttpStatus, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Response, Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Order } from './order.entity';
import { Cart } from '../cart/cart.entity';
import { getDataFromOrder } from 'libs/common/utils/getDataFromOrder';
import { getUserData } from 'libs/common/utils/getUserData';
import { getDataFromCart } from 'libs/common/utils/getDataFromCart';
import { ClientProxy } from '@nestjs/microservices';
import { ADMIN_SERVICE} from '../constants/service';
import { lastValueFrom } from 'rxjs';
import { sanitizeInput } from 'libs/common/utils/sanitize';
import { User } from '../user/user.entity';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private httpService: HttpService,
    @Inject(ADMIN_SERVICE) private readonly adminClient: ClientProxy
  ) {}



  async handlePostRequest(req: Request, res: Response, body: any, action?: string) {
    try {
      
      const [orderId, checkoutSessionToken] = getDataFromOrder(req);
      const userId = getUserData(req);
  
          //retrieving order data for the current checkout session
      const order = await this.orderRepository.findOne({
          where: {
              id: orderId,
          },
          relations: {user: true}
      });
  
      //getting cartid for reminder updated payment status to 'paid'
      const cartId = getDataFromCart(req);
  
      if(action){
  
          if(action === 'transaction-status'){
            const {txn_ref, merchant_code, amount} = body;
  
            if(cartId){
              const transRes = await lastValueFrom(this.httpService.get(`https://webpay.interswitchng.com/collections/api/v1/gettransaction.json?merchantcode=${
                merchant_code
              }&transactionreference=${
              txn_ref
              }&amount=${amount}`));
              
              if(transRes.data.ResponseCode === '10' || transRes.data.ResponseCode === '11' || transRes.data.ResponseCode === '00'){
                //trimming data object
                delete transRes.data.ResponseCode;
  
                if (order) {
                  //closing order for when order is paid, and destroying related cart
                  order.payment_info = transRes.data;
                  order.payment_status = 'paid';
                  order.status = 'closed';
                  await this.orderRepository.save(order);
  
                  await this.cartRepository.delete(cartId);
  
                  //dispatching destroyed cart job
                  await lastValueFrom(
                    this.adminClient.emit('cart_destroyed', cartId)
                  );
      
                  //clearing cart cookie for paid order
                  const updatedRes = res.clearCookie('cart');
  
                  const nextResponse = updatedRes.status(201).json({
                    message: transRes.data.ResponseDescription,
                    success: true
                  });
  
                  return nextResponse;
                }else{
                  throw new HttpException("No order has been created", HttpStatus.NOT_FOUND);
                }
  
              }else{
  
                if (order) {
                  order.payment_info = transRes.data;
                  order.payment_status = 'failed';
        
                  await this.orderRepository.save(order);
  
                  return res.status(500).json({
                    message: transRes.data.ResponseDescription
                  });
                }else{
                  throw new HttpException("No order has been created", HttpStatus.NOT_FOUND);
  
                }
  
                
              }
            }else{
              throw new BadRequestException('payment not successful. invalid cart id');
            }
          }
      }else{
          const {shippingInfo, billingInfo, saveBillingInfo, saveShippingInfo, paymentType, status, paymentStatus, shippingMethod, userEmail} = body;
          const cleanEmail = sanitizeInput(userEmail);
  
          const user = await this.userRepository.findOne({
              where: {
                  email: cleanEmail!
              }
          });
  
          if(order && user){
              //protecting against unauthorized access
            if(order.user.id != userId){
              throw new UnauthorizedException('Not Authorized');
            }
  
            order.payment_status = paymentStatus;
            order.status = status;
            order.payment_type = paymentType;
            order.shipping_method = shippingMethod;
  
            user.save_billing_info = saveBillingInfo;
            user.save_shipping_info = saveShippingInfo;
            user.shipping_info = shippingInfo;
            user.billing_info = billingInfo;
  
            await this.orderRepository.save(order);
            await this.userRepository.save(user);
  
            //dispatching order_updated and user_updated jobs
            await lastValueFrom(
              this.adminClient.emit('order_updated', {
                id: orderId,
                data: order
              })
            );
  
            await lastValueFrom(
              this.adminClient.emit('user_updated', {
                id: userId,
                data: user
              })
            );
  
            return res.status(201).json({
              message: 'order updated',
              success: true
              });
          }else{
              return res.status(404).json({
                  message: 'no user has created an order',
                  success: false
              }); 
          }
      
      }
    } catch (error) {
      const e = error as Error;
      return res.status(500).json({
          error: e.message
      });
    }
  }
}
