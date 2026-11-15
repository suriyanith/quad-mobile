import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
  args: { deviceId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("students")
      .withIndex("by_deviceId", (q) => q.eq("deviceId", args.deviceId))
      .unique();
  },
});

export const upsert = mutation({
  args: {
    deviceId: v.string(),
    firstName: v.string(),
    school: v.string(),
    dailyMinutes: v.number(),
    setupToken: v.string(),
    quadStudentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("students")
      .withIndex("by_deviceId", (q) => q.eq("deviceId", args.deviceId))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    }
    return await ctx.db.insert("students", args);
  },
});
