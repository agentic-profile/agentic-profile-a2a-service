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
    private taskStore = new Map<string,TaskAndHistory>();

    constructor() {
        console.log( "InMemoryStore constructor" );
    }

    async dump() {
        return {
            database: 'memory',
            clientSessions: mapToObject( this.clientSessions ),
            profileCache: mapToObject( this.profileCache ),
            taskStore: mapToObject( this.taskStore )
        } as any;
    }

    private createTaskKey( taskId: string, sessionId: string | null ): string {
        return `${sessionId ?? ""}:${taskId}`;
    }

    async loadTask(taskId: string, sessionId: string | null): Promise<TaskAndHistory | null> {
        const key = this.createTaskKey(taskId, sessionId);
        const entry = this.taskStore.get(key);
        // Return copies to prevent external mutation
        return entry
            ? { task: { ...entry.task }, history: [...entry.history] }
            : null;
    }

    async saveTask(data: TaskAndHistory): Promise<void> {
        // Store copies to prevent internal mutation if caller reuses objects
        const { task } = data;
        const key = this.createTaskKey(task.id, task.sessionId ?? null)
        this.taskStore.set(key, {
            task: { ...task },
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
