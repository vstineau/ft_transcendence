//import { User } from '../models.js'

export interface IUserReply {
	200: { success: boolean };
	302: { success: boolean, url: string };
	500: { success: boolean, error: string };
}

export type UserJson = {
	id: number,
	login: string,
	nickName: string,
	password: string,
	email: string,
};

export interface ILoginReply {
	token?: string;
	success: boolean;
	error?: string ;
	user?: Partial<UserJson>;
};
