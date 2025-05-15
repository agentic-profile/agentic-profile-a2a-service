import { join } from "path";
import os from "os";
import {
    mkdir,
    writeFile
} from "fs/promises";

import {
    loadKeyring,
    loadProfile,
    loadProfileAndKeyring
} from "@agentic-profile/express-common";
import {
    prettyJson,
    removeFragmentId
} from "@agentic-profile/common";

import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

export async function createProfileResolver() {
    // "regular" user
    const myProfileAndKeyring = await loadProfileAndKeyring( join( os.homedir(), ".agentic", "iam", "global-me" ) );

    // system account, to handle #system-key verifications from users
    const profile = await loadProfile( join( __dirname, "..", "www", ".well-known" ) );
    const keyring = await loadKeyring( join( __dirname, ".." ) ); 

    const profiles = [ myProfileAndKeyring, { profile, keyring }]; 
    console.log( "profiles", profiles );

    const profileResolver = async ( did ) => {
        const targetId = removeFragmentId( did );
        const found = profiles.find( e=>e.profile.id === targetId );
        console.log( "profileResolver", did, targetId, found );
        return found;
    };

    return { profileResolver, myProfileAndKeyring };
}

export async function saveAgentCard( dir, card ) {
    await mkdir(dir, { recursive: true });
    await writeFile(
        join(dir, "agent.json"),
        prettyJson( card ),
        "utf8"
    );
}

export const AGENT_CARD_TEMPLATE = {
    "name": "Coder Agent",
    "description": "An agent that generates code based on natural language instructions and streams file outputs.",
    "url": null,
    "provider": {
        "organization": "A2A Samples"
    },
    "version": "0.0.1",
    "capabilities": {
        "streaming": true,
        "pushNotifications": false,
        "stateTransitionHistory": true
    },
    "authentication": null,
    "defaultInputModes": [
        "text"
    ],
    "defaultOutputModes": [
        "text",
        "file"
    ],
    "skills": [
        {
            "id": "code_generation",
            "name": "Code Generation",
            "description": "Generates code snippets or complete files based on user requests, streaming the results.",
            "tags": [
                "code",
                "development",
                "programming"
            ],
            "examples": [
                "Write a python function to calculate fibonacci numbers.",
                "Create an HTML file with a basic button that alerts 'Hello!' when clicked.",
                "Generate a TypeScript class for a user profile with name and email properties.",
                "Refactor this Java code to be more efficient.",
                "Write unit tests for the following Go function."
            ]
        }
    ]
};

export const AGENTIC_PROFILE_TEMPLATE = {
    "@context": [
        "https://www.w3.org/ns/did/v1",
        "https://w3id.org/security/suites/jws-2020/v1",
        "https://iamagentic.org/ns/agentic-profile/v1"
    ],
    "id": "did:web:localhost%3A3003",
    "verificationMethod": [
        {
            "id": "#identity-key",
            "type": "JsonWebKey2020",
            "publicKeyJwk": {
                "kty": "OKP",
                "alg": "EdDSA",
                "crv": "Ed25519",
                "x": "6EVHWPcPSJgxkTnjLWYLtjhHjIFWohzHnp9yelwJq6A"
            }
        }
    ],
    "service": [
        {
            "name": "Secure Coder",
            "id": "#a2a-coder",
            "type": "A2A",
            "serviceEndpoint": "http://localhost:3003/users/2/coder/",
            "capabilityInvocation": [
                {
                    "id": "#agent-coder-key-0",
                    "type": "JsonWebKey2020",
                    "publicKeyJwk": {
                        "kty": "OKP",
                        "alg": "EdDSA",
                        "crv": "Ed25519",
                        "x": "ZESf0Wm6aAyYWFgttPywpDmlLhzTo7BNZXxq54ht0EE"
                    }
                }
            ]
        }
    ]
};