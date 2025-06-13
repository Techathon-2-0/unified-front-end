import { useRef, useCallback } from "react";
import MasteredToast from "../components/ui/toast-mastered";
import type { MasteredToastRef } from "../components/ui/toast-mastered";

interface UseToastOptions {
  undo?: boolean;
  position?:
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left"
    | "top"
    | "bottom"
    | null
    | undefined;
}

export function useToast(options: UseToastOptions) {
  const toastRef = useRef<MasteredToastRef | null>(null);

  const showSuccessToast = useCallback(
    (title: string, description: string) => {
      toastRef.current?.showToast(title, description, "success");
    },
    []
  );

  const showErrorToast = useCallback(
    (title: string, description: string) => {
      toastRef.current?.showToast(title, description, "error");
    },
    []
  );

  const Toaster = (
    <MasteredToast
      ref={toastRef as React.RefObject<MasteredToastRef>}
      undo={options.undo}
      position={options.position}
    />
  );

  return { showSuccessToast, showErrorToast, Toaster };
}
