import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { deviceId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notes")
      .withIndex("by_deviceId_and_at", (q) => q.eq("deviceId", args.deviceId))
      .order("desc")
      .take(200);
  },
});

export const add = mutation({
  args: { deviceId: v.string(), text: v.string() },
  handler: async (ctx, args) => {
    const text = args.text.trim().slice(0, 500);
    if (!text) throw new Error("Note text is required");
    return await ctx.db.insert("notes", { deviceId: args.deviceId, text, at: Date.now() });
  },
});
