import {
    AgenticProfile,
    DID
} from "@agentic-profile/common/schema";
import {
    ClientAgentSession,
    ClientAgentSessionStore,
    ClientAgentSessionUpdates
} from "@agentic-profile/auth";
import { AgenticProfileStore } from "@agentic-profile/common";

import {
    TaskAndHistory,
    TaskStore
} from "./models.js";


export class InMemoryStore implements TaskStore, ClientAgentSessionStore, AgenticProfileStore {
    private nextSessionId = 1;
    private clientSessions = new Map<number,ClientAgentSession>();
    private profileCache = new Map<string,AgenticProfile>();

    async dump() {
        return {
            database: 'memory',
            clientSessions: mapToObject( this.clientSessions ),
            profileCache: mapToObject( this.profileCache )
        } as any
    }

    private store: Map<string, TaskAndHistory> = new Map();

    async loadTask(taskId: string): Promise<TaskAndHistory | null> {
        const entry = this.store.get(taskId);
        // Return copies to prevent external mutation
        return entry
            ? { task: { ...entry.task }, history: [...entry.history] }
            : null;
    }

    async saveTask(data: TaskAndHistory): Promise<void> {
        // Store copies to prevent internal mutation if caller reuses objects
        this.store.set(data.task.id, {
            task: { ...data.task },
            history: [...data.history],
        });
    }


    //
    // Client sessions - agents are contacting me as a service.  I give them
    // challenges and then accept their authTokens
    //

    async createClientAgentSession( challenge: string ) {
        const id = this.nextSessionId++;
        this.clientSessions.set( id, { id, challenge, created: new Date() } as ClientAgentSession );
        return id;
    }

    async fetchClientAgentSession( id:number ) {
        return this.clientSessions.get( id );  
    }

    async updateClientAgentSession( id:number, updates:ClientAgentSessionUpdates ) {
        const session = this.clientSessions.get( id );
        if( !session )
            throw new Error("Failed to find client session by id: " + id );
        else
            this.clientSessions.set( id, { ...session, ...updates } );
    }


    //
    // Agentic Profile Cache
    //

    async saveAgenticProfile( profile: AgenticProfile ) { 
        this.profileCache.set( profile.id, profile )
    }

    async loadAgenticProfile( did: DID ) {
        return this.profileCache.get( did )
    }
}

function mapToObject<K extends PropertyKey, V>(map: Map<K, V>): Record<K, V> {
    return Object.fromEntries(map) as Record<K, V>;
}
