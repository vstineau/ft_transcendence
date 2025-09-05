export const CHAT_CONFIG = {
  MAX_RECENT_MESSAGES: 50,
  MAX_ROOM_MESSAGES: 100,
  MESSAGE_CLEANUP_DAYS: 30,
  CLEANUP_INTERVAL: 24 * 60 * 60 * 1000, // 24 heures
  LOADING_MESSAGE: 'Chargement des messages...',
  ROOMS: {
    GLOBAL: 'global',
    PONG: 'pong',
    SNAKE: 'snake'
  }
} as const;

export const CHAT_EVENTS = {
  // Client -> Server
  INIT_USER: 'initUser',
  SEND_MESSAGE: 'sendMessage',
  JOIN_PRIVATE_ROOM: 'joinPrivateRoom',
  GET_MESSAGE_HISTORY: 'getMessageHistory',
  GAME_INVITATION: 'gameInvitation',
  GAME_INVITATION_RESPONSE: 'gameInvitationResponse',
  STATUS_CHANGE: 'statusChange',
  JOIN_PUBLIC_ROOM: 'joinPublicRoom',
  
  // Server -> Client
  USER_CONNECTED: 'userConnected',
  USER_JOINED: 'userJoined',
  USER_LEFT: 'userLeft',
  ONLINE_USERS_UPDATED: 'onlineUsersUpdated',
  NEW_MESSAGE: 'newMessage',
  ROOM_JOINED: 'roomJoined',
  MESSAGE_HISTORY: 'messageHistory',
  LOADING_MESSAGES: 'loadingMessages',
  GAME_INVITATION_RECEIVED: 'gameInvitationReceived',
  GAME_INVITATION_ANSWER: 'gameInvitationAnswer',
  USER_STATUS_CHANGED: 'userStatusChanged',
  AUTH_ERROR: 'authError',
  ERROR: 'error'
} as const;
