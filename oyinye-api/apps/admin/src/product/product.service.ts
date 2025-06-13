import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, Repository } from "typeorm";
import { Request, Response } from "express";
import { Product } from "./product.entity";
import { WEB_SERVICE } from "../constants/service";
import { ClientProxy } from "@nestjs/microservices";
import { lastValueFrom } from "rxjs";
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @Inject(WEB_SERVICE) private webClient: ClientProxy
  ) {}

  async hide(id: string, hide: boolean) {
    await this.productRepo.update(id, {
      is_hidden: hide,
    });

    return { message: "product hidden!" };
  }

  async createProduct(files: Express.Multer.File[], req: Request) {
    // Parse basic fields
    const title = req.body.title;
    const type = req.body.type;
    const description = req.body.description;
    const is_feature = JSON.parse(req.body.is_feature);
    const features = JSON.parse(req.body.features);
    const noOfOrders = JSON.parse(req.body.no_of_orders);
    const reviews = JSON.parse(req.body.reviews);
    
    const colors: any[] = [];

    let i = 0;
    while (req.body[`colors_${i}_name`]) {
      const name = req.body[`colors_${i}_name`];
      const hexCode = req.body[`colors_${i}_hex_code`];
      let isAvailable = false;

      // Gather all front image files
      const frontFiles = files.filter((f) =>
        f.fieldname.startsWith(`colors_${i}_image_front_base64_`)
      );

      const image_front_base64: string[] = await Promise.all(
        frontFiles.map((file) => file.path)
      );

      // Only one back image expected
      const backFile = files.find(
        (f) => f.fieldname === `colors_${i}_image_back_base64`
      );
      const image_back_base64 = backFile ? backFile.path : null;

      // Sizes parsing
      const sizes: any[] = [];
      let j = 0;
      while (req.body[`colors_${i}_sizes_${j}_stock`]) {
        const size: Record<string, string> = {};
        for (const key in req.body) {
          const prefix = `colors_${i}_sizes_${j}_`;
          if (key.startsWith(prefix)) {
            const prop = key.substring(prefix.length, key.length);
            size[prop] = JSON.parse(req.body[key]);
            if(prop === 'stock'){
              isAvailable = Number(JSON.parse(req.body[key])) > 0;
            }
          }
        }
        sizes.push(size);
        j++;
      }

      colors.push({
        name,
        hex_code: hexCode,
        is_available: isAvailable,
        image_front_base64,
        image_back_base64,
        sizes,
      });

      i++;
    }

    const product = await this.productRepo.save({
      id: uuidv4(),
      no_of_orders: Number(noOfOrders),
      title,
      reviews,
      type,
      description,
      is_feature,
      features,
      colors,
    });

    //dispatching product_created job
    await lastValueFrom(this.webClient.emit('product_created', {
      product,
      access_token: req.cookies['access_token']
    }));

    return { message: "product created!" };
  }

  async updateProduct(id: string, files: Express.Multer.File[], req: Request) {
    const product = await this.productRepo.findOne({where: {id}});

    if(!product) throw new NotFoundException('Product not found');

    // Parse basic fields
    const type = req.body.type;
    const description = req.body.description;
    const is_feature = JSON.parse(req.body.is_feature);
    const features = JSON.parse(req.body.features);
    const reviews = JSON.parse(req.body.reviews);

    const colors: any[] = [];

    let i = 0;
    while (req.body[`colors_${i}_name`]) {
      const name = req.body[`colors_${i}_name`];
      const hexCode = req.body[`colors_${i}_hex_code`];
      const isAvailable = JSON.parse(req.body[`colors_${i}_is_available`]);

      // Gather all front image files
      const frontFiles = files.filter((f) =>
        f.fieldname.startsWith(`colors_${i}_image_front_base64_`)
      );

      const image_front_base64: string[] = await Promise.all(
        frontFiles.map((file) => file.path)
      );

      // Only one back image expected
      const backFile = files.find(
        (f) => f.fieldname === `colors_${i}_image_back_base64`
      );
      const image_back_base64 = backFile ? backFile.path : null;

      // Sizes parsing
      const sizes: any[] = [];
      let j = 0;
      while (req.body[`colors_${i}_sizes_${j}_stock`]) {
        const size: Record<string, string> = {};
        for (const key in req.body) {
          const prefix = `colors_${i}_sizes_${j}_`;
          if (key.startsWith(prefix)) {
            const prop = key.substring(prefix.length, key.length);
            size[prop] = JSON.parse(req.body[key]);
          }
        }
        sizes.push(size);
        j++;
      }

      colors.push({
        name,
        hex_code: hexCode,
        is_available: isAvailable,
        image_front_base64,
        image_back_base64,
        sizes,
      });

      i++;
    }

    product.colors = colors;
    product.type = type;
    product.description = description;
    product.is_feature = Boolean(is_feature);
    product.features = features;
    product.collated_reviews = reviews;

    await this.productRepo.save(product);

    //dispatching product_updated job
    await lastValueFrom(this.webClient.emit('product_updated', {
      id: product.id,
      data: product,
      access_token: req.cookies['access_token']
    }));

    return { message: "product updated!" };
  }

  async getSearchResults(queryParams: any, req: Request, res: Response) {
    try {
      const ITEMS_PER_PAGE = 21;

      let query = queryParams.q;
      let page = queryParams.page;

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
        });
      }

      // Sorting sizes
      for (let product of products) {
        for (let color of product.colors) {
          color.sizes.sort(
            (a: any, b: any) => (a?.number || 0) - (b?.number || 0)
          );
        }
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

        success: true,
      });
    } catch (error) {}
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

  async updateProductReviews(id: string, data: any){
    await this.productRepo.update(id, data);
  }
}
