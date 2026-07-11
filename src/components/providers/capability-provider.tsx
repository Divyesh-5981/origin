"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { resolveRenderMode } from "@/lib/core/render-mode";
import type { Capability, RenderMode } from "@/types";

const MIN_HIGH_TIER_CORES = 4;
const MIN_HIGH_TIER_MEMORY_GB = 4;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const CONSERVATIVE_DEFAULT: Capability = {
  webglAvailable: false,
  reducedMotion: false,
  deviceTier: "low",
};

interface DeviceMemoryNavigator extends Navigator {
  deviceMemory?: number;
}

const CapabilityContext = createContext<Capability | null>(null);

function detectWebglAvailable(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const context =
      canvas.getContext("webgl2") ??
      canvas.getContext("webgl") ??
      canvas.getContext("experimental-webgl");
    return context !== null;
  } catch {
    return false;
  }
}

function detectDeviceTier(): Capability["deviceTier"] {
  const cores = navigator.hardwareConcurrency;
  const memory = (navigator as DeviceMemoryNavigator).deviceMemory;

  if (typeof cores === "number" && cores < MIN_HIGH_TIER_CORES) {
    return "low";
  }

  if (typeof memory === "number" && memory < MIN_HIGH_TIER_MEMORY_GB) {
    return "low";
  }

  return "high";
}

interface CapabilityProviderProps {
  children: ReactNode;
}

export function CapabilityProvider({ children }: CapabilityProviderProps) {
  const [capability, setCapability] = useState<Capability>(
    CONSERVATIVE_DEFAULT,
  );

  useEffect(() => {
    const motionQuery = window.matchMedia(REDUCED_MOTION_QUERY);
    const webglAvailable = detectWebglAvailable();
    const deviceTier = detectDeviceTier();

    const applyCapability = (reducedMotion: boolean) => {
      setCapability({ webglAvailable, reducedMotion, deviceTier });
    };

    applyCapability(motionQuery.matches);

    const handleMotionChange = (event: MediaQueryListEvent) => {
      applyCapability(event.matches);
    };

    motionQuery.addEventListener("change", handleMotionChange);
    return () => {
      motionQuery.removeEventListener("change", handleMotionChange);
    };
  }, []);

  return (
    <CapabilityContext.Provider value={capability}>
      {children}
    </CapabilityContext.Provider>
  );
}

export function useCapability(): Capability {
  const capability = useContext(CapabilityContext);
  if (capability === null) {
    throw new Error("useCapability must be used within a CapabilityProvider");
  }
  return capability;
}

export function useRenderMode(surfaceSupports3D: boolean): RenderMode {
  const capability = useCapability();
  return resolveRenderMode(capability, surfaceSupports3D);
}
