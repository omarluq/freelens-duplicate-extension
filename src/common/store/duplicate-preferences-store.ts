import { Common } from "@freelensapp/extensions";
import { action, makeObservable, observable } from "mobx";

export interface PodDuplicatePreferences {
  enabled: boolean;
  kubectlPath?: string;
}

export class PodDuplicatePreferencesStore extends Common.Store.ExtensionStore<PodDuplicatePreferences> {
  // Internal observable state - these will be managed by MobX
  @observable private _enabled: boolean = true;
  @observable private _kubectlPath: string = "kubectl";

  constructor() {
    super({
      configName: "pod-duplicate-preferences",
      defaults: {
        enabled: true,
        kubectlPath: "kubectl",
      },
    });

    // MobX will automatically handle observables marked with decorators
    // We only need to specify actions in makeObservable for MobX 6
    makeObservable(this, {
      setEnabled: action,
      setKubectlPath: action,
    });
  }

  // fromStore is called when data is loaded from persistent storage
  fromStore(data: Partial<PodDuplicatePreferences>): void {
    this._enabled = data.enabled ?? true;
    this._kubectlPath = data.kubectlPath ?? "kubectl";
  }

  // toJSON is called when data needs to be persisted to storage
  toJSON(): PodDuplicatePreferences {
    return {
      enabled: this._enabled,
      kubectlPath: this._kubectlPath,
    };
  }

  // Public getters that access internal state without recursion
  get enabled(): boolean {
    return this._enabled;
  }

  get kubectlPath(): string {
    return this._kubectlPath;
  }

  // MobX actions for updating the store
  @action
  setEnabled(value: boolean): void {
    this._enabled = value;
    // The ExtensionStore base class will handle persistence automatically
  }

  @action
  setKubectlPath(value: string): void {
    this._kubectlPath = value;
    // The ExtensionStore base class will handle persistence automatically
  }

  // Convenience setters for backward compatibility
  set enabled(value: boolean) {
    this.setEnabled(value);
  }

  set kubectlPath(value: string) {
    this.setKubectlPath(value);
  }
}
