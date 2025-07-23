import { Main } from "@freelensapp/extensions";

/**
 * Main process extension for Pod Duplicate functionality
 */
export default class PodDuplicateMain extends Main.LensExtension {
  async onActivate() {
    console.log("pod-duplicate main | activating...");
    console.log("pod-duplicate main | activated");
  }

  onDeactivate() {
    console.log("pod-duplicate main | deactivated");
  }
}
