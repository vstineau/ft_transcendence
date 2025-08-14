import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, Unique, BeforeInsert, BeforeUpdate, ManyToOne, OneToMany } from "typeorm"
import { IsEmail, Length, Matches, validateOrReject } from 'class-validator' 
import { getIsInvalidMessage } from "./utils/errorMessages.js";
import type { UserJson , UserHistory } from './types/userTypes.js'

//https://github.com/typestack/class-validator
@Entity()
@Unique(['email'])
@Unique(['login'])
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
	
	//blob for binary large object
	@Column({
    transformer: {
		to: (value: string) => Buffer.from(value), //convert string to buffer to store in db
		from: (value: Buffer) => value.toString() //convert buffer to string when read out from db
		}
	})
	avatar?: string;

	@Column()
	@Length(1, 50)
	@Matches(/^[A-Za-z]+$/, {message: getIsInvalidMessage("firstname", "please only use alpabetic characters")})
	login!: string;

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

	@Column({type: 'boolean', default: false})
	twoFaAuth!: boolean; 

	@Column()
	twoFaSecret?: string; 

	static async createUser(data: UserJson): Promise<User> {
		return new User(data);
	}

	async getInfos(): Promise<UserJson> {
		let twoFaSecret: string;
		this.twoFaSecret ? twoFaSecret = this.twoFaSecret: twoFaSecret = '';
		return {
			id: this.id,
			login: this.login,
			nickName: this.nickName,
			password: this.password,
			email: this.email,
			twoFaAuth: this.twoFaAuth,
			twoFaSecret: twoFaSecret,
		};
	}

	//bcrypt here?
	async comparePassword(password: string): Promise<boolean> {
		return this.password.localeCompare(password) == 0;
	}

	constructor(obj?: UserJson)
	{
		super();
		this.login = obj?.login ?? '';
		this.nickName = obj?.nickName ?? '';
		this.password = obj?.password ?? '';
		this.email = obj?.email ?? '';
		this.twoFaAuth = obj?.twoFaAuth ?? false;
	}

	@OneToMany(() => History, (history: History) => history.user, { cascade: true })
    history?: History[];
};

@Entity()
export class History {

	@PrimaryGeneratedColumn()
	gamecount?: number;

	@Column()
	type?: string;

	@Column()
	date?: string;

	@Column()
	opponent?: string;

	@Column()
	score?: string;

	@Column()
	win?: boolean;

	@ManyToOne(() => User, (user: User) => user.history)
    user: User;

	constructor(user: User , data?: UserHistory)
	{
		if (data) {
			this.date = data.date;
			this.opponent = data.opponent;
			this.score = data.score;
			this.win = data.win;
		}
		this.user = user;
	}
};
