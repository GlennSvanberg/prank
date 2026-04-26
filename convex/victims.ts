import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("victims").collect();
  },
});

export const getById = query({
  args: { id: v.id("victims") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const register = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("victims")
      .filter((q) => q.eq(q.field("name"), args.name))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { lastSeen: Date.now() });
      return existing._id;
    }

    return await ctx.db.insert("victims", {
      name: args.name,
      lastSeen: Date.now(),
      prankStates: {},
    });
  },
});

export const heartbeat = mutation({
  args: { id: v.id("victims") },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (existing) {
      await ctx.db.patch(args.id, { lastSeen: Date.now() });
    }
  },
});

export const togglePrank = mutation({
  args: {
    victimId: v.id("victims"),
    prankName: v.string(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const victim = await ctx.db.get(args.victimId);
    if (!victim) throw new Error("Victim not found");

    const newPrankStates = { ...victim.prankStates };
    newPrankStates[args.prankName] = args.isActive;

    await ctx.db.patch(args.victimId, { prankStates: newPrankStates });
  },
});
