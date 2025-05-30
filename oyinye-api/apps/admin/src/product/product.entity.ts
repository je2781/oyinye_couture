// src/entities/product.entity.ts

import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { AbstractEntity } from "@app/common";

@Entity({ name: "products" })
export class Product extends AbstractEntity<Product> {
  @Column({ default: false })
  is_feature: boolean;

  @Column({ type: 'varchar', nullable: true })
  title: string;

  @Column({ type: "jsonb" })
  features: string[];

  @Column({ type: "jsonb" })
  colors: any[];

  @Column({nullable: true})
  description: string;

  // @Column({ type: 'jsonb', default: [] })
  // collated_reviews: string[]; // assuming array of review IDs (strings)

  @Column({nullable: true})
  type: string;

  @Column({ default: 0 })
  no_of_orders: number;

  @Column({ default: false })
  is_hidden: boolean;

  @CreateDateColumn({ name: "createdAt" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updatedAt" })
  updatedAt: Date;
}
