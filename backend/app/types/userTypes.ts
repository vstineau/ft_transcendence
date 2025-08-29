
export interface IUserReply {
	200: { success: boolean, user?: UserJson, qrCode?: string, twoFaAuth?: boolean, tmpToken?: string };
	302: { success: boolean, message?: string ,user?: UserJson };
	401: { success: boolean, error: string };
	400: { success: boolean, error: string };
	500: { success: boolean, error: string };
}

export type JwtPayload = {
	id: string,
	login: string,
	password: string,
	iat: string,
	exp: string,
};

export type UserJson = {
	id?: string,
	login?: string,
	nickName?: string,
	password?: string,
	newPassword?: string,
	email?: string,
	avatar?: string,
	noAvatar?: boolean;
	ext?: string;
	twoFaAuth?: boolean;
	twoFaSecret?: string;
	twoFaCode?: string;
	provider?: string;
	stats?: UserStats;
};

export type UserHistory = {
	type?: string,
	date?: string,
	opponent?: string,
	score?: string,
	finalLength?: number,
	win?: string,
};

export type UserStats = {
	gameNb?: number,
	lose?: number,
	win?: number,
	winrate?: number,
	actualWinStreak?: number,
	maxWinStreak?: number,
};

export const defaultAvatars: Array<string> = [
	'/app/app/avatar/dog-meme.gif',
	'/app/app/avatar/singe_rio_de_janeiro.jpg',
	'/app/app/avatar/samy.jpg'
];

export const mimeTypes: { [key: string]: string } = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.png': 'image/png',
};

