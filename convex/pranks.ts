import { mutation, query } from "./_generated/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("pranks").collect();
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const defaultPranks = [
      { name: "chatgpt_takeover", displayName: "ChatGPT Takeover", description: "Shows an intimidating, uncloseable popup claiming ChatGPT has taken over their computer." },
      { name: "drunk_mouse", displayName: "Drunk Mouse", description: "The mouse cursor will randomly jump around every few seconds." },
      { name: "greyscale", displayName: "Greyscale Screen", description: "Turns the victim's screen entirely black and white." },
      { name: "fart_space", displayName: "Fart on Space Press", description: "Plays a random wet fart sound whenever the Spacebar is pressed." },
      { name: "glenn_clipboard", displayName: "The \"Glenn\" Clipboard", description: "Forces the clipboard text to always be 'Glenn'." },
      { name: "instant_fart", displayName: "Instant Fart", description: "Immediately plays a random fart sound once." },
      { name: "rick_roll", displayName: "Rick Roll", description: "Opens the classic Rick Astley music video in their default browser." },
    ];

    const obsoleteNames = ["caps_lock_roulette", "hello_world"];
    for (const name of obsoleteNames) {
      const obsolete = await ctx.db
        .query("pranks")
        .filter((q) => q.eq(q.field("name"), name))
        .first();
      if (obsolete) {
        await ctx.db.delete(obsolete._id);
      }
    }

    for (const prank of defaultPranks) {
      const existing = await ctx.db
        .query("pranks")
        .filter((q) => q.eq(q.field("name"), prank.name))
        .first();
      if (!existing) {
        await ctx.db.insert("pranks", prank);
      } else {
        await ctx.db.patch(existing._id, {
          displayName: prank.displayName,
          description: prank.description,
        });
      }
    }
  },
});
