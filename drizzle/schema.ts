import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";

export const rsvpResponses = sqliteTable(
  "rsvp_responses",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    householdId: text("household_id").notNull(),
    memberId: text("member_id").notNull(),
    eventKey: text("event_key").notNull(),
    status: text("status").notNull().default("pending"),
    comment: text("comment"),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [uniqueIndex("rsvp_responses_member_event_idx").on(table.memberId, table.eventKey)],
);

export const loginAudit = sqliteTable("login_audit", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ip: text("ip").notNull(),
  emailTried: text("email_tried").notNull(),
  success: integer("success").notNull(),
  createdAt: text("created_at").notNull(),
});
