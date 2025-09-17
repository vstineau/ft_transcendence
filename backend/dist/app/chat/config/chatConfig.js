export const CHAT_CONFIG = {
    MAX_RECENT_MESSAGES: 50,
    MAX_ROOM_MESSAGES: 100,
    MESSAGE_CLEANUP_DAYS: 30,
    CLEANUP_INTERVAL: 24 * 60 * 60 * 1000,
    LOADING_MESSAGE: 'Chargement des messages...',
    ROOMS: {
        GLOBAL: 'global',
        PONG: 'pong',
        SNAKE: 'snake'
    }
};
export const CHAT_EVENTS = {
    INIT_USER: 'initUser',
    SEND_MESSAGE: 'sendMessage',
    JOIN_PRIVATE_ROOM: 'joinPrivateRoom',
    GET_MESSAGE_HISTORY: 'getMessageHistory',
    GAME_INVITATION: 'gameInvitation',
    GAME_INVITATION_RESPONSE: 'gameInvitationResponse',
    STATUS_CHANGE: 'statusChange',
    JOIN_PUBLIC_ROOM: 'joinPublicRoom',
    ADD_FRIEND: 'addFriend',
    DELETE_FRIEND: 'deleteFriend',
    BLOCK_USER: 'blockUser',
    UNBLOCK_USER: 'unblockUser',
    DELETE_MESSAGE: 'deleteMessage',
    USER_CONNECTED: 'userConnected',
    USER_JOINED: 'userJoined',
    USER_LEFT: 'userLeft',
    ONLINE_USERS_UPDATED: 'onlineUsersUpdated',
    NEW_MESSAGE: 'newMessage',
    ROOM_JOINED: 'roomJoined',
    PRIVATE_ROOM_CREATED: 'privateRoomCreated',
    MESSAGE_HISTORY: 'messageHistory',
    LOADING_MESSAGES: 'loadingMessages',
    GAME_INVITATION_RECEIVED: 'gameInvitationReceived',
    GAME_INVITATION_ANSWER: 'gameInvitationAnswer',
    USER_STATUS_CHANGED: 'userStatusChanged',
    FRIEND_ADDED: 'friendAdded',
    FRIEND_ERROR: 'friendError',
    FRIEND_LIST_UPDATED: 'friendListUpdated',
    USER_DEBLOCKED: 'userDeblocked',
    USER_BLOCKED: 'userBlocked',
    AUTH_ERROR: 'authError',
    ERROR: 'error'
};
//# sourceMappingURL=chatConfig.js.map