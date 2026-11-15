import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const record = mutation({
  args: {
    deviceId: v.string(),
    ts: v.number(),
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("bumps", args);
  },
});
