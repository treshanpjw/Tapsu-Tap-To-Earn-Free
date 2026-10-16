import { createInsertSchema } from "drizzle-zod";
import { sql } from "drizzle-orm";
import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const grandChallengeProgressTable = pgTable(
  "grand_challenge_progress",
  {
    clerkUserId: text("clerk_user_id").primaryKey(),
    completedMissionIds: jsonb("completed_mission_ids")
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    claimedAt: timestamp("claimed_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
);

export const insertGrandChallengeProgressSchema = createInsertSchema(
  grandChallengeProgressTable,
).omit({ updatedAt: true });

export type InsertGrandChallengeProgress = z.infer<
  typeof insertGrandChallengeProgressSchema
>;
export type GrandChallengeProgress = typeof grandChallengeProgressTable.$inferSelect;
