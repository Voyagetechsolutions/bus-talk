import { ConvexProvider, ConvexReactClient } from "convex/react";

// Convex generates CONVEX_URL in .env.local
// React apps need REACT_APP_ prefix, but create-react-app also supports CONVEX_URL
const convexUrl = process.env.REACT_APP_CONVEX_URL || process.env.CONVEX_URL;

if (!convexUrl) {
    console.warn("No Convex URL found. Make sure npx convex dev is running.");
}

const convex = new ConvexReactClient(convexUrl || "");

export { convex, ConvexProvider };