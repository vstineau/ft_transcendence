
import Fastify from 'fastify'
import cors from '@fastify/cors'


const fastify = Fastify({
	logger: true,
	trustProxy: true,
});

await fastify.register(cors, {
  origin: 'http://backend:3000',
});

////fastify.use("/static", fastify.static(path.resolve(__dirname, './', 'static')))
//
//fastify.get('/*', async (_request, res) => {
//	const bufferIndexHtml = fastify.readFileSync('index.html')
//	return res.type('text/html').send(bufferIndexHtml)
//})
//
fastify.get('/test', async (_request, _reply) => {
	return {message: "frontend ????\n"}; 
})

fastify.listen({port: 5000, host: '0.0.0.0'}, (err, address) => {
	if (err) {
		console.error(err)
		process.exit(1)
	}
	console.log(`Frontend listening at ${address}`)
})

//fetch('http://backend:3000/')
//  .then(response => response.text())
//  .then(data => {
//    console.log('backend :', data);
//  })
//  .catch(err => {
//    console.error('Erreur lors de la requête vers le backend :', err);
//  });
//
