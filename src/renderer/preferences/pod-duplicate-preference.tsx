import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { PodDuplicatePreferencesStore } from "../../common/store";

const {
  Component: { Checkbox, Input },
} = Renderer;

export const PodDuplicatePreferenceInput = observer(() => {
  const preferences = PodDuplicatePreferencesStore.getInstance<PodDuplicatePreferencesStore>();

  return (
    <div>
      <Checkbox
        label="Enable Pod Duplicate functionality"
        value={preferences.enabled}
        onChange={(value) => (preferences.enabled = value)}
      />
      <Input
        theme="round-black"
        value={preferences.kubectlPath}
        onChange={(value) => (preferences.kubectlPath = value)}
        placeholder="kubectl"
      />
    </div>
  );
});

export const PodDuplicatePreferenceHint = () => (
  <span>
    Configure Pod Duplicate extension settings. The kubectl path should point to your kubectl binary with the duplicate
    plugin installed (kubectl krew install duplicate).
  </span>
);
