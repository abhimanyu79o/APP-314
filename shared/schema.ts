import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const candidates = pgTable("candidates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  party: text("party").notNull(),
  experience: text("experience").notNull(),
  votes: integer("votes").notNull().default(0),
});

export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  candidateId: integer("candidate_id").notNull(),
  voterToken: text("voter_token").notNull().unique(), // To prevent duplicate voting
});

export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertCandidateSchema = createInsertSchema(candidates).omit({
  id: true,
  votes: true,
});

export const insertVoteSchema = createInsertSchema(votes).omit({
  id: true,
});

export const insertAdminSchema = createInsertSchema(admins).omit({
  id: true,
});

export const adminLoginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export type InsertCandidate = z.infer<typeof insertCandidateSchema>;
export type Candidate = typeof candidates.$inferSelect;
export type InsertVote = z.infer<typeof insertVoteSchema>;
export type Vote = typeof votes.$inferSelect;
export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type Admin = typeof admins.$inferSelect;
export type AdminLogin = z.infer<typeof adminLoginSchema>;
