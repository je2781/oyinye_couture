// src/entities/cart.entity.ts

import {
    Entity,
    PrimaryColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
  } from 'typeorm';
import { User } from '../user/user.entity';
  
  @Entity({ name: 'carts' })
  export class Cart {
    @PrimaryColumn()
    id: string;
  
    @Column({ type: 'jsonb', default: [] })
    items: any[];
  
    @Column({ type: 'double precision', default: 0 })
    total_amount: number;
  
    @OneToOne(() => User, user => user.cart, {
      onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'user_id' })
    user: User;
  
    @CreateDateColumn({ name: 'createdAt' })
    createdAt: Date;
  
    @UpdateDateColumn({ name: 'updatedAt' })
    updatedAt: Date;
  

  }
  