import {
    AgenticProfile,
    DID,
    UserID
} from "@agentic-profile/common/schema";
import {
    ClientAgentSession,
    ClientAgentSessionUpdates
} from "@agentic-profile/auth";

import {
    Account,
    CreateAccount,
    TaskAndHistory,
    UnifiedStore
} from "./models.js";


let nextUserId = 1;
const accounts = new Map<string,Account>();

let nextSessionId = 1;
const clientSessions = new Map<number,ClientAgentSession>();

const profileCache = new Map<string,AgenticProfile>();


function mapToObject<K extends PropertyKey, V>(map: Map<K, V>): Record<K, V> {
    return Object.fromEntries(map) as Record<K, V>;
}

export class InMemoryStore implements UnifiedStore {

    async dump() {
        return {
            database: 'memory',
            accounts: mapToObject( accounts ),
            clientSessions: mapToObject( clientSessions ),
            profileCache: mapToObject( profileCache )
        }
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
    // Accounts
    //

    async createAccount( { options, fields }: CreateAccount ) {
        let uid;
        if( options?.uid ) {
            uid = +options.uid;
            if( uid >= nextUserId )
                nextUserId = uid + 1;
        } else
            uid = nextUserId++;

        const { name, credit = 2 } = fields;
        const account = { name, credit, uid, created: new Date() };
        accounts.set( ''+uid, account );
        return account;
    }

    async fetchAccountFields( uid: UserID, fields?: string ) {
        return accounts.get( ''+uid );
    }

    //
    // Client sessions - agents are contacting me as a service.  I give them
    // challenges and then accept their authTokens
    //

    async createClientAgentSession( challenge: string ) {
        const id = nextSessionId++;
        clientSessions.set( id, { id, challenge, created: new Date() } as ClientAgentSession );
        return id;
    }

    async fetchClientAgentSession( id:number ) {
        return clientSessions.get( id );  
    }

    async updateClientAgentSession( id:number, updates:ClientAgentSessionUpdates ) {
        const session = clientSessions.get( id );
        if( !session )
            throw new Error("Failed to find client session by id: " + id );
        else
            clientSessions.set( id, { ...session, ...updates } );
    }


    //
    // Agentic Profile Cache
    //

    async saveAgenticProfile( profile: AgenticProfile ) { 
        profileCache.set( profile.id, profile )
    }

    async loadAgenticProfile( did: DID ) {
        return profileCache.get( did )
    }
}
