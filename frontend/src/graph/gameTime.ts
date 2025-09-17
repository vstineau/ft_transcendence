import { fetchSnakeHistoryOther, fetchSnakeHistory } from '../graph/init';
import { fetchPongHistory, fetchPongHistoryOther } from '../graph/initPong';


export async function analyzeGameTimes(targetUserId?: string): Promise<{labels: string[], data: number[]}> {
    try {
        let games;
        if (targetUserId) {
            games = await fetchSnakeHistoryOther(targetUserId);
        } else {
            games = await fetchSnakeHistory();
        }
          
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

        games.forEach((game: any) => {
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
        console.log('Error analyzing game times:', error);
        return {
            labels: ['0-30s', '31-60s', '61-90s', '90s+'],
            data: [0, 0, 0, 0]
        };
    }
}

export async function analyzeLengthDistribution(targetUserId?: string): Promise<{labels: string[], data: number[]}> {
    try {
        let games;
        if (targetUserId) {
            games = await fetchSnakeHistoryOther(targetUserId);
        } else {
            games = await fetchSnakeHistory();
        }

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

        games.forEach((game: any) => {
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
        console.log('Error analyzing length distribution:', error);
        return {
            labels: ['0-10', '11-20', '21-30', '31-40'],
            data: [0, 0, 0, 0]
        };
    }
}

// Pour analyser les vitesses de balle (équivalent des tailles de serpent)
export async function analyzeBallSpeedDistribution(targetUserId?: string): Promise<{labels: string[], data: number[]}> {
    try {
        let games;
        if (targetUserId) {
            games = await fetchPongHistoryOther(targetUserId);
        } else {
            games = await fetchPongHistory();
        }
        
        if (games.length === 0) {
            return {
                labels: ['0-5', '6-10', '11-15', '16+'],
                data: [0, 0, 0, 0]
            };
        }

        const speedCategories = {
            '0-5': 0,
            '6-10': 0,
            '11-15': 0,
            '16+': 0
        };

        games.forEach(game => {
            if (game.finalBallSpeed) {
                const speed = game.finalBallSpeed;
                if (speed <= 5) {
                    speedCategories['0-5']++;
                } else if (speed <= 10) {
                    speedCategories['6-10']++;
                } else if (speed <= 15) {
                    speedCategories['11-15']++;
                } else {
                    speedCategories['16+']++;
                }
            }
        });

        return {
            labels: Object.keys(speedCategories),
            data: Object.values(speedCategories)
        };
    } catch (error) {
        console.log('Error analyzing ball speeds:', error);
        return {
            labels: ['0-5', '6-10', '11-15', '16+'],
            data: [0, 0, 0, 0]
        };
    }
}

// Pour analyser les temps de jeu Pong
export async function analyzePongGameTimes(targetUserId?: string): Promise<{labels: string[], data: number[]}> {
    try {
        let games;
        if (targetUserId) {
            games = await fetchPongHistoryOther(targetUserId);
        } else {
            games = await fetchPongHistory();
        }

        if (games.length === 0) {
            return {
                labels: ['0-1min', '1-3min', '3-5min', '5min+'],
                data: [0, 0, 0, 0]
            };
        }

        const timeCategories = {
            '0-1min': 0,
            '1-3min': 0,
            '3-5min': 0,
            '5min+': 0
        };

        games.forEach(game => {
            if (game.gameTime) {
                const minutes = Math.floor(game.gameTime / 60000); // Convertir en minutes
                if (minutes <= 1) {
                    timeCategories['0-1min']++;
                } else if (minutes <= 3) {
                    timeCategories['1-3min']++;
                } else if (minutes <= 5) {
                    timeCategories['3-5min']++;
                } else {
                    timeCategories['5min+']++;
                }
            }
        });

        return {
            labels: Object.keys(timeCategories),
            data: Object.values(timeCategories)
        };
    } catch (error) {
        console.log('Error analyzing pong game times:', error);
        return {
            labels: ['0-1min', '1-3min', '3-5min', '5min+'],
            data: [0, 0, 0, 0]
        };
    }
}

