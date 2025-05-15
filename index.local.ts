import 'dotenv/config';
import express, { Request, Response } from "express";

import {
    app,
    asyncHandler,
    resolveAgentSession
} from "@agentic-profile/express-common";
import { createDidResolver } from "@agentic-profile/common";

import { coderAgent } from "./src/agents/coder/index.ts";
import { A2AService } from "./src/service/service.ts";
import { errorHandler } from "./src/service/error.ts";
import { commonRoutes } from "./src/routes.ts";
import { InMemoryStore } from "./src/storage/memory-store.ts";

// --- Expose /www directory for static files ---
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// --- Serve agent cards and profiles from files ---
app.use("/", express.static(
    join(__dirname, "www")
));

// --- Set up database ---
const store = new InMemoryStore();
store.createAccount({
    options: { uid: 2 },        // force to uid=2
    fields: {
        name: "Eric Portman",   // #2 in the Prisoner ;)
        credit: 10              // $10
    }
});

const didResolver = createDidResolver({ store });
const agentSessionResolver = async ( req: Request, res: Response ) => {
    return resolveAgentSession( req, res, store, didResolver );
}

// --- Useful common endpoints like server status, storage debugging ---
app.use("/", commonRoutes({
    status: { name: "Testing Agentic Profile with A2A" },
    store
}));


// === Example 1: A2A agent with no authentication ===
const a2aService1 = new A2AService( coderAgent, {} );
app.use("/agents/coder", a2aService1.routes() );


// === Example 2: A2A agent with authentication ===
const a2aService2 = new A2AService( coderAgent, { agentSessionResolver } );
app.use("/users/:uid/coder", a2aService2.routes() );


// Basic error handler for a2a services
app.use( errorHandler );

const port = process.env.PORT || 4004;
app.listen(port, () => {
    console.info(`A2A + Agentic Profile Express server listening on http://localhost:${port}`);
});