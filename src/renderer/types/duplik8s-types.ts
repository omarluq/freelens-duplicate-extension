import { Renderer } from "@freelensapp/extensions";

// Kubernetes resource types supported by duplik8s
export type Pod = Renderer.K8sApi.Pod;
export type Deployment = Renderer.K8sApi.Deployment;
export type StatefulSet = Renderer.K8sApi.StatefulSet;

// Union type for all supported resources
export type SupportedResource = Pod | Deployment | StatefulSet;

// Resource type enum for dropdown selection (matches duplik8s CLI)
export enum ResourceType {
  POD = "pod",
  DEPLOYMENT = "deploy", 
  STATEFULSET = "statefulset",
}

// Form data interface for the duplicate resource dialog
export interface DuplicateResourceFormData {
  resourceType: ResourceType;
  resourceName: string;
  namespace: string;
  kubeconfig?: string;
  context?: string;
  newResourceName: string;
  namePrefix: string;
  nameSuffix: string;
  commandOverride: string;
  openShell: boolean;
  isSubmitting: boolean;
  validationErrors: ValidationErrors;
}

// Validation error interface
export interface ValidationErrors {
  resourceName?: string;
  namespace?: string;
  kubeconfig?: string;
  context?: string;
  newResourceName?: string;
  commandOverride?: string;
}

// Option interface for select dropdowns
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

// Props interface for menu items
export interface ResourceDuplicateMenuItemProps<T extends SupportedResource>
  extends Renderer.Component.KubeObjectMenuProps<T> {
  extension: Renderer.LensExtension;
}

// Duplik8s command configuration interface
export interface Duplik8sCommandConfig {
  resourceType: ResourceType;
  resourceName: string;
  namespace?: string;
  kubeconfig?: string;
  context?: string;
  commandOverride?: string[];
  openShell?: boolean;
}

// Dialog state interface
export interface DialogState {
  isOpen: boolean;
  resource: SupportedResource | null;
  formData: DuplicateResourceFormData;
}

// Extension preferences interface
export interface Duplik8sPreferences {
  defaultNamespace?: string;
  defaultKubeconfig?: string;
  defaultContext?: string;
  defaultNameSuffix?: string;
  rememberLastSettings?: boolean;
}

// Command execution interfaces
export interface CommandExecutionRequest {
  resourceType: ResourceType;
  resourceName: string;
  namespace: string;
  kubeconfig?: string;
  context?: string;
  commandOverride?: string;
  argsOverride?: string;
  openShell?: boolean; // Keep for backward compatibility with main process
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

// Type guards
export const isPod = (resource: SupportedResource): resource is Pod => resource.kind === "Pod";

export const isDeployment = (resource: SupportedResource): resource is Deployment => resource.kind === "Deployment";

export const isStatefulSet = (resource: SupportedResource): resource is StatefulSet => resource.kind === "StatefulSet";

export const isSupportedResource = (resource: any): resource is SupportedResource => {
  return resource && ["Pod", "Deployment", "StatefulSet"].includes(resource.kind);
};

// Resource type mapping from Kubernetes kind to CLI resource type
export const RESOURCE_TYPE_MAP: Record<string, ResourceType> = {
  Pod: ResourceType.POD,
  Deployment: ResourceType.DEPLOYMENT,
  StatefulSet: ResourceType.STATEFULSET,
};

// Default form values
export const DEFAULT_FORM_DATA: Omit<DuplicateResourceFormData, "resourceType" | "resourceName" | "namespace"> = {
  kubeconfig: "",
  context: "",
  newResourceName: "",
  namePrefix: "",
  nameSuffix: "-duplicate",
  commandOverride: "",
  openShell: false,
  isSubmitting: false,
  validationErrors: {},
};

// Supported API versions for each resource type
export const SUPPORTED_API_VERSIONS: Record<ResourceType, string[]> = {
  [ResourceType.POD]: ["v1"],
  [ResourceType.DEPLOYMENT]: ["apps/v1"],
  [ResourceType.STATEFULSET]: ["apps/v1"],
};

// Command templates for duplik8s (uses CLI resource types: pod, deploy, statefulset)
export const COMMAND_TEMPLATES = {
  base: "kubectl duplicate",
  withNamespace: "kubectl duplicate {resourceType} {resourceName} -n {namespace}",
  withKubeconfig: "kubectl duplicate {resourceType} {resourceName} --kubeconfig {kubeconfig}",
  withContext: "kubectl duplicate {resourceType} {resourceName} --context {context}",
  withCommandOverride: "kubectl duplicate {resourceType} {resourceName} --command-override {commands}",
  withArgsOverride: "kubectl duplicate {resourceType} {resourceName} --args-override {args}",
  full: "kubectl duplicate {resourceType} {resourceName} -n {namespace} --kubeconfig {kubeconfig} --context {context} --command-override {commands} --args-override {args}",
} as const;
