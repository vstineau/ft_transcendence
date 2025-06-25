
import { DataSource } from "typeorm"
import { User } from "./models.js"

//generer la migrations
//npx typeorm migration:generate -d migration -n CreateUserTable

//appliquer la migration
//npx typeorm migration:run

export const SqliteDataSource = new DataSource({
    type: "sqlite",
    database: "./db/transcendence.db",
	entities: [ User],
	migrations: ["./migration/**/*.ts"],
	synchronize: true, //a passer a false une fois en prod pour utiliser les migrations
})

SqliteDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!")
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err)
    })
