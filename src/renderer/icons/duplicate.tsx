import { Renderer } from "@freelensapp/extensions";
import svgIcon from "./duplicate.svg?raw";

const {
  Component: { Icon },
} = Renderer;

export function DuplicateIcon(props: Renderer.Component.IconProps) {
  return <Icon {...props} svg={svgIcon} />;
}
