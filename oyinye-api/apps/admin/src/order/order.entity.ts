// src/entities/order.entity.ts

import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AbstractEntity } from '@app/common';
import { User } from '../user/user.entity';

@Entity({ name: 'orders' })
export class Order extends AbstractEntity<Order>{

  @Column({ type: 'jsonb', nullable: true })
  payment_info: any;

  @Column({ nullable: true })
  status: string;

  @Column({ nullable: true, type: 'float' }) // or 'double precision' for PostgreSQL
  sales?: number;

  @Column({ type: 'jsonb', default: [] })
  items: any[];

  @Column({ nullable: true })
  shipping_method?: string;

  @Column({ nullable: true })
  payment_type?: string;

  @Column({ nullable: true })
  payment_status?: string;


  @ManyToOne(() => User, user => user.orders, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}
