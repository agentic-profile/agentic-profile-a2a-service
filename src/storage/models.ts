import { Task, Message } from "@agentic-profile/a2a-client/schema";

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
     * Saves a task and its associated message history.  Uses the data.task.sessionId to determine the session ID.
     * Overwrites existing data if the task ID exists.
     * @param data An object containing the task and its history.
     * @returns A promise resolving when the save operation is complete.
     */
    saveTask(data: TaskAndHistory): Promise<void>;

    /**
     * Loads a task and its history by task ID.
     * @param taskId The ID of the task to load.
     * @param sessionId The ID of the session to load.  If not provided, the task is loaded without a session ID.
     * @returns A promise resolving to an object containing the Task and its history, or null if not found.
     */
    loadTask(taskId: string, sessionId: string | null): Promise<TaskAndHistory | null>;
}
