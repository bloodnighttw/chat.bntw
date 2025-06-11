import { integer, pgTable, primaryKey, text, uuid } from "drizzle-orm/pg-core";
import { user } from "../better-auth";
import { relations } from "drizzle-orm";
import { messages } from "./message";

export const chatRoom = pgTable("chat", {
  uuid: uuid("uuid").defaultRandom().notNull().primaryKey(),
});

export type ChatRoom = typeof chatRoom.$inferSelect;

// many to many relation from chat to user
export const chatToUser = pgTable("chat_to_user", {
  chatUUID: uuid("chat_uuid")
    .notNull()
    .references(() => chatRoom.uuid, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  // user level in chat room
  level: integer("level").notNull().default(0), // 0: user, 1: admin, 2: owner
}, (t) => [
  primaryKey({ columns: [t.userId, t.chatUUID] })
]);

export const chatToUserRelations = relations(chatToUser, ({ one }) => ({
  chat: one(chatRoom, {
    fields: [chatToUser.chatUUID],
    references: [chatRoom.uuid],
  }),
  user: one(user, {
    fields: [chatToUser.userId],
    references: [user.id],
  }),
}))

export const chatToMessageRelations = relations(chatRoom, ({ many }) => ({
      messages: many(messages),
}));