import { Renderer } from "@freelensapp/extensions";
import { computed } from "mobx";
import { PodDuplicatePreferencesStore } from "../common/store/duplicate-preferences-store";
import { DuplicateDialogProvider } from "./dialogs";
import {
  DeploymentDuplicateMenuItem,
  type DuplicateMenuItemProps,
  PodDuplicateMenuItem,
  RESOURCE_CONFIG,
  StatefulSetDuplicateMenuItem,
} from "./menus";
import { PodDuplicatePreferenceHint, PodDuplicatePreferenceInput } from "./preferences";

// Resource type definitions
type Pod = Renderer.K8sApi.Pod;
type Deployment = Renderer.K8sApi.Deployment;
type StatefulSet = Renderer.K8sApi.StatefulSet;

export default class DuplikExtensionRenderer extends Renderer.LensExtension {
  async onActivate() {
    await PodDuplicatePreferencesStore.getInstanceOrCreate().loadExtension(this);
  }

  onDeactivate() {
    // Extension cleanup if needed
  }

  // Global dialog provider - mounted as cluster frame component
  clusterFrameComponents = [
    {
      id: "duplicate-dialog-provider",
      Component: DuplicateDialogProvider,
      shouldRender: computed(() => true),
    },
  ];

  // Preferences
  appPreferences = [
    {
      title: "Duplik8s Preferences",
      components: {
        Input: () => <PodDuplicatePreferenceInput />,
        Hint: () => <PodDuplicatePreferenceHint />,
      },
    },
  ];

  // Menu items for each resource type
  kubeObjectMenuItems = [
    {
      kind: "Pod",
      apiVersions: [RESOURCE_CONFIG.Pod.apiVersion],
      components: {
        MenuItem: (props: DuplicateMenuItemProps<Pod>) => <PodDuplicateMenuItem {...props} extension={this} />,
      },
    },
    {
      kind: "Deployment",
      apiVersions: [RESOURCE_CONFIG.Deployment.apiVersion],
      components: {
        MenuItem: (props: DuplicateMenuItemProps<Deployment>) => (
          <DeploymentDuplicateMenuItem {...props} extension={this} />
        ),
      },
    },
    {
      kind: "StatefulSet",
      apiVersions: [RESOURCE_CONFIG.StatefulSet.apiVersion],
      components: {
        MenuItem: (props: DuplicateMenuItemProps<StatefulSet>) => (
          <StatefulSetDuplicateMenuItem {...props} extension={this} />
        ),
      },
    },
  ];
}
