import type { Capability, RenderMode } from "@/types";

export function resolveRenderMode(
  cap: Capability,
  surfaceSupports3D: boolean,
): RenderMode {
  if (!cap.webglAvailable || !surfaceSupports3D) {
    return "2d-fallback";
  }

  if (cap.reducedMotion) {
    return "2d-fallback";
  }

  if (cap.deviceTier === "low") {
    return "3d-reduced";
  }

  return "3d-full";
}
