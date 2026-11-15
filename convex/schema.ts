import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const activityKind = v.union(
  v.literal("connected"),
  v.literal("plan_confirmed"),
  v.literal("proactive"),
  v.literal("session_ready"),
  v.literal("note"),
);

export default defineSchema({
  students: defineTable({
    deviceId: v.string(),
    firstName: v.string(),
    school: v.string(),
    dailyMinutes: v.number(),
    setupToken: v.string(),
    quadStudentId: v.optional(v.string()),
  }).index("by_deviceId", ["deviceId"]),

  // studentId is the Quad server's student id (e.g. "stu_..."), not a Convex document id.
  activity: defineTable({
    studentId: v.string(),
    kind: activityKind,
    title: v.string(),
    body: v.string(),
    at: v.number(),
  }).index("by_studentId_and_at", ["studentId", "at"]),

  bumps: defineTable({
    deviceId: v.string(),
    ts: v.number(),
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
  }).index("by_ts", ["ts"]),

  notes: defineTable({
    deviceId: v.string(),
    text: v.string(),
    at: v.number(),
  }).index("by_deviceId_and_at", ["deviceId", "at"]),
});
