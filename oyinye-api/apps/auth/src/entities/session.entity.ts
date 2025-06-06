import { AbstractEntity } from '@app/common';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { RefreshToken } from './refresh-token.entity';

@Entity({name: 'sessions'})
export class Session extends AbstractEntity<Session>{

  @ManyToOne(() => User, (user) => user.sessions, { onDelete: 'CASCADE' })
  @JoinColumn({name: 'user_id'})
  user: User;

  @OneToMany(() => RefreshToken, (rt) => rt.session)
  refresh_tokens: RefreshToken[];

  @Column()
  ip: string;

  @Column()
  user_agent: string;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
