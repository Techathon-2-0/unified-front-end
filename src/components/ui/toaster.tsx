
"use client";

import { Button } from "@/components/ui/button";
import { CircleCheck, X } from "lucide-react";
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "./toast";
import { useProgressTimer } from "@/hooks/use-progress-timer";

interface MasteredToastProps {
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

export interface MasteredToastRef {
  showToast: (title: string, description: string) => void;
}

const MasteredToast = forwardRef<MasteredToastRef, MasteredToastProps>(
  ({ undo, position }, ref) => {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const toastDuration = 5000;

    const { progress, start, pause, resume, reset } = useProgressTimer({
      duration: toastDuration,
      onComplete: () => setOpen(false),
    });

    const convert = useMemo(() => {
      if (!position) return;
      else if (position.includes("right")) return "right";
      else if (position.includes("left")) return "left";
      else if (position.includes("top")) return "top";
      else return "bottom";
    }, [position]);

    const handleOpenChange = useCallback(
      (isOpen: boolean) => {
        setOpen(isOpen);
        if (isOpen) {
          reset();
          start();
        }
      },
      [reset, start]
    );

    const showToast = useCallback(
      (toastTitle: string, toastDescription: string) => {
        setTitle(toastTitle);
        setDescription(toastDescription);
        if (open) {
          setOpen(false);
          window.setTimeout(() => {
            handleOpenChange(true);
          }, 150);
        } else {
          handleOpenChange(true);
        }
      },
      [open, handleOpenChange]
    );

    useImperativeHandle(ref, () => ({
      showToast,
    }));

    return (
      <ToastProvider>
        <Toast
          open={open}
          onOpenChange={handleOpenChange}
          onMouseEnter={pause}
          onMouseLeave={resume}
          position={convert}
        >
          <div className="flex w-full justify-between gap-3">
            <CircleCheck
              className="mt-0.5 shrink-0 text-emerald-500"
              size={16}
              strokeWidth={2}
              aria-hidden="true"
            />
            <div className="flex grow flex-col gap-3">
              <div className="space-y-1">
                <ToastTitle>{title}</ToastTitle>
                <ToastDescription>{description}</ToastDescription>
              </div>
              {undo && (
                <div>
                  <ToastAction altText="Undo changes" asChild>
                    <Button size="sm" className="text-primary font-semibold">
                      Undo changes
                    </Button>
                  </ToastAction>
                </div>
              )}
            </div>
            <ToastClose asChild>
              <Button
                variant="ghost"
                className="group -my-1.5 -me-2 size-8 shrink-0 p-0 hover:bg-transparent"
                aria-label="Close notification"
              >
                <X
                  size={16}
                  strokeWidth={2}
                  className="opacity-60 transition-opacity group-hover:opacity-100"
                  aria-hidden="true"
                />
              </Button>
            </ToastClose>
          </div>
          <div className="contents" aria-hidden="true">
            <div
              className="pointer-events-none absolute bottom-0 left-0 h-1 w-full bg-emerald-500"
              style={{
                width: `${(progress / toastDuration) * 100}%`,
                transition: "width 100ms linear",
              }}
            />
          </div>
        </Toast>
        <ToastViewport position={position} />
      </ToastProvider>
    );
  }
);

MasteredToast.displayName = "MasteredToast";

export default MasteredToast;

