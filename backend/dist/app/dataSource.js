import { DataSource } from "typeorm";
import { User, History, ChatMessage } from "./models.js";
export const SqliteDataSource = new DataSource({
    type: "sqlite",
    database: "./db/transcendence.db",
    entities: [User, History, ChatMessage],
    migrations: ["/app/dist/app/migrations/*.js"],
    synchronize: false,
});
//# sourceMappingURL=dataSource.js.map