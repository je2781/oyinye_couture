// src/entities/user.entity.ts

import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";

import { AbstractEntity} from "@app/common";
import { Session } from "./session.entity";

@Entity({ name: "users" })
export class User extends AbstractEntity<User> {
  @Column({ type: "text", nullable: true })
  first_name?: string;

  @Column({ type: "text", nullable: true })
  last_name?: string;

  @Column({ type: "text", unique: true, nullable: true })
  email?: string;

  @Column({ type: "text", nullable: true })
  password?: string;

  @Column({ type: "boolean", default: false })
  enable_email_marketing: boolean;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ type: "boolean", default: false })
  buyer_is_verified: boolean;

  @Column({ type: "boolean", default: false })
  is_guest: boolean;

  @Column({ type: "boolean", default: false })
  account_is_verified: boolean;

  @Column({ type: "boolean", default: false })
  reviewer_is_verified: boolean;

  @Column({ nullable: true })
  verify_token?: string;

  @Column({ type: "timestamp", nullable: true })
  verify_token_expiry_date?: Date;

  @Column({ nullable: true })
  reset_token?: string;

  @Column({ type: "timestamp", nullable: true })
  reset_token_expiry_date?: Date;

  @Column({ type: "boolean", default: false })
  is_admin: boolean;

  @Column({ type: "jsonb", nullable: true })
  shipping_info: any;

  @Column({ type: "jsonb", nullable: true })
  billing_info: any;

  @Column({ type: "boolean", default: false })
  save_shipping_info: boolean;

  @Column({ type: "boolean", default: false })
  save_billing_info: boolean;

  @OneToMany(() => Session, (session) => session.user)
  sessions: Session[]

  @CreateDateColumn({ name: "createdAt" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updatedAt" })
  updatedAt: Date;
}
