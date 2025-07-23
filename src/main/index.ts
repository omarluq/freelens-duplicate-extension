import { Main } from "@freelensapp/extensions";
import { ipcMain } from "electron";
import {
  CommandExecutionProgress,
  CommandExecutionRequest,
  CommandResult,
  IPC_CHANNELS,
} from "../renderer/types/duplik8s-types";
import { commandExecutionService } from "./services/command-execution-service";

/**
 * Main process extension for Duplik8s functionality
 * Handles IPC communication for kubectl command execution
 */
export default class Duplik8sMain extends Main.LensExtension {
  async onActivate() {
    console.log("duplik8s main | activating...");

    // Register IPC handlers for command execution
    this.registerIpcHandlers();

    console.log("duplik8s main | activated");
  }

  onDeactivate() {
    console.log("duplik8s main | deactivating...");

    // Clean up IPC handlers
    this.unregisterIpcHandlers();

    console.log("duplik8s main | deactivated");
  }

  /**
   * Register IPC handlers for command execution
   */
  private registerIpcHandlers(): void {
    // Handle kubectl availability check
    ipcMain.handle(IPC_CHANNELS.CHECK_KUBECTL_AVAILABILITY, async () => {
      try {
        const available = await commandExecutionService.checkKubectlAvailability();
        console.log("kubectl availability check:", available);
        return available;
      } catch (error) {
        console.error("Error checking kubectl availability:", error);
        return false;
      }
    });

    // Handle command execution requests
    ipcMain.handle(
      IPC_CHANNELS.EXECUTE_DUPLICATE_COMMAND,
      async (event, request: CommandExecutionRequest): Promise<CommandResult> => {
        console.log("Received command execution request:", request);

        try {
          // Execute the command with progress reporting
          const result = await commandExecutionService.executeCommand(request, (progress: CommandExecutionProgress) => {
            // Send progress updates to the renderer process
            event.sender.send(IPC_CHANNELS.COMMAND_EXECUTION_PROGRESS, progress);
          });

          console.log("Command execution completed:", {
            success: result.success,
            command: result.command,
            exitCode: result.exitCode,
            duration: result.duration,
          });

          return result;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error("Command execution error:", errorMessage);

          return {
            success: false,
            command: "",
            error: errorMessage,
            exitCode: -1,
          };
        }
      },
    );

    console.log("IPC handlers registered for duplik8s command execution");
  }

  /**
   * Unregister IPC handlers to prevent memory leaks
   */
  private unregisterIpcHandlers(): void {
    ipcMain.removeHandler(IPC_CHANNELS.CHECK_KUBECTL_AVAILABILITY);
    ipcMain.removeHandler(IPC_CHANNELS.EXECUTE_DUPLICATE_COMMAND);

    console.log("IPC handlers unregistered for duplik8s command execution");
  }
}
