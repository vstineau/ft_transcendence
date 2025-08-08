//import { User } from '../models.js'

export interface IUserReply {
	200: { success: boolean, user?: UserJson };
	401: { success: boolean, error: string };
	400: { success: boolean, error: string };
	500: { success: boolean, error: string };
}

export type JwtPayload = {
	login: string,
	password: string,
	iat: string,
	exp: string,
};

export type UserJson = {
	id: number,
	login: string,
	nickName: string,
	password?: string,
	newPassword?: string,
	email: string,
	avatar?: string,
	noAvatar?: boolean;
	ext?: string;
	twoFaAuth: boolean;
};

export type UserHistory = {
	date: string,
	opponent: string,
	score: string,
	win: boolean,
};

export const defaultAvatars: Array<string> = [
	'/app/app/avatar/dog-meme.gif',
	'/app/app/avatar/singe_rio_de_janeiro.jpg'
];

export const mimeTypes: { [key: string]: string } = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.png': 'image/png',
};

