import { fetchSnakeHistory } from '../graph/init';


export async function analyzeGameTimes(): Promise<{labels: string[], data: number[]}> {
    try {
        const games = await fetchSnakeHistory();

        if (games.length === 0) {
            return {
                labels: ['0-30s', '31-60s', '61-90s', '90s+'],
                data: [0, 0, 0, 0]
            };
        }

        // Catégoriser les temps de jeu
        const timeCategories = {
            '0-30s': 0,
            '31-60s': 0,
            '61-90s': 0,
            '90s+': 0
        };

        games.forEach(game => {
            if (game.gameTime) {
                const seconds = Math.floor(game.gameTime / 1000);

                if (seconds <= 30) {
                    timeCategories['0-30s']++;
                } else if (seconds <= 60) {
                    timeCategories['31-60s']++;
                } else if (seconds <= 90) {
                    timeCategories['61-90s']++;
                } else {
                    timeCategories['90s+']++;
                }
            }
        });

        return {
            labels: Object.keys(timeCategories),
            data: Object.values(timeCategories)
        };

    } catch (error) {
        console.error('Error analyzing game times:', error);
        return {
            labels: ['0-30s', '31-60s', '61-90s', '90s+'],
            data: [0, 0, 0, 0]
        };
    }
}

export async function analyzeLengthDistribution(): Promise<{labels: string[], data: number[]}> {
    try {
        const games = await fetchSnakeHistory();

        if (games.length === 0) {
            return {
                labels: ['0-10', '11-20', '21-30', '31-40'],
                data: [0, 0, 0, 0]
            };
        }

        const lengthCategories = {
            '0-10': 0,
            '11-20': 0,
            '21-30': 0,
            '31-40': 0
        };

        games.forEach(game => {
            if (game.finalLength) {
                const length = game.finalLength;

                if (length <= 10) {
                    lengthCategories['0-10']++;
                } else if (length <= 20) {
                    lengthCategories['11-20']++;
                } else if (length <= 30) {
                    lengthCategories['21-30']++;
                } else {
                    lengthCategories['31-40']++;
                }
            }
        });

        return {
            labels: Object.keys(lengthCategories),
            data: Object.values(lengthCategories)
        };

    } catch (error) {
        console.error('Error analyzing length distribution:', error);
        return {
            labels: ['0-10', '11-20', '21-30', '31-40'],
            data: [0, 0, 0, 0]
        };
    }
}

