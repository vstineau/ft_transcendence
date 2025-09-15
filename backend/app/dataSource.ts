
import { DataSource } from "typeorm"
import { User, History, ChatMessage } from "./models.js"


//https://typeorm.io/docs/advanced-topics/migrations/

export const SqliteDataSource = new DataSource({
    type: "sqlite",
    database: "./db/transcendence.db",
	entities: [ User, History, ChatMessage],
	migrations: [ "/app/dist/app/migrations/*.js"],
	synchronize: false, //a passer a false une fois en prod pour utiliser les migrations
})

