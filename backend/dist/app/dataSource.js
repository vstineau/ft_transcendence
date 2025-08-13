import { DataSource } from "typeorm";
import { User, History } from "./models.js";
export const SqliteDataSource = new DataSource({
    type: "sqlite",
    database: "./db/transcendence.db",
    entities: [User, History],
    migrations: ["./migration/**/*.ts"],
    synchronize: true,
});
//# sourceMappingURL=dataSource.js.map