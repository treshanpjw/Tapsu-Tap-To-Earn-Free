import { z } from "zod/v4";
export declare const grandChallengeProgressTable: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "grand_challenge_progress";
    schema: undefined;
    columns: {
        clerkUserId: import("drizzle-orm/pg-core").PgColumn<{
            name: "clerk_user_id";
            tableName: "grand_challenge_progress";
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
        completedMissionIds: import("drizzle-orm/pg-core").PgColumn<{
            name: "completed_mission_ids";
            tableName: "grand_challenge_progress";
            dataType: "json";
            columnType: "PgJsonb";
            data: string[];
            driverParam: unknown;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            $type: string[];
        }>;
        claimedAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "claimed_at";
            tableName: "grand_challenge_progress";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        updatedAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "updated_at";
            tableName: "grand_challenge_progress";
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
export declare const insertGrandChallengeProgressSchema: z.ZodObject<{
    clerkUserId: z.ZodString;
    completedMissionIds: z.ZodOptional<z.ZodType<string[], string[], z.core.$ZodTypeInternals<string[], string[]>>>;
    claimedAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
}, {
    out: {};
    in: {};
}>;
export type InsertGrandChallengeProgress = z.infer<typeof insertGrandChallengeProgressSchema>;
export type GrandChallengeProgress = typeof grandChallengeProgressTable.$inferSelect;
//# sourceMappingURL=grandChallengeProgress.d.ts.map