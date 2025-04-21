const fastify = require('fastify')({
  logger: true
})

fastify.register(require('./first_route'))

// Declare a route
fastify.get('/', async (request, reply) => {
  return { hola:'mundo' }
})

/**
 * Run the server!
 */
const start = async () => {
  try {
    await fastify.listen({ port: 3000 })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()
