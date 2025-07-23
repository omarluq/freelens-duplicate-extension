import { Renderer } from "@freelensapp/extensions";
import { duplicateDialogState, type SupportedResource } from "../dialogs";
import { DuplicateIcon } from "../icons";

const {
  Component: { MenuItem },
} = Renderer;

export interface DuplicateMenuItemProps<T extends SupportedResource> extends Renderer.Component.KubeObjectMenuProps<T> {
  extension: Renderer.LensExtension;
}

// Resource configuration
export const RESOURCE_CONFIG = {
  Pod: { label: "Pod", apiVersion: "v1" },
  Deployment: { label: "Deployment", apiVersion: "apps/v1" },
  StatefulSet: { label: "StatefulSet", apiVersion: "apps/v1" },
} as const;

export type ResourceKind = keyof typeof RESOURCE_CONFIG;

// Main menu item component
export const DuplicateMenuItem = <T extends SupportedResource>(props: DuplicateMenuItemProps<T>) => {
  const { object, toolbar } = props;

  if (!object) return null;

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    duplicateDialogState.open(object);
  };

  return (
    <MenuItem onClick={handleClick}>
      <DuplicateIcon interactive={toolbar} />
      <span className="title">{`Duplicate ${object.kind}`}</span>
    </MenuItem>
  );
};

// Resource type definitions
type Pod = Renderer.K8sApi.Pod;
type Deployment = Renderer.K8sApi.Deployment;
type StatefulSet = Renderer.K8sApi.StatefulSet;

// Type-specific exports for menu registration
export const PodDuplicateMenuItem = (props: DuplicateMenuItemProps<Pod>) => <DuplicateMenuItem {...props} />;

export const DeploymentDuplicateMenuItem = (props: DuplicateMenuItemProps<Deployment>) => (
  <DuplicateMenuItem {...props} />
);

export const StatefulSetDuplicateMenuItem = (props: DuplicateMenuItemProps<StatefulSet>) => (
  <DuplicateMenuItem {...props} />
);
