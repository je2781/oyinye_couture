// src/entities/enquiry.entity.ts

import { AbstractEntity } from '@app/common';
import {
    Entity,
    PrimaryColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
import { User } from '../user/user.entity';
  
  @Entity({ name: 'enquiries' })
  export class Enquiry extends AbstractEntity<Enquiry>{
    @Column({ type: 'jsonb', nullable: true })
    contact: any;
  
    @Column({ type: 'jsonb', nullable: true })
    order: any;
  
  
    @ManyToOne(() => User, user => user.enquiries, {
      onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'user_id' })
    user: User;
  
    @CreateDateColumn({ name: 'createdAt' })
    createdAt: Date;
  
    @UpdateDateColumn({ name: 'updatedAt' })
    updatedAt: Date;
  }
  