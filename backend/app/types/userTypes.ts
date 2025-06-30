
export interface IUserReply {
	200: { success: boolean };
	302: { success: boolean, url: string };
	500: { success: boolean, error: string };
}

export type UserJson = {
	firstName: string,
	lastName: string,
	nickName: string,
	password: string,
	email: string,
};
