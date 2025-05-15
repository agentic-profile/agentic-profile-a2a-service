/*
import {
    ChatMessage,
    DID
} from "@agentic-profile/common";
import Eliza from "./elizabot.js";
import log from "loglevel";

import {
    AIProvider,
    ChatCompletionParams,
    ChatCompletionResult,
    CompletionResult
} from "../../models.js";

import {
    calculateInferenceCost,
    TokenPricing
} from "../../cost.js"

const PRICING = {
    model: "eliza-1966",
    inputCostPerMillion: 1.50,
    outputCostPerMillion: 2.00
} as TokenPricing;


// Yes, global scope because there are many instances of this provider.  NOT CLOUD FRIENDLY.
const sessions = new Map<DID,Eliza>();

export default class ElizaProvider implements AIProvider {
    private model: string;

    constructor( model?: string ) {
        this.model = model || "eliza-1.2.0-beta.0";
        log.info( "Eliza with", this.model );
    }

    get ai() {
        return "eliza:" + this.model;
    }

    get poweredBy() {
        const version = this.model.split("-").splice(1).join(" ");
        return "Eliza " + version;
    }

    async chatCompletion( { agentDid, messages }: ChatCompletionParams ) {
        let eliza = sessions.get( agentDid );
        if( !eliza ) {
            eliza = new Eliza();
            sessions.set( agentDid, eliza );
        };

        const userText = lastPeerMessageText( agentDid, messages );
        let content;
        if( userText )
            content = eliza.transform( userText )!;
        else
            content = eliza.getInitial()!;

        const reply = {
            from: agentDid,
            content,
            created: new Date()
        };

        const usage = {
            prompt_tokens: Math.round( (userText?.length ?? 0) / 3),
            completion_tokens: Math.round(content.length / 3)
        };
        const cost = calculateInferenceCost({ tokenCounts: usage, pricing: PRICING });

        return {
            reply, 
            json: [],
            textWithoutJson: content,
            cost,
            context: {
                model: this.ai,
                params: { userText },
                response: {},
                promptMarkdown: "TBD"
            }
        } as ChatCompletionResult;
    }

    async completion(): Promise<CompletionResult> {
        throw new Error("Eliza completion not supported");
    }
}

function lastPeerMessageText( agentDid: DID, messages: ChatMessage[] ): string | undefined {
    const { content } = messages.reverse().find(e=>e.from !== agentDid) ?? {};
    return typeof content === 'string' ? content : undefined;
}*/