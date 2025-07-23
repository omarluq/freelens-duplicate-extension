import { ipcRenderer } from "electron";
import {
  CommandExecutionProgress,
  CommandExecutionRequest,
  CommandResult,
  IPC_CHANNELS,
} from "../types/duplik8s-types";

/**
 * IPC Service for communicating with the main process
 * Handles command execution requests and progress updates
 */
export class IPCService {
  private readonly ipcRenderer: typeof ipcRenderer;

  constructor() {
    // Use electron's ipcRenderer directly
    this.ipcRenderer = ipcRenderer;
  }

  /**
   * Check if kubectl is available on the system
   */
  async checkKubectlAvailability(): Promise<boolean> {
    try {
      return await this.ipcRenderer.invoke(IPC_CHANNELS.CHECK_KUBECTL_AVAILABILITY);
    } catch (error) {
      console.error("Error checking kubectl availability:", error);
      return false;
    }
  }

  /**
   * Execute a kubectl duplicate command
   */
  async executeCommand(
    request: CommandExecutionRequest,
    onProgress?: (progress: CommandExecutionProgress) => void,
  ): Promise<CommandResult> {
    return new Promise((resolve, reject) => {
      let progressListener: ((event: any, progress: CommandExecutionProgress) => void) | null = null;

      try {
        // Set up progress listener if callback provided
        if (onProgress) {
          progressListener = (_event: any, progress: CommandExecutionProgress) => {
            onProgress(progress);
          };
          this.ipcRenderer.on(IPC_CHANNELS.COMMAND_EXECUTION_PROGRESS, progressListener);
        }

        // Execute the command
        this.ipcRenderer
          .invoke(IPC_CHANNELS.EXECUTE_DUPLICATE_COMMAND, request)
          .then((result: CommandResult) => {
            // Clean up progress listener
            if (progressListener) {
              this.ipcRenderer.removeListener(IPC_CHANNELS.COMMAND_EXECUTION_PROGRESS, progressListener);
            }
            resolve(result);
          })
          .catch((error) => {
            // Clean up progress listener
            if (progressListener) {
              this.ipcRenderer.removeListener(IPC_CHANNELS.COMMAND_EXECUTION_PROGRESS, progressListener);
            }
            reject(error);
          });
      } catch (error) {
        // Clean up progress listener
        if (progressListener) {
          this.ipcRenderer.removeListener(IPC_CHANNELS.COMMAND_EXECUTION_PROGRESS, progressListener);
        }
        reject(error);
      }
    });
  }

  /**
   * Copy text to clipboard
   */
  async copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      return false;
    }
  }

  /**
   * Format duration in milliseconds to human readable string
   */
  formatDuration(milliseconds: number): string {
    if (milliseconds < 1000) {
      return `${milliseconds}ms`;
    }

    const seconds = Math.floor(milliseconds / 1000);
    const ms = milliseconds % 1000;

    if (seconds < 60) {
      return ms > 0 ? `${seconds}.${Math.floor(ms / 100)}s` : `${seconds}s`;
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}m ${remainingSeconds}s`;
  }

  /**
   * Parse command output to extract meaningful information
   */
  parseCommandOutput(output: string): {
    newResourceName?: string;
    namespace?: string;
    warnings?: string[];
    errors?: string[];
  } {
    const result: {
      newResourceName?: string;
      namespace?: string;
      warnings?: string[];
      errors?: string[];
    } = {
      warnings: [],
      errors: [],
    };

    if (!output) return result;

    const lines = output
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line);

    for (const line of lines) {
      // Extract resource creation info
      if (line.includes("created") || line.includes("duplicated")) {
        const match = line.match(/(\w+)\/([^\s]+)\s+created|duplicated/);
        if (match) {
          result.newResourceName = match[2];
        }
      }

      // Extract namespace info
      if (line.includes("namespace")) {
        const match = line.match(/namespace[:\s]+([^\s]+)/i);
        if (match) {
          result.namespace = match[1];
        }
      }

      // Identify warnings
      if (line.toLowerCase().includes("warning")) {
        result.warnings?.push(line);
      }

      // Identify errors (for stderr that might contain non-fatal errors)
      if (line.toLowerCase().includes("error") && !line.toLowerCase().includes("no error")) {
        result.errors?.push(line);
      }
    }

    return result;
  }
}

/**
 * Singleton instance of the IPC service
 */
export const ipcService = new IPCService();
