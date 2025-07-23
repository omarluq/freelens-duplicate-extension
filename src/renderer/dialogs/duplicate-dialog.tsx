import { Renderer } from "@freelensapp/extensions";
import { Component } from "react";
import { IPCService } from "../services/ipc-service";
import { RESOURCE_TYPE_MAP } from "../types/duplik8s-types";
import styles from "./duplicate-dialog.module.scss";
import stylesInline from "./duplicate-dialog.module.scss?inline";

const {
  Component: { Dialog, Button, Input, Notifications },
} = Renderer;

// Kubernetes resource types
type Pod = Renderer.K8sApi.Pod;
type Deployment = Renderer.K8sApi.Deployment;
type StatefulSet = Renderer.K8sApi.StatefulSet;
export type SupportedResource = Pod | Deployment | StatefulSet;

interface Props {
  resource?: SupportedResource;
  isOpen: boolean;
  onClose: () => void;
}

interface State {
  commandOverride: string;
  argsOverride: string;
}

export class DuplicateDialog extends Component<Props, State> {
  private ipcService = new IPCService();

  constructor(props: Props) {
    super(props);
    this.state = {
      commandOverride: "",
      argsOverride: "",
    };
  }

  componentDidUpdate(prevProps: Props) {
    // Reset when dialog closes
    if (!this.props.isOpen && prevProps.isOpen) {
      this.setState({
        commandOverride: "",
        argsOverride: "",
      });
    }
  }

  onCommandOverrideChange = (value: string) => {
    this.setState({ commandOverride: value });
  };

  onArgsOverrideChange = (value: string) => {
    this.setState({ argsOverride: value });
  };

  onSubmit = async () => {
    const { resource } = this.props;
    if (!resource) return;

    const { commandOverride, argsOverride } = this.state;

    try {
      // Build the command execution request based on actual duplik8s CLI
      const commandRequest = {
        resourceType: RESOURCE_TYPE_MAP[resource.kind], // Map Kubernetes kind to CLI resource type
        resourceName: resource.getName(),
        namespace: resource.getNs() || "default",
        commandOverride: commandOverride,
        argsOverride: argsOverride,
        openShell: false, // Always false now that we removed the option
      };

      console.log("Executing duplik8s command with request:", commandRequest);

      // Execute the command through IPC
      const result = await this.ipcService.executeCommand(commandRequest, (progress) => {
        console.log("Command progress:", progress);
        // TODO: Show progress in UI
      });

      console.log("Command execution result:", result);

      if (result.success) {
        // Show success notification
        Notifications.ok("Resource duplicated successfully");
        this.props.onClose();
      } else {
        // Show error notification
        Notifications.error(`Duplication failed: ${result.error || "Unknown error occurred"}`);
      }
    } catch (error) {
      console.error("Failed to execute duplicate command:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      Notifications.error(`Command execution failed: ${errorMessage}`);
    }
  };

  render() {
    const { isOpen, resource, onClose } = this.props;
    const { commandOverride, argsOverride } = this.state;

    return (
      <>
        <style>{stylesInline}</style>
        <Dialog isOpen={isOpen} className={styles.duplicateDialog} onClose={onClose} close={onClose}>
          {resource && (
            <>
              <div className={styles.dialogContent}>
                <h2>Duplicate {resource.kind}</h2>

                <div className={styles.resourceInfo}>
                  <p>
                    <strong>Original Resource:</strong> {resource.getName()} ({resource.kind})
                  </p>
                  <p>
                    <strong>Duplicate Resource:</strong> {`${resource.getName()}-duplik8ted`} ({resource.kind})
                  </p>
                  <p>
                    <strong>Namespace:</strong> {resource.getNs()}
                  </p>
                </div>

                <div className={styles.formGroup}>
                  <label>Command Override:</label>
                  <Input value={commandOverride} onChange={this.onCommandOverrideChange} placeholder="/bin/sh" />
                </div>

                <div className={styles.formGroup}>
                  <label>Args Override:</label>
                  <Input
                    value={argsOverride}
                    onChange={this.onArgsOverrideChange}
                    placeholder="-c,trap 'exit 0' INT TERM KILL; while true; do sleep 1; done"
                  />
                </div>
              </div>

              <div className={styles.dialogButtons}>
                <Button plain className="cancel" onClick={onClose}>
                  Cancel
                </Button>
                <Button primary className="ok" onClick={this.onSubmit}>
                  Duplicate
                </Button>
              </div>
            </>
          )}
        </Dialog>
      </>
    );
  }
}
