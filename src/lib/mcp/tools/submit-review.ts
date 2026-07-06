import { createClient } from "@supabase/supabase-js";
import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "submit_review",
  title: "Submit a customer review",
  description:
    "Submit a new customer review for a cheesecake. Rating must be between 1 and 5.",
  inputSchema: {
    name: z.string().trim().min(1).max(80).describe("Reviewer's display name."),
    product_tag: z
      .string()
      .trim()
      .min(1)
      .max(80)
      .describe("Cheesecake name/tag being reviewed (e.g. 'Biscoff Override')."),
    rating: z.number().int().min(1).max(5).describe("Star rating from 1 to 5."),
    review_text: z
      .string()
      .trim()
      .min(1)
      .max(1000)
      .describe("The review body."),
  },
  annotations: { readOnlyHint: false, openWorldHint: false },
  handler: async ({ name, product_tag, rating, review_text }) => {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) {
      return {
        content: [{ type: "text", text: "Database is not configured." }],
        isError: true,
      };
    }
    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await supabase
      .from("reviews")
      .insert({ name, product_tag, rating, review_text })
      .select()
      .single();
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: `Review submitted (id: ${data.id}).` }],
      structuredContent: { review: data },
    };
  },
});
