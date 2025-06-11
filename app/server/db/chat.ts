import { integer, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { user } from "./better-auth";

export const chatRoom = pgTable("chat", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),  
  uuid: uuid("uuid").defaultRandom().unique(),
});

export type ChatRoom = typeof chatRoom.$inferSelect;

// many to many relation from chat to user
export const chatRoomUser = pgTable("chat_room_user", {
  chatUUID: uuid("chat_uuid")
    .notNull()
    .references(() => chatRoom.uuid, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  // user level in chat room
  level: integer("level").notNull().default(0), // 0: user, 1: admin, 2: owner
});