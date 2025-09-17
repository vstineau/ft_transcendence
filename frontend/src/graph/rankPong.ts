import { PongPlayerRanking } from '../types/pongTypes';
import { formatGameTime, formatDate } from '../graph/init';

async function fetchPongRanking(): Promise<PongPlayerRanking[]> {
	try {
		// console.log('=== FETCHING PONG RANKING ===');
		const host = window.location.hostname;
		const port = window.location.port;
		const protocol = window.location.protocol;

		const response = await fetch(`${protocol}//${host}:${port}/api/pong/ranking`);

		if (!response.ok) {
			throw new Error('Failed to fetch ranking');
		}

		const data = await response.json();
		// console.log('Ranking data received:', data);
		return data;
	} catch (error) {
		// console.log('Error fetching ranking', error);
		return [];
	}
}

function generateRankingHTMLPong(ranking: PongPlayerRanking[]): string {
	if (ranking.length === 0) {
		return `
			<tbody>
				<tr>
					<td colspan="5" class="py-8 text-center text-gray-500 text-sm">
						No rankings yet... Be the first to play! 🏆
					</td>
				</tr>
			</tbody>
		`;
	}

	return `
		<tbody>
			${ranking.map((player, index) => {
				const rank = index + 1;
				let rankDisplay;

				if (rank === 1) {
					rankDisplay = '🥇';
				} else if (rank === 2) {
					rankDisplay = '🥈';
				} else if (rank === 3) {
					rankDisplay = '🥉';
				} else {
					rankDisplay = `${rank}.`;
				}

				return `
					<tr class="border-b hover:bg-gray-50">
						<td class="py-2">${formatDate(player.lastGameDate)}</td>
						<td class="py-2 font-semibold">
							${rankDisplay} ${player.nickName}
						</td>
						<td class="py-2">${player.totalWins}</td>
						<td class="py-2">${player.maxSpeed}</td>
						<td class="py-2">${formatGameTime(player.bestTime)}</td>
					</tr>
				`;
			}).join('')}
		</tbody>
	`;
}

export async function updateRankingPong(): Promise<void> {
	try {
		const ranking = await fetchPongRanking();
		const rankingTableBody = document.querySelector('#ranking-table tbody');

		if (rankingTableBody) {
			rankingTableBody.outerHTML = generateRankingHTMLPong(ranking);
		}
	} catch (error) {
		console.log('Error updating ranking:', error);
	}
}
