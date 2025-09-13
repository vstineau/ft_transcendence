
export interface IUserReply {
	200: { success: boolean, user?: UserJson, qrCode?: string, twoFaAuth?: boolean, tmpToken?: string, favLang?: string, error?: string; };
	302: { success: boolean, message?: string ,user?: UserJson };
	401: { success: boolean, error: string };
	400: { success: boolean, error: string };
	500: { success: boolean, error: string };
}

export type JwtPayload = {
	id: string,
	login: string,
	password: string,
	favLang: string,
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
	favLang?: string;
	isOnline?: boolean;
	friends?: string[];
	blocklist?: string[];
	stats?: UserStats;
};

export type UserHistory = {
	type?: string,
	date?: string,
	opponent?: string,
	score?: string,
	finalLength?: number,
	finalBallSpeed?: number;
	win?: string,
	gameTime?: number;
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
	'/app/app/avatar/samy.jpg',
	'/app/app/avatar/uillysamy.png',
	'/app/app/avatar/vieux.png',
	'/app/app/avatar/pikapika.png',
	'/app/app/avatar/uilly93.png',
];

export const mimeTypes: { [key: string]: string } = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

