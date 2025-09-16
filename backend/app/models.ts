import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, Unique, BeforeInsert, BeforeUpdate, ManyToOne, OneToMany } from "typeorm"
import { IsEmail, Length, validateOrReject, IsNotEmpty } from 'class-validator'
import { getIsInvalidMessage } from "./utils/errorMessages.js";
import type { UserJson , UserHistory } from './types/userTypes.js'
import {v4 as uuidv4} from 'uuid';

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
	index!: number;

	@Column()
	id!: string;

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
	login!: string;

	@Column()
	@Length(1, 50)
	nickName!: string;

	@Column()
	password: string;

	@Column()
	@IsEmail(undefined, {message: getIsInvalidMessage('Email')})
	email!: string;

	@Column({type: 'boolean', default: false})
	twoFaAuth!: boolean;

	@Column({ nullable: true })
	twoFaSecret?: string;

	@Column({ nullable: true })
	provider?: string;

	@Column({ nullable: true })
	favLang?: string;

	@Column({type: 'boolean', default: false})
	isOnline!: boolean;

	@Column({ type: 'simple-array', nullable: true })
	friends?: string[];

	@Column({ type: 'simple-array', nullable: true })
	blocklist?: string[];

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
			provider: this.provider,
			favLang: this.favLang,
			isOnline: this.isOnline,
		};
	}

	//bcrypt here?
	async comparePassword(password: string): Promise<boolean> {
		return this.password.localeCompare(password) == 0;
	}

	constructor(obj?: UserJson)
	{
		super();
		this.id = uuidv4();
		this.login = obj?.login ?? '';
		this.nickName = obj?.nickName ?? '';
		this.password = obj?.password ?? '';
		this.email = obj?.email ?? '';
		this.twoFaAuth = obj?.twoFaAuth ?? false;
		this.provider = obj?.provider ?? '';
		this.isOnline = obj?.isOnline ?? false;
		this.friends = obj?.friends ?? [];
		this.blocklist = obj?.blocklist ?? [];
	}

	@OneToMany(() => History, (history: History) => history.user, { cascade: true })
    history?: History[];

	@OneToMany(() => ChatMessage, (chatMessage: ChatMessage) => chatMessage.user, { cascade: true })
    chatMessages?: ChatMessage[];
};

@Entity()
export class History extends BaseEntity { //extends : mot-cle d'héritage - History hérite de BaseEntity

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
    win?: string;

    @Column()
    finalLength?: number;

	@Column()
    finalBallSpeed?: number;

    @Column()
    gameTime?: number;

    @ManyToOne(() => User, (user: User) => user.history)
    user!: User;

    constructor(user?: User, data?: UserHistory) {
        super();
        if (user) {
            this.user = user;
        }
        if (data) {
            this.type = data.type;
            this.date = data.date;
            this.opponent = data.opponent;
            this.score = data.score;
            this.win = data.win;
            this.finalLength = data.finalLength;
            this.finalBallSpeed = data.finalBallSpeed;
            this.gameTime = data.gameTime;
        }
    }
}

@Entity()
export class ChatMessage extends BaseEntity {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column({ length: 500 })
	@IsNotEmpty()
	content!: string;

	@Column()
	timestamp!: Date;

	@Column()
	room!: string;

	@Column({ default: 'text' })
	type!: string; // 'text', 'image', 'system', etc.

	@ManyToOne(() => User, (user: User) => user.chatMessages)
	user!: User;

	constructor(user?: User, content?: string, room?: string, type: string = 'text') {
		super();
		if (user && content && room) {
			this.user = user;
			this.content = content;
			this.room = room;
			this.type = type;
			this.timestamp = new Date();
		}
	}
}
