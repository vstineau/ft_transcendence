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
import { IsEmail, Length, Matches, validateOrReject } from 'class-validator';
import { getIsInvalidMessage } from "./utils/errorMessages.js";
let User = User_1 = class User extends BaseEntity {
    async validateInsert() {
        await validateOrReject(this);
    }
    async validateUpdate() {
        await validateOrReject(this, { skipMissingProperties: true });
    }
    id;
    avatar;
    login;
    nickName;
    password;
    email;
    static async createUser(data) {
        return new User_1(data);
    }
    async getInfos() {
        return {
            id: this.id,
            login: this.login,
            nickName: this.nickName,
            password: this.password,
            email: this.email,
        };
    }
    async comparePassword(password) {
        return this.password.localeCompare(password) == 0;
    }
    constructor(obj) {
        super();
        this.login = obj?.login ?? '';
        this.nickName = obj?.nickName ?? '';
        this.password = obj?.password ?? '';
        this.email = obj?.email ?? '';
    }
    history;
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
    Matches(/^[A-Za-z]+$/, { message: getIsInvalidMessage("firstname", "please only use alpabetic characters") }),
    __metadata("design:type", String)
], User.prototype, "login", void 0);
__decorate([
    Column(),
    Length(1, 50),
    __metadata("design:type", String)
], User.prototype, "nickName", void 0);
__decorate([
    Column(),
    Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, { message: getIsInvalidMessage("password", "please use  password with at least 8 characters, one uppercase, one lowercase, one number and one special character") }),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    Column(),
    IsEmail(undefined, { message: getIsInvalidMessage('Email') }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    OneToMany(() => History, (history) => history.user, { cascade: true }),
    __metadata("design:type", Array)
], User.prototype, "history", void 0);
User = User_1 = __decorate([
    Entity(),
    Unique(['email']),
    Unique(['login']),
    __metadata("design:paramtypes", [Object])
], User);
export { User };
;
let History = class History {
    gamecount;
    type;
    date;
    opponent;
    score;
    win;
    user;
    constructor(user, data) {
        if (data) {
            this.date = data.date;
            this.opponent = data.opponent;
            this.score = data.score;
            this.win = data.win;
        }
        this.user = user;
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
    __metadata("design:type", Boolean)
], History.prototype, "win", void 0);
__decorate([
    ManyToOne(() => User, (user) => user.history),
    __metadata("design:type", User)
], History.prototype, "user", void 0);
History = __decorate([
    Entity(),
    __metadata("design:paramtypes", [User, Object])
], History);
export { History };
;
//# sourceMappingURL=models.js.map