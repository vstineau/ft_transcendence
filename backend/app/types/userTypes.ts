//import { User } from '../models.js'

export interface IUserReply {
	200: { success: boolean };
	400: { success: boolean, error: string };
	500: { success: boolean, error: string };
}

export type UserJson = {
	id: number,
	login: string,
	nickName: string,
	password: string,
	email: string,
};

export type UserHistory = {
	date: string,
	opponent: string,
	score: string,
	win: boolean,
};

