import { Renderer } from "@freelensapp/extensions";

// Kubernetes resource types supported by duplik8s
export type Pod = Renderer.K8sApi.Pod;
export type Deployment = Renderer.K8sApi.Deployment;
export type StatefulSet = Renderer.K8sApi.StatefulSet;

// Union type for all supported resources
export type SupportedResource = Pod | Deployment | StatefulSet;

// Resource type enum for duplik8s CLI
export enum ResourceType {
  POD = "pod",
  DEPLOYMENT = "deploy",
  STATEFULSET = "statefulset",
}

// Command execution interfaces
export interface CommandExecutionRequest {
  resourceType: ResourceType;
  resourceName: string;
  namespace: string;
  commandOverride?: string;
  argsOverride?: string;
  openShell?: boolean;
}

export interface CommandExecutionProgress {
  stage: "starting" | "executing" | "completed" | "error";
  message: string;
  command?: string;
  output?: string;
}

export interface CommandResult {
  success: boolean;
  command: string;
  output?: string;
  error?: string;
  exitCode?: number;
  duration?: number;
}

// IPC channel names for command execution
export const IPC_CHANNELS = {
  EXECUTE_DUPLICATE_COMMAND: "execute-duplicate-command",
  COMMAND_EXECUTION_PROGRESS: "command-execution-progress",
  COMMAND_EXECUTION_RESULT: "command-execution-result",
  CHECK_KUBECTL_AVAILABILITY: "check-kubectl-availability",
} as const;

// Resource type mapping from Kubernetes kind to CLI resource type
export const RESOURCE_TYPE_MAP: Record<string, ResourceType> = {
  Pod: ResourceType.POD,
  Deployment: ResourceType.DEPLOYMENT,
  StatefulSet: ResourceType.STATEFULSET,
};
