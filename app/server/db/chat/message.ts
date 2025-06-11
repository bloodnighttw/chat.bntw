import type { CoreMessage } from "ai";
import { relations } from "drizzle-orm";

import {
  pgTable,
  text,
  timestamp,
  json,
  varchar,
  uuid,
  integer,
} from "drizzle-orm/pg-core";
import { chatRoom } from "~/server/db/chat";
import { db } from "..";

// Main messages table
export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  chatId: uuid("chat_id")
    .notNull()
    .references(() => chatRoom.uuid, { onDelete: "cascade" }),
  role: varchar("role", { length: 20 })
    .notNull()
    .$type<"system" | "user" | "assistant" | "data">(),
  // the raw text of the message
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  annotations: json("annotations").$type<Array<unknown>>(),
  // Store serialized attachments as JSON
  attachments: json("attachments").$type<
    Array<{
      name?: string;
      contentType?: string;
      url: string;
    }>
  >(),
});

// Relations for messages, which contains parts
// currently, we only use messages table

// Parts table - centralized ordering and message relationship
export const parts = pgTable("parts", {
  id: uuid("id").defaultRandom().primaryKey(),
  messageId: uuid("message_id")
    .notNull()
    .references(() => messages.id, { onDelete: "cascade" }),
  // This should be used to order parts within a message
  order: integer("order").notNull(),
  type: varchar("type", { length: 20 })
    .notNull()
    .$type<
      "text" | "reasoning" | "tool_invocation" | "source" | "step_start"
    >(),
});

// Text parts table
export const textParts = pgTable("text_parts", {
  partId: uuid("part_id")
    .notNull()
    .references(() => parts.id, { onDelete: "cascade" })
    .primaryKey(),
  text: text("text").notNull(),
});

// Reasoning parts table
export const reasoningParts = pgTable("reasoning_parts", {
  partId: uuid("part_id")
    .notNull()
    .references(() => parts.id, { onDelete: "cascade" })
    .primaryKey(),
  reasoning: text("reasoning").notNull(),
});

// Tool invocation parts table
export const toolInvocationParts = pgTable("tool_invocation_parts", {
  partId: uuid("part_id")
    .notNull()
    .references(() => parts.id, { onDelete: "cascade" })
    .primaryKey(),
  toolCallId: varchar("tool_call_id", { length: 255 }).notNull(),
  toolName: varchar("tool_name", { length: 255 }).notNull(),
  state: varchar("state", { length: 20 })
    .notNull()
    .$type<"partial-call" | "call" | "result">(),
  args: json("args").notNull(),
  result: json("result"), // Only present when state is 'result'
});

export const sourceParts = pgTable("source_parts", {
  partId: uuid("part_id")
    .notNull()
    .references(() => parts.id, { onDelete: "cascade" })
    .primaryKey(),
  sourceType: varchar("source_type", { length: 20 }).notNull().$type<"url">(),
  sourceId: varchar("source_id", { length: 255 }).notNull(),
  url: text("url").notNull(),
  title: text("title"),
});

// Step start parts table
export const stepStartParts = pgTable("step_start_parts", {
  partId: uuid("part_id")
    .notNull()
    .references(() => parts.id, { onDelete: "cascade" })
    .primaryKey(),
});

export const messagesRelations = relations(messages, ({ many }) => ({
  parts: many(parts),
}));

export const partsRelations = relations(parts, ({ one }) => ({
  message: one(messages, {
    fields: [parts.messageId],
    references: [messages.id],
  }),
  textPart: one(textParts, {
    fields: [parts.id],
    references: [textParts.partId],
  }),
  reasoningPart: one(reasoningParts, {
    fields: [parts.id],
    references: [reasoningParts.partId],
  }),
  toolInvocationPart: one(toolInvocationParts, {
    fields: [parts.id],
    references: [toolInvocationParts.partId],
  }),
  sourcePart: one(sourceParts, {
    fields: [parts.id],
    references: [sourceParts.partId],
  }),
  stepStartPart: one(stepStartParts, {
    fields: [parts.id],
    references: [stepStartParts.partId],
  }),
}));

export const textPartsRelations = relations(textParts, ({ one }) => ({
  part: one(parts, {
    fields: [textParts.partId],
    references: [parts.id],
  }),
}));

export const reasoningPartsRelations = relations(reasoningParts, ({ one }) => ({
  part: one(parts, {
    fields: [reasoningParts.partId],
    references: [parts.id],
  }),
}));

export const toolInvocationPartsRelations = relations(
  toolInvocationParts,
  ({ one }) => ({
    part: one(parts, {
      fields: [toolInvocationParts.partId],
      references: [parts.id],
    }),
  })
);

export const sourcePartsRelations = relations(sourceParts, ({ one }) => ({
  part: one(parts, {
    fields: [sourceParts.partId],
    references: [parts.id],
  }),
}));

export const stepStartPartsRelations = relations(stepStartParts, ({ one }) => ({
  part: one(parts, {
    fields: [stepStartParts.partId],
    references: [parts.id],
  }),
}));

function coreMessageToString(message: CoreMessage): string {
  if (typeof message.content === "string") {
    return message.content;
  }

  if (Array.isArray(message.content)) {
    return message.content
      .map((part) => {
        switch (part.type) {
          case "text":
            return part.text;
          case "image":
            return "[Image]";
          case "file":
            return `[File: ${part.data}]`;
          default:
            return "[Unknown content]";
        }
      })
      .join(" ");
  }

  return "";
}

export async function messageToDb({
  chatId,
  coreMessages,
}: {
  chatId: string;
  coreMessages: CoreMessage[];
}) {

    const messagesToInsert = coreMessages.map((message: CoreMessage) => ({
        chatId,
        role: message.role as "system" | "user" | "assistant" | "data",
        content: coreMessageToString(message),
        createdAt: new Date(),
        annotations: [],
        attachments: [],
    }));
    
    // Insert messages into the database
    const insertedMessages = await db.insert(messages).values(messagesToInsert).returning({id:messages.id});

    // check if the insert was successful
    if (insertedMessages.length === 0) {
        throw new Error("Failed to insert messages into the database");
    }
    
    // Return the inserted messages
    return insertedMessages;

}
