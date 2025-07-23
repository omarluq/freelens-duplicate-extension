import { Renderer } from "@freelensapp/extensions";
import { DuplicatePodDialog } from "../dialogs/duplicate-pod-dialog";
import { DuplicateIcon } from "../icons";
import { withErrorPage } from "../pages/error-page";

const {
  Component: { MenuItem },
} = Renderer;

type Pod = Renderer.K8sApi.Pod;

export interface PodDuplicateMenuItemProps extends Renderer.Component.KubeObjectMenuProps<Pod> {
  extension: Renderer.LensExtension;
}

export const PodDuplicateMenuItem = (props: PodDuplicateMenuItemProps) =>
  withErrorPage(props, () => {
    const { object, toolbar } = props;

    if (!object) return <></>;

    const handleDuplicateClick = () => {
      console.log("Duplicate pod clicked:", object.getName());
      DuplicatePodDialog.open(object);
    };

    return (
      <MenuItem onClick={handleDuplicateClick}>
        <DuplicateIcon interactive={toolbar} title="Duplicate Pod" />
        <span className="title">Duplicate Pod</span>
      </MenuItem>
    );
  });
