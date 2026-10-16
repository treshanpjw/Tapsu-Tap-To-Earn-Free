import { z } from "zod/v4";
export declare const playerGameSavesTable: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "player_game_saves";
    schema: undefined;
    columns: {
        clerkUserId: import("drizzle-orm/pg-core").PgColumn<{
            name: "clerk_user_id";
            tableName: "player_game_saves";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: true;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        save: import("drizzle-orm/pg-core").PgColumn<{
            name: "save";
            tableName: "player_game_saves";
            dataType: "json";
            columnType: "PgJsonb";
            data: Record<string, unknown>;
            driverParam: unknown;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            $type: Record<string, unknown>;
        }>;
        updatedAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "updated_at";
            tableName: "player_game_saves";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
export declare const insertPlayerGameSaveSchema: z.ZodObject<{
    clerkUserId: z.ZodString;
    save: z.ZodType<Record<string, unknown>, Record<string, unknown>, z.core.$ZodTypeInternals<Record<string, unknown>, Record<string, unknown>>>;
}, {
    out: {};
    in: {};
}>;
export type InsertPlayerGameSave = z.infer<typeof insertPlayerGameSaveSchema>;
export type PlayerGameSave = typeof playerGameSavesTable.$inferSelect;
//# sourceMappingURL=playerGameSaves.d.ts.map