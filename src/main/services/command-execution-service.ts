import { spawn } from "child_process";
// Import types from the shared location
import { CommandExecutionProgress, CommandExecutionRequest, CommandResult } from "../../renderer/types/duplik8s-types";

/**
 * Command execution service for kubectl duplicate operations
 * Handles the actual execution of kubectl commands with proper error handling,
 * timeout management, and progress reporting.
 */
export class CommandExecutionService {
  private readonly DEFAULT_TIMEOUT = 30000; // 30 seconds
  private readonly MAX_OUTPUT_SIZE = 1024 * 1024; // 1MB

  constructor(private logger = console) {}

  /**
   * Execute a kubectl duplicate command based on the provided request
   */
  async executeCommand(
    request: CommandExecutionRequest,
    progressCallback?: (progress: CommandExecutionProgress) => void,
  ): Promise<CommandResult> {
    const startTime = Date.now();

    try {
      // Validate kubectl is available
      const kubectlAvailable = await this.checkKubectlAvailability();
      if (!kubectlAvailable) {
        throw new Error("kubectl is not available in PATH");
      }

      // Build the command arguments
      const command = this.buildCommand(request);

      this.logger.log("Executing kubectl duplicate command:", command);

      // Report starting progress
      progressCallback?.({
        stage: "starting",
        message: "Preparing to execute kubectl duplicate command...",
        command: command.join(" "),
      });

      // Execute the command
      const result = await this.executeKubectlCommand(command, progressCallback);

      const duration = Date.now() - startTime;

      // Report completion
      progressCallback?.({
        stage: "completed",
        message: result.success ? "Command executed successfully" : "Command failed",
        output: result.output,
      });

      return {
        ...result,
        duration,
        command: command.join(" "),
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error("Command execution failed:", errorMessage);

      // Report error progress
      progressCallback?.({
        stage: "error",
        message: `Command execution failed: ${errorMessage}`,
      });

      return {
        success: false,
        command: this.buildCommand(request).join(" "),
        error: errorMessage,
        exitCode: -1,
        duration,
      };
    }
  }

  /**
   * Check if kubectl is available in the system PATH
   */
  async checkKubectlAvailability(): Promise<boolean> {
    return new Promise((resolve) => {
      const kubectl = spawn("kubectl", ["version", "--client"], {
        stdio: "pipe",
        timeout: 5000,
      });

      kubectl.on("close", (code) => {
        resolve(code === 0);
      });

      kubectl.on("error", () => {
        resolve(false);
      });

      // Force timeout after 5 seconds
      setTimeout(() => {
        kubectl.kill();
        resolve(false);
      }, 5000);
    });
  }

  /**
   * Build the kubectl duplicate command arguments array
   */
  private buildCommand(request: CommandExecutionRequest): string[] {
    const args = ["duplicate", request.resourceType, request.resourceName];

    // Add namespace
    if (request.namespace) {
      args.push("-n", request.namespace);
    }

    // Add command override if specified
    if (request.commandOverride) {
      args.push("--command-override", request.commandOverride);
    }

    // Add args override if specified
    if (request.argsOverride) {
      args.push("--args-override", request.argsOverride);
    }

    // Add shell flag if enabled
    if (request.openShell) {
      args.push("--shell");
    }

    return args;
  }

  /**
   * Execute the kubectl command with proper process management
   */
  private executeKubectlCommand(
    args: string[],
    progressCallback?: (progress: CommandExecutionProgress) => void,
  ): Promise<CommandResult> {
    return new Promise((resolve) => {
      let output = "";
      let errorOutput = "";
      let outputSize = 0;

      const kubectl = spawn("kubectl", args, {
        stdio: "pipe",
        timeout: this.DEFAULT_TIMEOUT,
        env: { ...process.env },
      });

      // Report execution progress
      progressCallback?.({
        stage: "executing",
        message: "Executing kubectl duplicate command...",
        command: `kubectl ${args.join(" ")}`,
      });

      // Handle stdout
      kubectl.stdout?.on("data", (data: Buffer) => {
        const chunk = data.toString();
        outputSize += chunk.length;

        // Prevent memory issues with very large outputs
        if (outputSize > this.MAX_OUTPUT_SIZE) {
          kubectl.kill();
          resolve({
            success: false,
            command: `kubectl ${args.join(" ")}`,
            error: "Command output exceeded maximum size limit",
            exitCode: -1,
          });
          return;
        }

        output += chunk;

        // Report progress with partial output
        progressCallback?.({
          stage: "executing",
          message: "Command is running...",
          output: output.slice(-500), // Show last 500 characters
        });
      });

      // Handle stderr
      kubectl.stderr?.on("data", (data: Buffer) => {
        const chunk = data.toString();
        errorOutput += chunk;
        outputSize += chunk.length;

        // Prevent memory issues
        if (outputSize > this.MAX_OUTPUT_SIZE) {
          kubectl.kill();
          resolve({
            success: false,
            command: `kubectl ${args.join(" ")}`,
            error: "Command output exceeded maximum size limit",
            exitCode: -1,
          });
          return;
        }
      });

      // Handle process completion
      kubectl.on("close", (code) => {
        const success = code === 0;

        resolve({
          success,
          command: `kubectl ${args.join(" ")}`,
          output: output || undefined,
          error: success ? undefined : errorOutput || `Command exited with code ${code}`,
          exitCode: code || 0,
        });
      });

      // Handle process errors
      kubectl.on("error", (error) => {
        this.logger.error("Process error:", error);
        resolve({
          success: false,
          command: `kubectl ${args.join(" ")}`,
          error: error.message,
          exitCode: -1,
        });
      });

      // Handle timeout
      setTimeout(() => {
        if (!kubectl.killed) {
          kubectl.kill();
          resolve({
            success: false,
            command: `kubectl ${args.join(" ")}`,
            error: `Command timed out after ${this.DEFAULT_TIMEOUT}ms`,
            exitCode: -1,
          });
        }
      }, this.DEFAULT_TIMEOUT);
    });
  }
}

/**
 * Singleton instance of the command execution service
 */
export const commandExecutionService = new CommandExecutionService();
