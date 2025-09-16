import { escapeHtml } from '../utils';

export function ButtonGameInvite(avatar: string, invitationId: string, message: any, time: string, actions: string): string {
    return /* HTML */ `
    <div class="flex items-start gap-2.5" data-invite-row="${invitationId}">
                        <div class="shrink-0" data-user-id="${message.userId}">${avatar}</div>
                        <div class="flex flex-col gap-1">
                            <div class="flex flex-col w-full max-w-[280px] leading-1.5 p-3 border-gray-200 bg-gray-100 rounded-e-xl rounded-es-xl">
                                <div class="flex items-center justify-between space-x-2 mb-1">
                                    <span class="text-sm font-semibold text-gray-900">${escapeHtml(message.username)}</span>
                                    <span class="text-xs font-normal text-gray-500">${time}</span>
                                </div>
                                <div class="text-sm font-normal text-gray-900">
                                    🎮 Invitation à jouer à Pong
                                </div>
                                <div class="text-[11px] text-gray-600">Etes-tu partant pour un pong de légende ?</div>
                                ${actions}
                            </div>
                        </div>
                    </div>
                `;
}

