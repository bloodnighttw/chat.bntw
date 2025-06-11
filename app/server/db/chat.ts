import { serial } from "drizzle-orm/mysql-core";
import { integer, pgTable, uuid } from "drizzle-orm/pg-core";

export const chatRoom = pgTable("chat", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),  
  uuid: uuid("uuid").defaultRandom().unique(),
});

export type ChatRoom = typeof chatRoom.$inferSelect;