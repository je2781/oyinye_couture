import { AbstractEntity } from "@app/common";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, UpdateDateColumn } from "typeorm";
import { Session } from "./session.entity";

@Entity({name: 'refreshTokens'})
export class RefreshToken extends AbstractEntity<RefreshToken> {

  
  @ManyToOne(() => Session, (session) => session.refresh_tokens, { onDelete: 'CASCADE' })
  @JoinColumn({name: 'session_id'})
  session: Session;

  @Column()
  token_hash: string; // store hashed token, not raw

  @Column()
  expires_at: Date;

  @Column({ default: false })
  is_revoked: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
