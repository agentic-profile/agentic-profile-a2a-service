import { UserID } from "@agentic-profile/common/schema";
import { AgenticProfileStore } from "@agentic-profile/common";
import { Task, Message } from "@agentic-profile/a2a-client/schema";
import { ClientAgentSessionStore } from "@agentic-profile/auth";

//
// Tasks
//

// Helper type for the simplified store
export interface TaskAndHistory {
    task: Task;
    history: Message[];
}

/**
 * Simplified interface for task storage providers.
 * Stores and retrieves both the task and its full message history together.
 */
export interface TaskStore {
    /**
     * Saves a task and its associated message history.
     * Overwrites existing data if the task ID exists.
     * @param data An object containing the task and its history.
     * @returns A promise resolving when the save operation is complete.
     */
    saveTask(data: TaskAndHistory): Promise<void>;

    /**
     * Loads a task and its history by task ID.
     * @param taskId The ID of the task to load.
     * @returns A promise resolving to an object containing the Task and its history, or null if not found.
     */
    loadTask(taskId: string): Promise<TaskAndHistory | null>;
}


//
// Accounts
//

export interface User {
    uid: UserID,
    name: string,
    created: Date
}

export interface Account extends User {
    credit?: number
}

export interface CreateAccountOptions {
    uid?: UserID
}

export interface CreateAccountFields {
    name: string,
    credit?: number
}

export interface CreateAccount {
    options: CreateAccountOptions,
    fields: CreateAccountFields
}

export interface AccountStore {
    createAccount( account: CreateAccount ): Promise<Account>;
    fetchAccountFields( uid: UserID, fields?: string ): Promise<Account | undefined>;
}

//
// Unified Storage
//

export interface UnifiedStore extends AccountStore, AgenticProfileStore, ClientAgentSessionStore, TaskStore {
    dump(): Promise<any>;
}
