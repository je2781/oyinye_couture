// src/entities/product.entity.ts

import { Entity, Column, CreateDateColumn, UpdateDateColumn, OneToMany, PrimaryColumn } from "typeorm";


@Entity({ name: "products" })
export class Product {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ default: false })
  is_feature: boolean;

  @Column({ type: "text", nullable: true })
  title: string;

  @Column({ type: "jsonb" })
  features: string[];

  @Column({ type: "jsonb" })
  colors: any[];

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "text", nullable: true })
  type: string;

  @Column({ default: 0 })
  no_of_orders: number;

  @Column({ default: false })
  is_hidden: boolean;

  @CreateDateColumn({ name: "createdAt" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updatedAt" })
  updatedAt: Date;

  @Column({ type: "jsonb", default: [] })
  collated_reviews: any[];
}
