export class TranscendenceSchema1757923284240 {
    name = 'TranscendenceSchema1757923284240';
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "user" ("index" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "id" varchar NOT NULL, "avatar" varchar NOT NULL, "login" varchar NOT NULL, "nickName" varchar NOT NULL, "password" varchar NOT NULL, "email" varchar NOT NULL, "twoFaAuth" boolean NOT NULL DEFAULT (0), "twoFaSecret" varchar, "provider" varchar, "favLang" varchar, "isOnline" boolean NOT NULL DEFAULT (0), "friends" text, "blocklist" text, CONSTRAINT "UQ_a62473490b3e4578fd683235c5e" UNIQUE ("login"), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"))`);
        await queryRunner.query(`CREATE TABLE "history" ("gamecount" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "type" varchar NOT NULL, "date" varchar NOT NULL, "opponent" varchar NOT NULL, "score" varchar NOT NULL, "win" varchar NOT NULL, "finalLength" integer NOT NULL, "finalBallSpeed" integer NOT NULL, "gameTime" integer NOT NULL, "userIndex" integer)`);
        await queryRunner.query(`CREATE TABLE "chat_message" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "content" varchar(500) NOT NULL, "timestamp" datetime NOT NULL, "room" varchar NOT NULL, "type" varchar NOT NULL DEFAULT ('text'), "userIndex" integer)`);
        await queryRunner.query(`CREATE TABLE "temporary_history" ("gamecount" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "type" varchar NOT NULL, "date" varchar NOT NULL, "opponent" varchar NOT NULL, "score" varchar NOT NULL, "win" varchar NOT NULL, "finalLength" integer NOT NULL, "finalBallSpeed" integer NOT NULL, "gameTime" integer NOT NULL, "userIndex" integer, CONSTRAINT "FK_a3ade23e0caa933034cf41d7a16" FOREIGN KEY ("userIndex") REFERENCES "user" ("index") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_history"("gamecount", "type", "date", "opponent", "score", "win", "finalLength", "finalBallSpeed", "gameTime", "userIndex") SELECT "gamecount", "type", "date", "opponent", "score", "win", "finalLength", "finalBallSpeed", "gameTime", "userIndex" FROM "history"`);
        await queryRunner.query(`DROP TABLE "history"`);
        await queryRunner.query(`ALTER TABLE "temporary_history" RENAME TO "history"`);
        await queryRunner.query(`CREATE TABLE "temporary_chat_message" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "content" varchar(500) NOT NULL, "timestamp" datetime NOT NULL, "room" varchar NOT NULL, "type" varchar NOT NULL DEFAULT ('text'), "userIndex" integer, CONSTRAINT "FK_9f93c8cda90b40ba5cd01e4d0c4" FOREIGN KEY ("userIndex") REFERENCES "user" ("index") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_chat_message"("id", "content", "timestamp", "room", "type", "userIndex") SELECT "id", "content", "timestamp", "room", "type", "userIndex" FROM "chat_message"`);
        await queryRunner.query(`DROP TABLE "chat_message"`);
        await queryRunner.query(`ALTER TABLE "temporary_chat_message" RENAME TO "chat_message"`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "chat_message" RENAME TO "temporary_chat_message"`);
        await queryRunner.query(`CREATE TABLE "chat_message" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "content" varchar(500) NOT NULL, "timestamp" datetime NOT NULL, "room" varchar NOT NULL, "type" varchar NOT NULL DEFAULT ('text'), "userIndex" integer)`);
        await queryRunner.query(`INSERT INTO "chat_message"("id", "content", "timestamp", "room", "type", "userIndex") SELECT "id", "content", "timestamp", "room", "type", "userIndex" FROM "temporary_chat_message"`);
        await queryRunner.query(`DROP TABLE "temporary_chat_message"`);
        await queryRunner.query(`ALTER TABLE "history" RENAME TO "temporary_history"`);
        await queryRunner.query(`CREATE TABLE "history" ("gamecount" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "type" varchar NOT NULL, "date" varchar NOT NULL, "opponent" varchar NOT NULL, "score" varchar NOT NULL, "win" varchar NOT NULL, "finalLength" integer NOT NULL, "finalBallSpeed" integer NOT NULL, "gameTime" integer NOT NULL, "userIndex" integer)`);
        await queryRunner.query(`INSERT INTO "history"("gamecount", "type", "date", "opponent", "score", "win", "finalLength", "finalBallSpeed", "gameTime", "userIndex") SELECT "gamecount", "type", "date", "opponent", "score", "win", "finalLength", "finalBallSpeed", "gameTime", "userIndex" FROM "temporary_history"`);
        await queryRunner.query(`DROP TABLE "temporary_history"`);
        await queryRunner.query(`DROP TABLE "chat_message"`);
        await queryRunner.query(`DROP TABLE "history"`);
        await queryRunner.query(`DROP TABLE "user"`);
    }
}
//# sourceMappingURL=1757923284240-transcendenceSchema.js.map