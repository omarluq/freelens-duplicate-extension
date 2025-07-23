import { Renderer } from "@freelensapp/extensions";
import { action } from "mobx";
import { observer } from "mobx-react";
import React from "react";

const {
  Component: { Button, Notifications },
} = Renderer;

type Pod = Renderer.K8sApi.Pod;

interface DuplicatePodDialogState {
  newPodName: string;
  namespace: string;
  commandOverride: string;
  openShell: boolean;
  isSubmitting: boolean;
}

@observer
class DuplicatePodDialogComponent extends React.Component<{ pod: Pod }, DuplicatePodDialogState> {
  constructor(props: { pod: Pod }) {
    super(props);

    this.state = {
      newPodName: `${props.pod.getName()}-duplicate`,
      namespace: props.pod.getNs(),
      commandOverride: "",
      openShell: false,
      isSubmitting: false,
    };
  }

  static dialogInstance: DuplicatePodDialogComponent | null = null;

  static open(pod: Pod) {
    // Create a simple modal-like behavior
    const dialogElement = document.createElement("div");
    dialogElement.id = "pod-duplicate-dialog-root";
    document.body.appendChild(dialogElement);

    // You might need to use React.render or similar depending on your setup
    // This is a simplified approach - you may need to adjust based on Freelens' dialog system
    console.log("Opening duplicate dialog for pod:", pod.getName());

    // For now, let's use a simpler approach with direct component rendering
    const dialog = new DuplicatePodDialogComponent({ pod });
    DuplicatePodDialogComponent.dialogInstance = dialog;

    // Show success message for now (since we can't easily create modal without proper dialog system)
    Notifications.ok(
      `Would duplicate pod: ${pod.getName()}. Dialog implementation needs adjustment for your Freelens version.`,
    );
  }

  static close() {
    const dialogElement = document.getElementById("pod-duplicate-dialog-root");
    if (dialogElement) {
      document.body.removeChild(dialogElement);
    }
    DuplicatePodDialogComponent.dialogInstance = null;
  }

  @action
  private handleSubmit = async () => {
    const { pod } = this.props;
    const { namespace, commandOverride, openShell } = this.state;

    this.setState({ isSubmitting: true });

    try {
      // Build the kubectl duplicate command
      const args = ["duplicate", "pod", pod.getName(), "-n", namespace];

      // Add optional flags
      if (commandOverride.trim()) {
        const commands = commandOverride.split(",").map((cmd) => cmd.trim());
        args.push("--command-override", commands.join(","));
      }

      if (openShell) {
        args.push("--shell");
      }

      console.log("Executing kubectl command:", "kubectl", args.join(" "));

      // For now, we'll simulate the command execution
      // You may need to use a different method to execute shell commands in Freelens
      const command = `kubectl ${args.join(" ")}`;

      // Show the command that would be executed
      Notifications.ok(`Execute this command: ${command}`);

      console.log("Would execute:", command);

      // Show success notification
      Notifications.ok(`Ready to duplicate pod: ${pod.getName()}`);

      // Close the dialog
      DuplicatePodDialogComponent.close();
    } catch (error) {
      console.error("Error preparing duplicate command:", error);

      // Show error notification
      Notifications.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      this.setState({ isSubmitting: false });
    }
  };

  @action
  private handleCancel = () => {
    DuplicatePodDialogComponent.close();
  };

  render() {
    const { pod } = this.props;
    const { newPodName, namespace, commandOverride, openShell, isSubmitting } = this.state;

    return (
      <div className="duplicate-pod-dialog">
        <div className="dialog-content">
          <h3>Duplicate Pod: {pod.getName()}</h3>

          <div className="pod-info">
            <h4>Source Pod Information:</h4>
            <div className="info-grid">
              <div>
                <strong>Name:</strong> {pod.getName()}
              </div>
              <div>
                <strong>Namespace:</strong> {pod.getNs()}
              </div>
              <div>
                <strong>Node:</strong> {pod.getNodeName()}
              </div>
              <div>
                <strong>Status:</strong> {pod.getStatus()}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h4>Duplication Options:</h4>

            <div className="form-group">
              <label htmlFor="newPodName">New Pod Name (optional):</label>
              <input
                id="newPodName"
                type="text"
                value={newPodName}
                onChange={(e) => this.setState({ newPodName: e.target.value })}
                placeholder="Auto-generated if empty"
              />
            </div>

            <div className="form-group">
              <label htmlFor="namespace">Target Namespace:</label>
              <input
                id="namespace"
                type="text"
                value={namespace}
                onChange={(e) => this.setState({ namespace: e.target.value })}
                placeholder="kubernetes namespace"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="commandOverride">Command Override (optional):</label>
              <textarea
                id="commandOverride"
                value={commandOverride}
                onChange={(e) => this.setState({ commandOverride: e.target.value })}
                placeholder='e.g., "/bin/sh","-c","sleep 3600"'
                rows={3}
              />
            </div>

            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={openShell}
                  onChange={(e) => this.setState({ openShell: e.target.checked })}
                />
                Open shell in duplicated pod after creation
              </label>
            </div>
          </div>

          <div className="dialog-buttons">
            <Button plain label="Cancel" onClick={this.handleCancel} disabled={isSubmitting} />
            <Button
              accent
              label={isSubmitting ? "Preparing..." : "Prepare Duplicate"}
              onClick={this.handleSubmit}
              disabled={isSubmitting || !namespace.trim()}
            />
          </div>
        </div>

        <style>{`
          .duplicate-pod-dialog {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
          }
          
          .dialog-content {
            background: var(--colorTerminalBackground);
            padding: 20px;
            border-radius: 8px;
            min-width: 500px;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
          }
          
          .pod-info {
            background: var(--colorTerminalBackground);
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 20px;
            border-left: 3px solid var(--colorOk);
          }
          
          .pod-info h4 {
            margin: 0 0 10px 0;
            color: var(--textColorPrimary);
            font-size: 14px;
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            font-size: 12px;
            color: var(--textColorSecondary);
          }
          
          .form-section h4 {
            margin: 0 0 15px 0;
            color: var(--textColorPrimary);
            font-size: 14px;
          }
          
          .form-group {
            margin-bottom: 15px;
          }
          
          .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: 500;
            color: var(--textColorPrimary);
            font-size: 13px;
          }
          
          .form-group input,
          .form-group textarea {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid var(--borderColor);
            border-radius: 4px;
            background: var(--colorTerminalBackground);
            color: var(--textColorPrimary);
            font-family: inherit;
            font-size: 13px;
          }
          
          .checkbox-group label {
            display: flex;
            align-items: center;
            font-size: 13px;
            color: var(--textColorPrimary);
            cursor: pointer;
          }
          
          .checkbox-group input {
            margin-right: 8px;
            width: auto;
          }
          
          .dialog-buttons {
            display: flex;
            gap: 10px;
            justify-content: flex-end;
            margin-top: 20px;
          }
        `}</style>
      </div>
    );
  }
}

export const DuplicatePodDialog = {
  open: (pod: Pod) => DuplicatePodDialogComponent.open(pod),
  close: () => DuplicatePodDialogComponent.close(),
};
