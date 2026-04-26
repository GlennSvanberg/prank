import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  pranks: defineTable({
    name: v.string(),
    displayName: v.string(),
    description: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  }).index("by_name", ["name"]),
  victims: defineTable({
    name: v.string(),
    lastSeen: v.number(),
    prankStates: v.record(v.string(), v.boolean()),
  }),
});
