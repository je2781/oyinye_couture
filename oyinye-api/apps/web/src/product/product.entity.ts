// src/entities/product.entity.ts

import {
    Entity,
    PrimaryColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
  } from 'typeorm';
import { AbstractEntity } from '@app/common';
import { Review } from '../review/review.entity';
  
  @Entity()
  export class Product extends AbstractEntity<Product>{
 
    @Column({ default: false })
    is_feature: boolean;
  
    @Column({ type: 'varchar', nullable: true })
    title: string;
  
    @Column({ type: 'jsonb' })
    features: string[];
  
    @Column({ type: 'jsonb' })
    colors: any[];
  
    @Column({nullable: true})
    description: string;
  
    @Column({nullable: true})
    type: string;
  
    @Column({ default: 0 })
    no_of_orders: number;
  
    @Column({ default: false })
    is_hidden: boolean;

    @OneToMany(() => Review, (review) => review.product)
    reviews: Review[];

    @CreateDateColumn({ name: 'createdAt' })
    createdAt: Date;
  
    @UpdateDateColumn({ name: 'updatedAt' })
    updatedAt: Date;
  
  }
  