import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("ouoa", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
});