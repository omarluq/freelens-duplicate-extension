import { Common } from "@freelensapp/extensions";

export interface PodDuplicatePreferences {
  enabled: boolean;
  kubectlPath?: string;
}

export class PodDuplicatePreferencesStore extends Common.Store.ExtensionStore<PodDuplicatePreferences> {
  constructor() {
    super({
      configName: "pod-duplicate-preferences",
      defaults: {
        enabled: true,
        kubectlPath: "kubectl",
      },
    });
  }

  fromStore(data: PodDuplicatePreferences): PodDuplicatePreferences {
    return {
      enabled: data.enabled ?? true,
      kubectlPath: data.kubectlPath ?? "kubectl",
    };
  }

  toJSON(): PodDuplicatePreferences {
    return {
      enabled: this.enabled,
      kubectlPath: this.kubectlPath,
    };
  }

  get enabled(): boolean {
    return this.enabled;
  }

  set enabled(value: boolean) {
    this.enabled = value;
  }

  get kubectlPath(): string {
    return this.kubectlPath || "kubectl";
  }

  set kubectlPath(value: string) {
    this.kubectlPath = value;
  }
}
