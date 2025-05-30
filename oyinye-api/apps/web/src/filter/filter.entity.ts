import { AbstractEntity } from '@app/common';
import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('filters')
export class Filter extends AbstractEntity<Filter>{

  @Column({ type: 'jsonb', nullable: true })
  search: any;

  @Column({ type: 'jsonb', nullable: true })
  collections: any;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}
