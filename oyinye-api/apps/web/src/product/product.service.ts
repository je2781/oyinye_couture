import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, Raw, Repository } from "typeorm";
import { Product } from "./product.entity";
import { Request, Response } from "express";
import { Cart } from "../cart/cart.entity";
import { Review } from "../review/review.entity";
import { lastValueFrom } from "rxjs";
import { ADMIN_SERVICE, EMAIL_SERVICE } from "../constants/service";
import { ClientProxy } from "@nestjs/microservices";
import {
  randomReference,
} from "libs/common/utils/getHelpers";
import * as argon2 from "argon2";
import { EmailType } from "libs/common/interfaces";
import { ProductParamsDto } from "./dto/product-param.dto";
import { UpdateReviewFeedbackDto } from "./dto/update-review-feedback.dto";
import * as crypto from "crypto";
import { Filter } from "../filter/filter.entity";
import { Order } from "../order/order.entity";
import { ConfigService } from "@nestjs/config";
import { User } from "../user/user.entity";

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Cart) private readonly cartRepo: Repository<Cart>,
    @InjectRepository(Review) private readonly reviewRepo: Repository<Review>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Filter)
    private readonly filterRepo: Repository<Filter>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @Inject(ADMIN_SERVICE) private readonly adminClient: ClientProxy,
    @Inject(EMAIL_SERVICE) private readonly emailClient: ClientProxy,
    private configService: ConfigService
  ) {}


  async get(
    params: ProductParamsDto,
    viewedP: string,
    req: Request,
    res: Response
  ) {
    try {
      let extractedProductsArray: Product[] = [];
      let authors: User[] = [];
      let updatedProducts: Product[] = [];
      let reviews: Review[] = [];
      let updatedReviews: any[] = [];

      const viewedProducts = viewedP;

      // ===== Load the product first =====
      const title =
        params.product.charAt(0).toUpperCase() +
        params.product.replace("-", " ").slice(1);

      const product = await this.productRepo.findOne({
        where: { title },
        
      });

      if (!product) throw new NotFoundException("product doesn't exit");

      const extractedColorObj = product.colors.find(
        (color: any) => color.name === params.color.replace("-", " ")
      );

      if (!extractedColorObj)
        throw new NotFoundException("product colors doesn't exit");

      if (viewedProducts != "undefined") {
        const viewedProductsArray = JSON.parse(viewedProducts);

        for (const viewedProduct of viewedProductsArray) {
          let extractedProduct = await this.productRepo
            .createQueryBuilder("product")
            .where(`product.colors @> :colorCondition`, {
              colorCondition: JSON.stringify([
                { sizes: [{ variant_id: viewedProduct }] },
              ]),
            })
            .getOne();

          if (extractedProduct) {
            extractedProductsArray.push(extractedProduct);
          }
        }
      }

      const extractedProductsOfSimilarColor = await this.productRepo
        .createQueryBuilder("product")
        .where(
          `(product.colors @> :colorName AND NOT product.colors @> :excludedVariant)`,
          {
            colorName: JSON.stringify([{ name: extractedColorObj.name }]),
            excludedVariant: JSON.stringify([
              { sizes: [{ variant_id: params.variantId }] },
            ]),
          }
        )
        .getMany();

      const carts = await this.cartRepo
        .createQueryBuilder("cart")
        .where(`cart.items @> :productMatch`, {
          productMatch: JSON.stringify([{ product: { id: product.id } }]),
        })
        .getMany();

      if (carts.length > 0) {
        for (const cart of carts) {
          let products = cart.items.map((item: any) => item.product);
          updatedProducts.push(...products);
        }
      }

      for(const reviewId of product.collated_reviews){

        reviews = await this.reviewRepo.find({
          where: {
            id: reviewId,
          },
        });
        reviews.sort((a, b) => b.likes - a.likes);
  
        for (const review of reviews) {
          const user = await this.userRepo.findOneBy({ id: review.user.id });
          authors.push(user!);
        }
  
        updatedReviews = reviews.map((review) => {
          const extractedAuthor = authors.find(
            (author) => author.id === review.user.id
          );
          return { ...review, author: extractedAuthor };
        });
      }

      updatedProducts = [
        ...updatedProducts,
        ...extractedProductsArray,
        ...extractedProductsOfSimilarColor,
      ];
      const relatedProducts = updatedProducts.filter(
        (prod) => prod.id !== product.id
      );

      return res.status(200).json({
        productSizes: extractedColorObj.sizes,
        productFrontBase64Images: extractedColorObj.image_front_base64,
        productId: product.id,
        productColor: extractedColorObj.name,
        productTitle: product.title,
        productColors: product.colors,
        productReviews: updatedReviews,
        relatedProducts,
        success: true,
      });
    } catch (error) {
      const e = error as Error;
      return res.status(500).json({
        erro: e.message,
      });
    }
  }

  async updateReview(
    req: Request,
    res: Response,
    body: UpdateReviewFeedbackDto
  ) {
    try {
      const { likes, dislikes, reviewId } = body;

      const review = await this.reviewRepo.findOneBy({ id: reviewId });

      review!.likes = likes;
      review!.dislikes = dislikes;

      await this.reviewRepo.save(review!);

      //dispatching review_updated job
      await lastValueFrom(
        this.adminClient.emit("review_updated", {
          review,
          access_token: req.cookies["access_token"],
        })
      );

      return res.status(201).json({
        message: "Product reviews updated successfully",
        success: true,
      });
    } catch (error) {
      const e = error as Error;
      return res.status(500).json({
        erro: e.message,
      });
    }
  }

  async createReview(title: string, req: Request, res: Response) {
    try {
      const {
        rating,
        email,
        name,
        review,
        headline,
        isMedia,
        avatar,
      } = req.body;

      let newReview: Review;

      title = title.charAt(0).toUpperCase() + title.replace("-", " ").slice(1);

      let user = await this.userRepo.findOneBy({ email });

      const product = await this.productRepo.findOne({
        where: {
          title,
        },
      });

      if (!product) throw new NotFoundException("product doesn't exist");

      if (!user) {

        let newPassword = randomReference();

        const hash = await argon2.hash(newPassword);


        user = this.userRepo.create({
          email,
          password: hash,
          first_name: name.split(" ").length === 2 ? name.split(" ")[0] : name,
          last_name: name.split(" ").length === 2 ? name.split(" ")[1] : name,
          avatar,
        });

        await this.userRepo.save(user);

        //dispatching user_created job
        await lastValueFrom(
          this.adminClient.emit("user_created", {
            user,
            access_token: req.cookies["access_token"],
          })
        );

        //dispatching password_created job
        await lastValueFrom(
          this.emailClient.emit("password_created", {
            password: newPassword,
            emailType: EmailType.reminder,
            email: user.email,
            access_token: req.cookies["access_token"],
          })
        );

        //dispatching account_verify job
        const verifyAccountToken = (await crypto.randomBytes(32)).toString(
          "hex"
        );
        await this.userRepo.update(user.id, {
          verify_token: verifyAccountToken,
          verify_token_expiry_date: new Date(Date.now() + 3600000),
        });
        await lastValueFrom(
          this.emailClient.emit("account_verify", {
            token: verifyAccountToken,
            EmailType: EmailType.verify_account,
            access_token: req.cookies["access_token"],
          })
        );

        //updating new review with product and user
        newReview = this.reviewRepo.create({
          headline,
          rating: +rating,
          content: review,
          is_media: isMedia,
        });

        await this.reviewRepo.save(newReview);
      } else {
        //updating product and user record with new user review and avatar
        user.avatar = avatar;

        await this.userRepo.save(user);

        newReview = this.reviewRepo.create({
          headline,
          rating: +rating,
          content: review,
          is_media: isMedia,
        });

        await this.reviewRepo.save(newReview);
      }

      //dispatching product_updated job
      product.collated_reviews = [...product.collated_reviews, newReview.id];

      await this.productRepo.save(product);

      await lastValueFrom(
        this.adminClient.emit("product_updated", {
          id: product.id,
          data: product,
          access_token: req.cookies["access_token"],
        })
      );

      //dispatching reviewer_verify job
      const verifyReviewerToken = (await crypto.randomBytes(32)).toString(
        "hex"
      );
      await this.userRepo.update(user.id, {
        verify_token: verifyReviewerToken,
        verify_token_expiry_date: new Date(Date.now() + 3600000),
      });
      await lastValueFrom(
        this.emailClient.emit("reviewer_verify", {
          token: verifyReviewerToken,
          emailType: EmailType.verify_reviewer,
          access_token: req.cookies["access_token"],
        })
      );

      return res.status(201).json({
        message: "product updated successfully",
        success: true,
      });
    } catch (error) {
      const e = error as Error;
      return res.status(500).json({
        erro: e.message,
      });
    }
  }

  async getResults(
    queryParams: any,
    req: Request,
    res: Response,
    action: string
  ) {
    try {
      let priceList: number[] = [];
      let filterSettings: Filter[] = [];
      const ITEMS_PER_PAGE = 21;

      if (action === "search") {
        let query = queryParams.q;
        let page = queryParams.page;
        let sort = queryParams.sort_by;
        let gte = queryParams["filter.v.price.gte"];
        let lte = queryParams["filter.v.price.lte"];
        let availability = queryParams["filter.v.availability"];
        let productType = queryParams["filter.p.product_type"];
        const updatedPage = +page! || 1;

        let [products, count] = await this.productRepo.findAndCount({
          where: [
            {
              title: ILike(`% %${query}%`),
              is_hidden: false,
            },
          ],
          order: { createdAt: "DESC" },
          skip: (updatedPage - 1) * ITEMS_PER_PAGE,
          take: ITEMS_PER_PAGE,
          
        });

        if (productType) {
          products = products.filter(
            (product) => product.type === productType!
          );
        }

        for (const product of products) {
          for (const color of product.colors) {
            color.sizes.forEach((size: any) => priceList!.push(size.price));
          }
        }

        const highestPrice = Math.max(...priceList!);

        if (availability || lte || gte || productType) {
          filterSettings = await this.filterRepo.find();
        }

        const currentPage = updatedPage;
        const hasPreviousPage = currentPage > 1;
        const hasNextPage = count > currentPage * ITEMS_PER_PAGE;
        const lastPage = Math.ceil(count / ITEMS_PER_PAGE);

        if (products.length === 0) {
          return res.status(200).json({
            products,
            hasNextPage,
            hasPreviousPage,
            lastPage,
            currentPage,
            isActivePage: updatedPage,
            nextPage: currentPage + 1,
            previousPage: currentPage - 1,
            filterSettings,
            highestPrice,
          });
        }

        // Filtering products based on price range
        if (lte) {
          for (let product of products) {
            for (let color of product.colors) {
              color.sizes = color.sizes.filter(
                (size: any) => size.price <= parseInt(lte)
              );
            }
          }
        }

        if (gte) {
          for (let product of products) {
            for (let color of product.colors) {
              color.sizes = color.sizes.filter(
                (size: any) => size.price >= parseInt(gte)
              );
            }
          }
        }

        if (gte && lte) {
          for (let product of products) {
            for (let color of product.colors) {
              color.sizes = color.sizes.filter(
                (size: any) =>
                  size.price >= parseInt(gte) && size.price <= parseInt(lte)
              );
            }
          }
        }

        // Sorting sizes and checking availability
        for (let product of products) {
          for (let color of product.colors) {
            if (availability) {
              color.sizes = color.sizes.filter((size: any) => size.stock > 0);
            }
            color.sizes.sort(
              (a: any, b: any) => (a?.number || 0) - (b?.number || 0)
            );
          }
        }

        // Sorting products according to price
        switch (sort) {
          case "price-descending":
            products.sort(
              (a, b) =>
                (b.colors?.[0]?.sizes?.[0]?.price || 0) -
                (a.colors?.[0]?.sizes?.[0]?.price || 0)
            );
            break;
          case "price-ascending":
            products.sort(
              (a, b) =>
                (a.colors?.[0]?.sizes?.[0]?.price || 0) -
                (b.colors?.[0]?.sizes?.[0]?.price || 0)
            );
            break;
          default:
            for (const product of products) {
              const noOfOrders = await this.orderRepo
                .createQueryBuilder("order")
                .where("order.items @> :productMatch", {
                  productMatch: JSON.stringify([
                    { product: { id: product.id } },
                  ]),
                })
                .getCount();

              product.no_of_orders = noOfOrders;
            }
            products.sort((a, b) => {
              if (b.no_of_orders === a.no_of_orders) {
                return b.collated_reviews.length - a.collated_reviews.length;
              }
              return b.no_of_orders - a.no_of_orders;
            });
            break;
        }

        return res.status(200).json({
          products,
          hasNextPage,
          hasPreviousPage,
          lastPage,
          currentPage,
          isActivePage: updatedPage,
          nextPage: currentPage + 1,
          previousPage: currentPage - 1,
          filterSettings,
          highestPrice,
          success: true,
        });
      }

      if (action === "collections") {
        let products: Product[] = [];
        let totalItems = 0;
        let page = queryParams.page;
        let sort = queryParams.sort_by;
        let dressColor = queryParams["filter.p.m.custom.colors"];
        let dressFeature = queryParams["filter.p.m.custom.feature"];
        let dressLength = queryParams["filter.p.m.custom.dress_length"];
        let fabric = queryParams["filter.p.m.custom.fabric"];
        let neckLine = queryParams["filter.p.m.custom.neckline"];
        let sleeveLength = queryParams["filter.p.m.custom.sleeve_length"];
        const updatedPage = +page! || 1;

        if (dressColor) {
          const [rows, count] = await this.productRepo.findAndCount({
            where: {
              colors: Raw(() => `colors @> :colorFilter`, {
                colorFilter: JSON.stringify([{ name: dressColor }]),
              }),
              is_hidden: false,
            },
            order: { createdAt: "DESC" },
            skip: (updatedPage - 1) * ITEMS_PER_PAGE,
            take: ITEMS_PER_PAGE,
            
          });
          totalItems = count;
          products = rows;
        } else if (dressFeature) {
          const [rows, count] = await this.productRepo.findAndCount({
            where: {
              colors: Raw(() => `features @> :featureFilter`, {
                featureFilter: JSON.stringify([dressFeature]),
              }),
              is_hidden: false,
            },
            order: { createdAt: "DESC" },
            skip: (updatedPage - 1) * ITEMS_PER_PAGE,
            take: ITEMS_PER_PAGE,
            
          });
          totalItems = count;
          products = rows;
        } else if (dressLength) {
          const [rows, count] = await this.productRepo.findAndCount({
            where: {
              colors: Raw(() => `features @> :featureFilter`, {
                featureFilter: JSON.stringify([dressLength]),
              }),
              is_hidden: false,
            },
            order: { createdAt: "DESC" },
            skip: (updatedPage - 1) * ITEMS_PER_PAGE,
            take: ITEMS_PER_PAGE,
            
          });
          totalItems = count;
          products = rows;
        } else if (fabric) {
          const [rows, count] = await this.productRepo.findAndCount({
            where: {
              colors: Raw(() => `features @> :featureFilter`, {
                featureFilter: JSON.stringify([fabric]),
              }),
              is_hidden: false,
            },
            order: { createdAt: "DESC" },
            skip: (updatedPage - 1) * ITEMS_PER_PAGE,
            take: ITEMS_PER_PAGE,
            
          });
          totalItems = count;
          products = rows;
        } else if (neckLine) {
          const [rows, count] = await this.productRepo.findAndCount({
            where: {
              colors: Raw(() => `features @> :featureFilter`, {
                featureFilter: JSON.stringify([neckLine]),
              }),
              is_hidden: false,
            },
            order: { createdAt: "DESC" },
            skip: (updatedPage - 1) * ITEMS_PER_PAGE,
            take: ITEMS_PER_PAGE,
            
          });
          totalItems = count;
          products = rows;
        } else if (sleeveLength) {
          const [rows, count] = await this.productRepo.findAndCount({
            where: {
              colors: Raw(() => `features @> :featureFilter`, {
                featureFilter: JSON.stringify([sleeveLength]),
              }),
              is_hidden: false,
            },
            order: { createdAt: "DESC" },
            skip: (updatedPage - 1) * ITEMS_PER_PAGE,
            take: ITEMS_PER_PAGE,
            
          });
          totalItems = count;
          products = rows;
        } else {
          const [rows, count] = await this.productRepo.findAndCount({
            where: {
              is_hidden: false,
            },
            skip: (updatedPage - 1) * ITEMS_PER_PAGE,
            take: ITEMS_PER_PAGE,
            
          });
          totalItems = count;
          products = rows;
        }

        //retrieving filter settings
        if (
          dressColor ||
          dressFeature ||
          dressLength ||
          fabric ||
          neckLine ||
          sleeveLength
        ) {
          filterSettings = await this.filterRepo.find();
        }

        const currentPage = updatedPage;
        const hasPreviousPage = currentPage > 1;
        const hasNextPage = totalItems > currentPage * ITEMS_PER_PAGE;
        const lastPage = Math.ceil(totalItems / ITEMS_PER_PAGE);

        if (products.length === 0) {
          return res.status(200).json({
            products,
            hasNextPage,
            hasPreviousPage,
            lastPage,
            currentPage,
            isActivePage: updatedPage,
            nextPage: currentPage + 1,
            previousPage: currentPage - 1,
            filterSettings,
          });
        }

        //sorting products
        switch (sort) {
          case "created-ascending":
            products.sort((a, b) => {
              const productA = new Date(a.createdAt).getTime();
              const productB = new Date(b.createdAt).getTime();
              return productA - productB;
            });
            break;
          case "created-descending":
            products.sort((a, b) => {
              const productA = new Date(a.createdAt).getTime();
              const productB = new Date(b.createdAt).getTime();
              return productB - productA;
            });
            break;
          case "title-descending":
            products.sort((a, b) => {
              return b.title.charAt(0).localeCompare(a.title.charAt(0));
            });
            break;
          case "title-ascending":
            products.sort((a, b) => {
              return a.title.charAt(0).localeCompare(b.title.charAt(0));
            });
            break;
          case "price-descending":
            products.sort((a, b) => {
              const priceA = a.colors?.[0]?.sizes?.[0]?.price || 0;
              const priceB = b.colors?.[0]?.sizes?.[0]?.price || 0;
              return priceB - priceA;
            });
            break;
          case "price-ascending":
            products.sort((a, b) => {
              const priceA = a.colors?.[0]?.sizes?.[0]?.price || 0;
              const priceB = b.colors?.[0]?.sizes?.[0]?.price || 0;
              return priceA - priceB;
            });
            break;
          case "best-selling":
            for (const product of products) {
              const noOfOrders = await this.orderRepo
                .createQueryBuilder("order")
                .where("order.items @> :itemsFilter", {
                  itemsFilter: JSON.stringify([
                    { product: { id: product.id } },
                  ]),
                })
                .getCount();

              product.no_of_orders = noOfOrders;
            }

            products.sort((a, b) => {
              if (b.no_of_orders === a.no_of_orders) {
                return b.collated_reviews.length - a.collated_reviews.length;
              }
              return b.no_of_orders - a.no_of_orders;
            });

            break;

          default:
            products = products.filter(
              (product) => product.is_feature === true
            );

            break;
        }

        return res.status(200).json({
          products,
          hasNextPage,
          hasPreviousPage,
          lastPage,
          currentPage,
          isActivePage: updatedPage,
          nextPage: currentPage + 1,
          previousPage: currentPage - 1,
          filterSettings,
          success: true,
        });
      }
    } catch (error) {
      const e = error as Error;
      return res.status(500).json({
        erro: e.message,
      });
    }
  }

  async getProducts(req: Request, res: Response, hidden: boolean) {
    try {
      let products: Product[] = [];

      products = await this.productRepo.find({ where: { is_hidden: hidden } });

      return res.status(200).json({
        products,
        success: true,
      });
    } catch (error) {
      const e = error as Error;
      return res.status(500).json({
        erro: e.message,
      });
    }
  }

  async createProduct(data: any){
    await this.productRepo.save(data);
  }

  async updateProduct(id: string, data: any){
    await this.productRepo.update(id, data);
  }

  async setViewedProductsCookie(req: Request, res: Response, variantId: string){
    const viewedP = req.cookies["viewed_p"];

    if (!viewedP) {
      res.cookie("viewed_p", JSON.stringify([variantId]), {
        expires: new Date(new Date().getTime() + 5184000000), // Expires in 2 month,
        secure: this.configService.get("NODE_ENV") === "production",
        httpOnly: true,
      });
    } else {
      const viewedProductsArray = JSON.parse(viewedP);

      // Add the new product variant id to the beginning of the array
      if (!viewedProductsArray.includes(variantId)) {
        viewedProductsArray.unshift(variantId);
      }

      // Limit the number of stored product variant ids (e.g., to the 10 most recent)
      if (viewedProductsArray.length > 10) {
        viewedProductsArray.pop();
      }

      res.cookie("viewed_p", JSON.stringify(viewedProductsArray), {
        expires: new Date(new Date().getTime() + 2629746000), // Expires in 1 month,
        secure: this.configService.get("NODE_ENV") === "production",
        httpOnly: true,
      });
    }

    return res.status(200).json({
      message: "cookie set",
    });
  }
}
