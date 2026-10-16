import { createInsertSchema } from "drizzle-zod";
import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const playerGameSavesTable = pgTable("player_game_saves", {
  clerkUserId: text("clerk_user_id").primaryKey(),
  save: jsonb("save").$type<Record<string, unknown>>().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertPlayerGameSaveSchema = createInsertSchema(
  playerGameSavesTable,
).omit({ updatedAt: true });

export type InsertPlayerGameSave = z.infer<typeof insertPlayerGameSaveSchema>;
export type PlayerGameSave = typeof playerGameSavesTable.$inferSelect;
