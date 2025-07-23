import { Renderer } from "@freelensapp/extensions";
import { PodDuplicatePreferencesStore } from "../common/store/duplicate-preferences-store";
import { PodDuplicateMenuItem, type PodDuplicateMenuItemProps } from "./menus";
import { PodDuplicatePreferenceHint, PodDuplicatePreferenceInput } from "./preferences";

export default class PodDuplicateRenderer extends Renderer.LensExtension {
  async onActivate() {
    console.log("pod-duplicate renderer | activating...");
    await PodDuplicatePreferencesStore.getInstanceOrCreate().loadExtension(this);
    console.log("pod-duplicate renderer | activated");
  }

  onDeactivate() {
    console.log("pod-duplicate renderer | deactivated");
  }

  appPreferences = [
    {
      title: "Pod Duplicate Preferences",
      components: {
        Input: () => <PodDuplicatePreferenceInput />,
        Hint: () => <PodDuplicatePreferenceHint />,
      },
    },
  ];

  kubeObjectMenuItems = [
    {
      kind: "Pod",
      apiVersions: ["v1"],
      components: {
        MenuItem: (props: PodDuplicateMenuItemProps) => <PodDuplicateMenuItem {...props} extension={this} />,
      },
    },
  ];
}
