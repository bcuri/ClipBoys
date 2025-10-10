import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(), // Whop user id
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  email: text("email"),
  name: text("name"),
});

export const videos = sqliteTable("videos", {
  id: text("id").primaryKey(), // youtube video id
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  thumbnailUrl: text("thumbnail_url"),
});

export const generatedClips = sqliteTable("generated_clips", {
  id: text("id").primaryKey(), // cuid
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  userId: text("user_id").notNull(),
  videoId: text("video_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  startSec: integer("start_sec").notNull(),
  endSec: integer("end_sec").notNull(),
  score: integer("score"),
  thumbnailUrl: text("thumbnail_url"),
});

export const savedClips = sqliteTable("saved_clips", {
  id: text("id").primaryKey(), // cuid
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  userId: text("user_id").notNull(),
  clipId: text("clip_id").notNull(),
});

export type DBUser = typeof users.$inferSelect;
export type DBVideo = typeof videos.$inferSelect;
export type DBGeneratedClip = typeof generatedClips.$inferSelect;
export type DBSavedClip = typeof savedClips.$inferSelect;


