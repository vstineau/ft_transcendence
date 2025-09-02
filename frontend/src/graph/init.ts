
declare var Chart: any;

export function initSnakeStats(){
    setTimeout(() => {
        const scoreCtx = (document.getElementById('scoreDistributionChart')as HTMLCanvasElement)?.getContext('2d');
        if(scoreCtx) {
            new Chart(scoreCtx, {
                type: 'bar',
                data: {
                    labels:['0-10', '11-20', '21-30', '31-40', '41-50', '51+'],
                    datasets: [{
                        label: 'Number of games',
                        data: [8, 12, 15, 10, 5, 2],
                        backgroundColor: ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true, ticks: { stepSize: 2 } } }
                }
            });
        }

        const timeCtx = (document.getElementById('survivalTimeChart')as HTMLCanvasElement)?.getContext('2d');
        if(timeCtx){
            new Chart(timeCtx, {
                type: 'doughnut',
                data: {
                    labels: ['0-30s', '31-60s', '61-90s', '90s+'],
                    datasets: [{
                        data: [30, 35, 25, 10],
                        backgroundColor: ['#06B6D4', '#10B981', '#F59E0B', '#EF4444'],
                        borderWidth: 2,
                        borderColor: '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } },
                    cutout: '60%'
                }
            });
        }
    }, 100);
}