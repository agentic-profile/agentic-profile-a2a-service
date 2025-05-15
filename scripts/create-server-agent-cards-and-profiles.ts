import 'dotenv/config';

import { join } from "path";
import { createEdDsaJwk } from "@agentic-profile/auth";
import {
    createAgenticProfile,
    webDidToUrl
} from "@agentic-profile/common";
import { saveProfile } from "@agentic-profile/express-common";
import {
    __dirname,
    AGENT_CARD_TEMPLATE,
    saveAgentCard
} from "./util.js";


(async ()=>{
    const port = process.env.PORT || 4004;
    const keyring = [];

    try {
        // Well-known agentic profile and agent card
        let newKeys = await createAgentCardAndProfile({
            dir: join( __dirname, "..", "www", ".well-known" ),
            did: `did:web:localhost:${port}`,
            services: [
                {
                    name: "Secure A2A coder",
                    type: "A2A",
                    id: "a2a-coder",
                    url: `http://localhost:${port}`
                }
            ],
            agent: {
                name: "Well-known A2A coder with authentication",
                url: `http://localhost:${port}/users/2/coder/`
            }
        });
        keyring.push( ...newKeys );

        // Coder agent with no authentication
        newKeys = await createAgentCardAndProfile({
            dir: join( __dirname, "..", "www", "agents", "coder" ),
            did: `did:web:localhost:${port}:agents:coder`,
            services: [
                {
                    name: "Unsecured A2A coder",
                    type: "A2A",
                    id: "a2a-coder",
                    url: `http://localhost:${port}/agents/coder/`
                }
            ],
            agent: {
                name: "A2A coder with no authentication",
                url: `http://localhost:${port}/agents/coder/`
            }
        });
        keyring.push( ...newKeys );

        // Coder agent with authentication
        newKeys = await createAgentCardAndProfile({
            dir: join( __dirname, "..", "www", "users", "2", "coder" ),
            did: `did:web:localhost:${port}:users:2:coder`,
            services: [
                {
                    name: "A2A coder with authentication",
                    type: "A2A",
                    id: "a2a-coder",
                    url: `http://localhost:${port}/users/2/coder/`
                }
            ],
            agent: {
                name: "A2A coder with authentication",
                url: `http://localhost:${port}/users/2/coder/`
            }
        });
        keyring.push( ...newKeys );

        //
        // Save combined keyring
        //
        await saveProfile({
            dir: join( __dirname, ".." ),
            keyring
        });

    } catch(error) {
    	console.log( "Failed to save profile", error );
    }
})();

async function createAgentCardAndProfile({ dir, did, services, agent }) {
    const { profile, keyring } = await createAgenticProfile({
        services,
        createJwk: createEdDsaJwk 
    });
    profile.id = did;

    const card = {
        ...AGENT_CARD_TEMPLATE,
        ...agent
    };

    await saveProfile({ dir, profile });
    console.log( `Saved profile to ${dir}/did.json
    DID: ${did}
    url: ${webDidToUrl(did)}` );
    await saveAgentCard( dir, card );
    console.log( `Saved agent card to ${dir}/agent.json\n` );

    return keyring;
}