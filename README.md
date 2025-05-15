# Typescript A2A service library with support for Agentic Profiles (globally unique agent ids and universal authentication)

This project provides an A2A TypeScript service implementation that is easy to integrate into an existing Express server.  The A2A service has been extended to support the Agentic Profile.

- [Quick overview of this project](#quick-overview-of-this-project)
- [Quickstart](#quickstart)
- [Test the different A2A agents](#test-the-different-a2a-agents)
- [Basic Usage](#basic-usage)
- [Enhancing A2A with the Agentic Profile](#enhancing-a2a-with-the-agentic-profile)


## Quick overview of this project

This project provides:

- An NPM package to easily add A2A support to existing Express servers
- A Node service using Express to demonstrate two A2A agents
- Scripts to create agent cards and Agentic Profiles

The project sourcecode has the following:

- agents/
    - coder/ - An A2A programming assistant/agent
    - eliza/ - The classic Eliza therapist
- service/ - Express A2A endpoint handler
- storage/ - In Memory implementation of the storage interface
- routes - Provides useful endpoints like /status and /storage for debugging

The root directory contains:

- index.local.ts - A demonstration of an A2A server with globally unique user and business scoped agent ids, and universal authentication


## Quickstart

The easiest way to run this demo is locally.

1. Requirements - Make sure these are installed:

    - [git](https://github.com/git-guides/install-git)
    - [node](https://nodejs.org/en/download)

2. From the shell, clone this repository and switch to the project directory.

    ```bash
    git clone git@github.com:agentic-profile/agentic-profile-a2a-service.git
    cd agentic-profile-a2a-service
    ```

3. Download dependencies

    ```bash
    npm install
    ```

4. Create demo data.  Agent cards and agentic profiles for the server agents, and a demo user profile to authenticate with.

    ```bash
    npm run create-server-agent-cards-and-profiles
    npm run create-demo-user
    ```

4. Run the server

    ```bash
    npm run dev
    ```

### Finish Configuring the Node Server

1. Copy the file example.env to .env

    ```bash
    cp example.env .env
    ```

2. Edit the .env file.

    To enable admin features.  Uncomment ADMIN_TOKEN and choose a password, for example:

    ```
    ADMIN_TOKEN=<yoursecret>
    ```

    Add your Gemini API key (required to use the coder A2A agent).  [Get a Gemini API key](https://ai.google.dev/gemini-api/docs/api-key)

    ```
    GEMINI_API_KEY=<your Gemini API key>
    ```

3. Restart the server

    ```bash
    npm run dev
    ```

4. Make sure an admin feature works.  From the command line try:

    ```bash
    curl -H "Authorization: Bearer yoursecret" http://localhost:4004/storage
    ```

    Or from the browser:

    http://localhost:4004/storage?auth=yoursecret


## Test the different A2A agents

1. Make sure the server is started:

    ```bash
    npm run dev
    ```

4. For each of the following examples, open a new terminal window. For examples with authentication skip to step #5

    Start the A2A client using the agent card, but still no authentication

    ```bash
    npm run cli -- -p http://localhost:4004/agents/coder/
    ```

    Start the A2A client using the Agentic Profile, but still no authentication

    ```bash
    npm run cli -- -p did:web:localhost%3A4004:agents:coder#a2a-coder
    ```

5. In order to use authentication, you must create an agentic profile and keys to authenticate with.

    ```bash
    npm run create-demo-profile
    ```

    The above script creates a new agentic profile on the test.agenticprofile.ai server, and also stores
    a copy in your filesystem at ~/.agentic/iam/a2a-service-demo-user

6. Examples using Agentic Profile authentication

    Start the A2A client with an Agentic Profile and authentication

    ```bash
    npm run cli -- -p did:web:localhost%3A4004:users:2:coder#a2a-coder -u "#agent-chat"
    ```

    Start the A2A client with the well-known Agentic Profile and authentication

    ```bash
    npm run cli -- -i "a2a-service-demo-user" -p did:web:localhost%3A4004#a2a-coder
    ```

    Start the A2A client with the well-known agent and authentication

    ```bash
    npm run cli -- -p http://localhost:4004/
    ```

    Start the A2A client with the well-known agentic profile and authentication

    ```bash
    npm run cli -- -p did:web:localhost%3A4004#a2a-coder
    ```


## Basic Usage

```typescript
import {
  A2AService,
  InMemoryTaskStore,
  TaskContext,
  TaskYieldUpdate,
} from "./index"; // Assuming imports from the server package

// 1. Define your agent's logic as a TaskHandler
async function* myAgentLogic(
  context: TaskContext
): AsyncGenerator<TaskYieldUpdate> {
  console.log(`Handling task: ${context.task.id}`);
  yield {
    state: "working",
    message: { role: "agent", parts: [{ text: "Processing..." }] },
  };

  // Simulate work...
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (context.isCancelled()) {
    console.log("Task cancelled!");
    yield { state: "canceled" };
    return;
  }

  // Yield an artifact
  yield {
    name: "result.txt",
    mimeType: "text/plain",
    parts: [{ text: `Task ${context.task.id} completed.` }],
  };

  // Yield final status
  yield {
    state: "completed",
    message: { role: "agent", parts: [{ text: "Done!" }] },
  };
}

// 2. Create and start the server
const store = new InMemoryTaskStore(); // Or new FileStore()
const server = new A2AServer(myAgentLogic, { taskStore: store });

server.start(); // Starts listening on default port 41241

console.log("A2A Server started.");
```


## Enhancing A2A with the Agentic Profile

The Agentic Profile is a thin layer over A2A, MCP, and other HTTP protocols, and provides:

- Globally unique - user and business scoped - agent identity
- Universal authentication

The A2A service, agent, and command line interface were derived from Googles code: https://github.com/google/A2A.git

For each DID document service/agent, we specify the "type" as "A2A" and use the serviceEndpoint to reference the agent.json file.


### Why do we need user and business scoped agent identity?

Identity is essential for digital communication between parties because it establishes trust, accountability, and context — without which meaningful, secure interaction is nearly impossible.

Current agent protocols focus on individual agent identity, which while accomplishing the communications goal, does not establish trust and accountability which derive from clear relationships with the people or business the agent represents.

For example, you trust an employee of a bank because they are in the bank building, behind the counter, and wearing a company nametag.


#### How does the Agentic Profile solve this?

The Agentic Profile provides the digital equivalent of how we judge employees, by using a verifiable document provided by the person or business, and declaring all the agents that represent the person or business.

For example the business at the DNS domain matchwise.ai can have a "chat-agent", which combined becomes matchwise.ai#chat-agent.  [Concensys](https://consensys.io/) helped create the [DID specification](https://www.w3.org/TR/did-1.0/) which has a URI format that results in did:web:matchwise.ai#chat-agent.  DID documents (what you find using the did:web:matchwise.ai URI) provides a list of HTTP services, which are equivalent to agents.  The Agentic Profile simply lists the agents in the DID document services. 

With the Agentic Profile, the person or business is the first class citizen, and all the agents that represent them are clearly defined.


## Why do we need universal authentication?

Most agent authentication is done using shared keys and HTTP Authorization headers.  While this is easy to implement, it is very insecure.

Another popular option is OAuth, but that has another host of problems including dramatically increasing the attack surface and the challenges of making sure both agents agree on the same authentication service provider.


### How does the Agentic Profile solve this?

Public key cryptography, which is used extensively for internet communication, is ideal for decentralized authentication.  It is very easy to publish an agents public key via the Agentic Profile, and then the agent can use its secret key to authenticate.  JSON Web Tokens + EdDSA are mature and widely used standards, and the ones Agentic Profile uses.

With great options like JWT+EdDSA, centralized authentication systems like OAuth are unecessary.
