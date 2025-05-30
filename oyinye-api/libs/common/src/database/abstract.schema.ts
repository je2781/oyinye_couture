import { BaseEntity, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class AbstractEntity<T> extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  constructor(entity: Partial<T>) {
    super();
    Object.assign(this, entity);
  }
}