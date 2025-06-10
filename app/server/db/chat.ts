import { pgTable, uuid } from "drizzle-orm/pg-core";

export const chatRoom = pgTable("chat", {
  id: uuid("id").defaultRandom().primaryKey(),
});

export type ChatRoom = typeof chatRoom.$inferSelect;