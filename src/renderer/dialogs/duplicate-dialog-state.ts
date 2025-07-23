import { SupportedResource } from "./duplicate-dialog";

class DuplicateDialogState {
  private _isOpen = false;
  private _resource?: SupportedResource;
  private _listeners: Array<() => void> = [];

  get isOpen() {
    return this._isOpen;
  }

  get resource() {
    return this._resource;
  }

  open(resource: SupportedResource) {
    this._isOpen = true;
    this._resource = resource;
    this.notifyListeners();
  }

  close() {
    this._isOpen = false;
    this._resource = undefined;
    this.notifyListeners();
  }

  addListener(listener: () => void) {
    this._listeners.push(listener);
  }

  removeListener(listener: () => void) {
    const index = this._listeners.indexOf(listener);
    if (index > -1) {
      this._listeners.splice(index, 1);
    }
  }

  private notifyListeners() {
    this._listeners.forEach((listener) => listener());
  }
}

// Global instance
export const duplicateDialogState = new DuplicateDialogState();
