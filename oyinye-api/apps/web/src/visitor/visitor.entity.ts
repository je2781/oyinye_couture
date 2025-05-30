// src/entities/visitor.entity.ts

import {
    Entity,
    PrimaryColumn,
    Column,
    OneToOne,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
import { AbstractEntity } from '@app/common';
import { User } from '../user/user.entity';
  
  @Entity({ name: 'visitors' })
  export class Visitor extends AbstractEntity<Visitor> {

    @Column({ nullable: true })
    ip: string;
  
    @Column({ nullable: true })
    browser: string;
  
    @Column({ nullable: true })
    device: string;
  
    @CreateDateColumn({ name: 'createdAt' })
    createdAt: Date;
  
    @UpdateDateColumn({ name: 'updatedAt' })
    updatedAt: Date;
  
    @OneToOne(() => User, user => user.visitor)
    user: User;
  }
  