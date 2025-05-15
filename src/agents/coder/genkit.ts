/**
 * This file is derived from https://github.com/google/A2A.git
 * and under the Apache 2.0 License.
 * 
 * It has been modified to add support for the Agentic Profile, as
 * well as other enhancements.
 */

import { genkit } from "genkit/beta";
import { defineCodeFormat } from "./code-format.js";
import { gemini20Flash, googleAI } from "@genkit-ai/googleai";

export const ai = genkit({
  plugins: [googleAI()],
  model: gemini20Flash.withConfig({ version: "gemini-2.5-flash-preview-04-17" }),
});

defineCodeFormat(ai);

export { z } from "genkit/beta";
