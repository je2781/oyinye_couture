import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, Repository } from "typeorm";
import { Request, Response } from "express";
import { Product } from "./product.entity";

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product) private productRepo: Repository<Product>
  ) {}

  async hide(id: string, hide: boolean) {
    await this.productRepo.update(id, {
      is_hidden: hide,
    });

    return { message: "product hidden!" };
  }

  async createProduct(product: Product) {
    await this.productRepo.save(product);
    return { message: "product created!" };
  }

  async updateProduct(id: string, product: Product) {
    await this.productRepo.update(id, product);
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
}
