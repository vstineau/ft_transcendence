import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, Unique } from "typeorm"
import { IsEmail, } from 'class-validator' 

@Entity()
@Unique(['email'])
export default class User extends BaseEntity {

	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	firstName: string;

	@Column()
	lastName: string;

	@Column()
	password: string;

	@Column()
	mail: string;

}
