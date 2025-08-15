import { FastifyInstance } from 'fastify';
import client from 'prom-client';

export default async function monitoringRoutes(app: FastifyInstance) {

  // Enregistre les métriques par défaut (CPU, mémoire, GC, etc.)
  client.collectDefaultMetrics({
    prefix: 'ft_', // préfixe optionnel pour mieux distinguer tes métriques
  });

  // Healthcheck simple
  app.get('/health', async () => ({
    status: 'ok',
    uptime: process.uptime(),
  }));

  // Route /metrics pour Prometheus
  app.get('/metrics', async (_request, reply) => {
    reply.header('Content-Type', client.register.contentType);
    return client.register.metrics();
  });
}
