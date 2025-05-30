import { AbstractEntity } from '@app/common';
import {
    Entity,
    PrimaryColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
  } from 'typeorm';
import { Product } from '../product/product.entity';
import { User } from '../user/user.entity';

  
  @Entity('reviews')
  export class Review extends AbstractEntity<Review>{
    @Column({ nullable: true })
    headline: string;
  
    @Column({ default: false })
    is_media: boolean;
  
    @Column('int')
    rating: number;
  
    @Column('text')
    content: string;
  
    @Column({ type: 'int', default: 0 })
    likes: number;
  
    @Column({ type: 'int', default: 0 })
    dislikes: number;
  
    @ManyToOne(() => Product, (product) => product.reviews, { onDelete: 'CASCADE', cascade: true })
    @JoinColumn({ name: 'product_id' })
    product: Product;
  
    @ManyToOne(() => User, (user) => user.reviews, { onDelete: 'CASCADE', cascade: true })
    @JoinColumn({ name: 'user_id' })
    user: User;
  
    @CreateDateColumn({ name: 'createdAt' })
    createdAt: Date;
  
    @UpdateDateColumn({ name: 'updatedAt' })
    updatedAt: Date;
  }
  