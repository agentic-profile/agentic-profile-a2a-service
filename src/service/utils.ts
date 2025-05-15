/**
 * This file is derived from https://github.com/google/A2A.git
 * and under the Apache 2.0 License.
 * 
 * It has been modified to add support for the Agentic Profile, as
 * well as other enhancements.
 */

import {
    Artifact,
    TaskStatus
} from "@agentic-profile/a2a-client/schema";


/**
 * Generates a timestamp in ISO 8601 format.
 * @returns The current timestamp as a string.
 */
export function getCurrentTimestamp(): string {
    return new Date().toISOString();
}

/**
 * Checks if a value is a plain object (excluding arrays and null).
 * @param value The value to check.
 * @returns True if the value is a plain object, false otherwise.
 */
export function isObject(value: unknown): value is Record<string, any> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Type guard to check if an object is a TaskStatus update (lacks 'parts').
 * Used to differentiate yielded updates from the handler.
 */
export function isTaskStatusUpdate(
    update: any // eslint-disable-line @typescript-eslint/no-explicit-any
): update is Omit<TaskStatus, "timestamp"> {
    // Check if it has 'state' and NOT 'parts' (which Artifacts have)
    return isObject(update) && "state" in update && !("parts" in update);
}

/**
 * Type guard to check if an object is an Artifact update (has 'parts').
 * Used to differentiate yielded updates from the handler.
 */
export function isArtifactUpdate(
    update: any // eslint-disable-line @typescript-eslint/no-explicit-any
): update is Artifact {
    // Check if it has 'parts'
    return isObject(update) && "parts" in update;
}
