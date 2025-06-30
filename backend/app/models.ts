import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, Unique, BeforeInsert, BeforeUpdate } from "typeorm"
import { IsEmail, Length, Matches, validateOrReject } from 'class-validator' 
import { getIsInvalidMessage } from "./utils/errorMessages.js";
import type { UserJson } from './types/userTypes.js'

//https://github.com/typestack/class-validator
@Entity()
@Unique(['email', 'nickName'])
export class User extends BaseEntity {

	@BeforeInsert()
	async validateInsert() {
		await validateOrReject(this);
	}

	@BeforeUpdate()
	async validateUpdate() {
		await validateOrReject(this, {skipMissingProperties: true});
	}

	@PrimaryGeneratedColumn()
	id!: number;

	@Column()
	@Length(1, 50)
	@Matches(/^[A-Za-z]+$/, {message: getIsInvalidMessage("firstname", "please only use alpabetic characters")})
	firstName!: string;

	@Column()
	@Length(1, 50)
	@Matches(/^[A-Za-z]+$/, {message: getIsInvalidMessage("lastname", "please only use alpabetic characters")})
	lastName!: string;

	@Column()
	@Length(1, 50)
	nickName!: string;

	@Column()
	//Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character:
	@Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {message : getIsInvalidMessage("password", "please use  password with at least 8 characters, one uppercase, one lowercase, one number and one special character")})
	password!: string;

	@Column()
	@IsEmail(undefined, {message: getIsInvalidMessage('Email')})
	email!: string;

	static async createUser(data: UserJson): Promise<User> {
		return new User(data);
	}

	constructor(obj: UserJson)
	{
		super();
		this.firstName = obj?.firstName ?? '';
		this.lastName = obj?.lastName ?? '';
		this.nickName = obj?.nickName ?? '';
		this.password = obj?.password ?? '';
		this.email = obj?.email ?? '';
	}
	//@Column()
	//gameHistory: History> = new History;

	//avatar
}


//export default class History{}
