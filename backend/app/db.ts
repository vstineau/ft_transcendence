import { FastifyInstance, FastifyPluginOptions} from 'fastify';
import fp from 'fastify-plugin'
import sqlite3 from 'sqlite3'

async function dbConnector(fastify: FastifyInstance, _option: FastifyPluginOptions){
	var db = new sqlite3.Database("./db/transcendence.db", sqlite3.OPEN_READWRITE, (err) => {
		if (err) return console.log(err);
	});
	
	db.serialize(function() {
		db.run("CREATE TABLE IF NOT EXISTS transcendence ( \
			id INTEGER PRIMARY KEY, \
			title TEXT NOT NULL, \
			completed INTEGER \ )");
	});

	console.log("database created")
	const sqlite = {db};
	sqlite.db = db;

	fastify.decorate('sqlite', sqlite);
}
export default fp(dbConnector);
