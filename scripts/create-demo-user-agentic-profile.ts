import os from "os";
import { join } from "path";
import {
    createAgenticProfile,
    prettyJson,
    webDidToUrl
} from "@agentic-profile/common";
import {
    createEdDsaJwk,
    postJson
} from "@agentic-profile/auth";
import {
    saveProfile
} from "@agentic-profile/express-common";


(async ()=>{
    const port = process.env.PORT || 4004;
    const services = [
        {
            name: "People connector",
            type: "A2A",
            id: "connect",
            url: `http://localhost:${port}/a2a/connect`
        }
    ];
    const { profile, keyring, b64uPublicKey } = await createAgenticProfile({ services, createJwk: createEdDsaJwk });

    try {
        // publish profile to web (so did:web:... will resolve)
        const { data } = await postJson(
            "https://testing.agenticprofile.ai/agentic-profile",
            { profile, b64uPublicKey }
        );
        const savedProfile = data.profile;
        const did = savedProfile.id;
        console.log( `Published demo user agentic profile to:

    ${webDidToUrl(did)}

Or via DID at:

    ${did}
`);

        // also save locally for reference
        const dir = join( os.homedir(), ".agentic", "iam", "a2a-service-demo-user" );
        await saveProfile({ dir, profile: savedProfile, keyring });

        console.log(`Saved demo user agentic profile to ${dir}

Shhhh! Keyring for testing... ${prettyJson( keyring )}`);
    } catch (error) {
        console.error( "Failed to create demo user profile", error );
    }
})();