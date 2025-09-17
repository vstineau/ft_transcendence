import client from 'prom-client';
export default async function monitoringRoutes(app) {
    client.collectDefaultMetrics({
        prefix: 'ft_',
    });
    app.get('/health', async () => ({
        status: 'ok',
        uptime: process.uptime(),
    }));
    app.get('/metrics', async (_request, reply) => {
        reply.header('Content-Type', client.register.contentType);
        return client.register.metrics();
    });
}
//# sourceMappingURL=monitoring.route.js.map