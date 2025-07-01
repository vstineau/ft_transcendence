
export interface IUserReply {
	200: { success: boolean };
	302: { success: boolean, url: string };
	500: { success: boolean, error: string };
}

export type UserJson = {
	login: string,
	nickName: string,
	password: string,
	email: string,
};
