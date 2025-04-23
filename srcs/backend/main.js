const fastify = require('fastify')({
  logger: true
})

//fastify.register(require('./first_route'))

// Declare a route
fastify.get('/', async (request, reply) => {
  return { hello:'world' }
})

/**
 * Run the server!
 */
const start = async () => {
  try {
    await fastify.listen({ port: 8080 })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()
