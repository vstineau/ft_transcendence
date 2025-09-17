import client from 'prom-client';

// Important: utiliser le même register global de prom-client
export const register = client.register;

// Labels standards à réutiliser
const labelNames = ['service', 'route', 'status'];

// Utilisateurs/Session
export const usersOnlineGauge = new client.Gauge({
  name: 'ft_users_online',
  help: 'Nombre d\'utilisateurs connectés (estimé)',
  labelNames: ['service'],
});

export const usersRegisteredCounter = new client.Counter({
  name: 'ft_users_registered_total',
  help: 'Nombre total d\'utilisateurs enregistrés',
});

// Chat
export const chatMessagesTotal = new client.Counter({
  name: 'ft_chat_messages_total',
  help: 'Nombre total de messages chat',
  labelNames: ['room_type', 'room_id'],
});

export const chatActiveRoomsGauge = new client.Gauge({
  name: 'ft_chat_active_rooms',
  help: 'Nombre de salons chat actifs',
});

// Jeux
export const gamesStartedTotal = new client.Counter({
  name: 'ft_games_started_total',
  help: 'Nombre total de parties démarrées',
  labelNames: ['game'],
});

export const gamesFinishedTotal = new client.Counter({
  name: 'ft_games_finished_total',
  help: 'Nombre total de parties terminées',
  labelNames: ['game', 'result'],
});

// Jeux (détails Pong par joueurs)
export const pongGamesFinishedInfoTotal = new client.Counter({
  name: 'ft_pong_games_finished_info_total',
  help: 'Détails des parties Pong terminées (par joueurs)',
  labelNames: ['p1_nick', 'p2_nick', 'winner'],
});

export const gameDurationHistogram = new client.Histogram({
  name: 'ft_game_duration_seconds',
  help: 'Distribution des durées de parties',
  labelNames: ['game'],
  buckets: [15, 30, 60, 120, 180, 300, 600],
});

// HTTP
export const httpRequestsTotal = new client.Counter({
  name: 'ft_http_requests_total',
  help: 'Compteur de requêtes HTTP',
  labelNames,
});

export const httpRequestDuration = new client.Histogram({
  name: 'ft_http_request_duration_seconds',
  help: 'Durée des requêtes HTTP',
  labelNames,
  buckets: [0.01, 0.05, 0.1, 0.2, 0.5, 1, 2, 5],
});
