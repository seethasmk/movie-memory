import { defineConfig } from "vitest/config";
import path from "path";

// Test settings
export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  test: { environment: "node" },
});