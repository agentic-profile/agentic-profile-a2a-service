# Typescript A2A service library with support for Agentic Profiles (globally unique agent ids and universal authentication)

> For a demonstration of this library and examples of its implemention, please download the [SDK](https://github.com/agentic-profile/agentic-profile-a2a)

This project provides a TypeScript A2A service that is easy to integrate into an existing Express server.  The A2A service has been extended to support the Agentic Profile.

- [Project overview](#project-overview)
- [Quickstart](#quickstart)
- [Enhancing A2A with the Agentic Profile](#enhancing-a2a-with-the-agentic-profile)


## Project overview

This project provides an NPM package to easily add A2A support to existing Express servers.

The sourcecode has the following:

- service/ - Express A2A endpoint handler
- storage/ - In Memory implementation of the storage interface


## Quickstart

For a demonstration of this library and examples of its implemention, please download the [SDK](https://github.com/agentic-profile/agentic-profile-a2a)



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
