import { Component } from "react";
import { DuplicateDialog } from "./duplicate-dialog";
import { duplicateDialogState } from "./duplicate-dialog-state";

interface State {
  isOpen: boolean;
  resource?: any;
}

export class DuplicateDialogProvider extends Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = {
      isOpen: duplicateDialogState.isOpen,
      resource: duplicateDialogState.resource,
    };
  }

  componentDidMount() {
    duplicateDialogState.addListener(this.handleStateChange);
  }

  componentWillUnmount() {
    duplicateDialogState.removeListener(this.handleStateChange);
  }

  handleStateChange = () => {
    this.setState({
      isOpen: duplicateDialogState.isOpen,
      resource: duplicateDialogState.resource,
    });
  };

  handleClose = () => {
    duplicateDialogState.close();
  };

  render() {
    return <DuplicateDialog isOpen={this.state.isOpen} resource={this.state.resource} onClose={this.handleClose} />;
  }
}
