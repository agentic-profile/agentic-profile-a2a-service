import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/index.ts"],
    format: ["cjs", "esm"], // Build for commonJS and ESmodules
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    outDir: "dist",
    target: "esnext",
    external: [
        "express","path","body-parser","depd",
        "loglevel",
        "@agentic-profile/auth",
        "@agentic-profile/common",
        "@agentic-profile/ai-provider"
    ]
});