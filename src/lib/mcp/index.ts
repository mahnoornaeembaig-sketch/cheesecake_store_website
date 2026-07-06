import { defineMcp } from "@lovable.dev/mcp-js";
import listMenuTool from "./tools/list-menu";
import listReviewsTool from "./tools/list-reviews";
import submitReviewTool from "./tools/submit-review";

export default defineMcp({
  name: "cheesecake-method-mcp",
  title: "The Cheesecake Method",
  version: "0.1.0",
  instructions:
    "Tools for The Cheesecake Method storefront. Use `list_menu` to browse cheesecakes, `list_reviews` to read customer testimonials, and `submit_review` to post a new customer review.",
  tools: [listMenuTool, listReviewsTool, submitReviewTool],
});
