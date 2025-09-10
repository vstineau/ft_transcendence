// @ts-ignore
import io, { Socket } from 'socket.io-client';
import { RoomsService } from './RoomsService';

/**
 * Service de gestion des connexions Socket.IO pour le chat
 */
export class SocketService extends RoomsService {
    protected socket: Socket | null = null;
    protected eventHandlers: { [event: string]: Function[] } = {};

    createConnection(): Socket {
        const host = window.location.hostname;
        const port = window.location.port;
        const protocol = window.location.protocol;

        this.socket = io(`${protocol}//${host}:${port}/chat`);
        return this.socket;
    }

    constructor() {
        super();
        this.createConnection();
    }

    getSocket(): Socket | null {
        return this.socket;
    }

    isConnected(): boolean {
        return this.socket?.connected || false;
    }

    // Wrapper pour émettre des événements
    emit(event: string, data: any): void {
        if (this.socket && this.socket.connected) {
            this.socket.emit(event, data);
        } else {
            console.error('❌ Socket not connected');
        }
    }

    // Wrapper pour écouter des événements
    on(event: string, handler: Function): void {
        if (this.socket) {
            this.socket.on(event, handler as any);

            // Sauvegarder les handlers pour un nettoyage éventuel
            if (!this.eventHandlers[event]) {
                this.eventHandlers[event] = [];
            }
            this.eventHandlers[event].push(handler);
        }
    }

    // Nettoyer les event listeners
    removeAllListeners(): void {
        if (this.socket) {
            Object.keys(this.eventHandlers).forEach(event => {
                this.socket!.removeAllListeners(event);
            });
            this.eventHandlers = {};
        }
    }

    // Fermer la connexion
    disconnect(): void {
        if (this.socket) {
            this.removeAllListeners();
            this.socket.disconnect();
            this.socket = null;
        }
    }
}
