import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./server/db";
import { user, session, account, verification, rateLimit } from "./server/db/better-auth";

export const auth = betterAuth({
  trustedOrigins: [
    "http://localhost:5173",
  ],
  rateLimit: {
    enabled: true,
    window: 10,
    max:20,
    storage: "database"
  },
  emailAndPassword: {
    enabled: true,
  },
  database: drizzleAdapter(db, {
    provider: "pg", // or "pg" or "mysql"
    schema: {
      user,
      session,
      account,
      verification,
      rateLimit
    }
  }),
});
