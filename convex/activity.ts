import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";
import { activityKind } from "./schema";

/** Newest-first feed for one Quad student. */
export const list = query({
  args: { studentId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("activity")
      .withIndex("by_studentId_and_at", (q) => q.eq("studentId", args.studentId))
      .order("desc")
      .take(100);
  },
});

/** Only reachable from the `POST /quad/event` HTTP action (see http.ts). */
export const add = internalMutation({
  args: {
    studentId: v.string(),
    kind: activityKind,
    title: v.string(),
    body: v.string(),
    at: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("activity", args);
  },
});
