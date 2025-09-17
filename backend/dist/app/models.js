var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var User_1;
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, Unique, BeforeInsert, BeforeUpdate, ManyToOne, OneToMany } from "typeorm";
import { IsEmail, Length, validateOrReject, IsNotEmpty } from 'class-validator';
import { getIsInvalidMessage } from "./utils/errorMessages.js";
import { v4 as uuidv4 } from 'uuid';
let User = User_1 = class User extends BaseEntity {
    async validateInsert() {
        await validateOrReject(this);
    }
    async validateUpdate() {
        await validateOrReject(this, { skipMissingProperties: true });
    }
    index;
    id;
    avatar;
    login;
    nickName;
    password;
    email;
    twoFaAuth;
    twoFaSecret;
    provider;
    favLang;
    isOnline;
    friends;
    blocklist;
    static async createUser(data) {
        return new User_1(data);
    }
    async getInfos() {
        let twoFaSecret;
        this.twoFaSecret ? twoFaSecret = this.twoFaSecret : twoFaSecret = '';
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
    async comparePassword(password) {
        return this.password.localeCompare(password) == 0;
    }
    constructor(obj) {
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
    history;
    chatMessages;
};
__decorate([
    BeforeInsert(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], User.prototype, "validateInsert", null);
__decorate([
    BeforeUpdate(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], User.prototype, "validateUpdate", null);
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], User.prototype, "index", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    Column({
        transformer: {
            to: (value) => Buffer.from(value),
            from: (value) => value.toString()
        }
    }),
    __metadata("design:type", String)
], User.prototype, "avatar", void 0);
__decorate([
    Column(),
    Length(1, 50),
    __metadata("design:type", String)
], User.prototype, "login", void 0);
__decorate([
    Column(),
    Length(1, 50),
    __metadata("design:type", String)
], User.prototype, "nickName", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    Column(),
    IsEmail(undefined, { message: getIsInvalidMessage('Email') }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    Column({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "twoFaAuth", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "twoFaSecret", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "provider", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "favLang", void 0);
__decorate([
    Column({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "isOnline", void 0);
__decorate([
    Column({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], User.prototype, "friends", void 0);
__decorate([
    Column({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], User.prototype, "blocklist", void 0);
__decorate([
    OneToMany(() => History, (history) => history.user, { cascade: true }),
    __metadata("design:type", Array)
], User.prototype, "history", void 0);
__decorate([
    OneToMany(() => ChatMessage, (chatMessage) => chatMessage.user, { cascade: true }),
    __metadata("design:type", Array)
], User.prototype, "chatMessages", void 0);
User = User_1 = __decorate([
    Entity(),
    Unique(['email']),
    Unique(['login']),
    __metadata("design:paramtypes", [Object])
], User);
export { User };
;
let History = class History extends BaseEntity {
    gamecount;
    type;
    date;
    opponent;
    score;
    win;
    finalLength;
    finalBallSpeed;
    gameTime;
    user;
    constructor(user, data) {
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
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], History.prototype, "gamecount", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], History.prototype, "type", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], History.prototype, "date", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], History.prototype, "opponent", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], History.prototype, "score", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], History.prototype, "win", void 0);
__decorate([
    Column(),
    __metadata("design:type", Number)
], History.prototype, "finalLength", void 0);
__decorate([
    Column(),
    __metadata("design:type", Number)
], History.prototype, "finalBallSpeed", void 0);
__decorate([
    Column(),
    __metadata("design:type", Number)
], History.prototype, "gameTime", void 0);
__decorate([
    ManyToOne(() => User, (user) => user.history),
    __metadata("design:type", User)
], History.prototype, "user", void 0);
History = __decorate([
    Entity(),
    __metadata("design:paramtypes", [User, Object])
], History);
export { History };
let ChatMessage = class ChatMessage extends BaseEntity {
    id;
    content;
    timestamp;
    room;
    type;
    user;
    constructor(user, content, room, type = 'text') {
        super();
        if (user && content && room) {
            this.user = user;
            this.content = content;
            this.room = room;
            this.type = type;
            this.timestamp = new Date();
        }
    }
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], ChatMessage.prototype, "id", void 0);
__decorate([
    Column({ length: 500 }),
    IsNotEmpty(),
    __metadata("design:type", String)
], ChatMessage.prototype, "content", void 0);
__decorate([
    Column(),
    __metadata("design:type", Date)
], ChatMessage.prototype, "timestamp", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], ChatMessage.prototype, "room", void 0);
__decorate([
    Column({ default: 'text' }),
    __metadata("design:type", String)
], ChatMessage.prototype, "type", void 0);
__decorate([
    ManyToOne(() => User, (user) => user.chatMessages),
    __metadata("design:type", User)
], ChatMessage.prototype, "user", void 0);
ChatMessage = __decorate([
    Entity(),
    __metadata("design:paramtypes", [User, String, String, String])
], ChatMessage);
export { ChatMessage };
//# sourceMappingURL=models.js.map