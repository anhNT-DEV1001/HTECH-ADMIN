"use client";

import { useRef, ReactNode } from "react";
import Draggable from "react-draggable";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface DraggableModalProps {
  open: boolean;
  title?: string;
  onClose: () => void;
  children?: ReactNode;
  footer?: ReactNode;
  width?: string;
}

export function DraggableModal({
  open,
  title,
  onClose,
  children,
  footer,
  width = "max-w-lg",
}: DraggableModalProps) {
  const nodeRef = useRef<HTMLDivElement>(null);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        className="border-none bg-transparent shadow-none p-0 max-w-none flex justify-center [&>button]:hidden"
      >
        <Draggable handle=".drag-handle" nodeRef={nodeRef}>
          <div
            ref={nodeRef}
            className={cn(
              "bg-background border rounded-lg shadow-lg flex flex-col pointer-events-auto",
              width
            )}
          >
            {/* Header: Đóng vai trò là tay cầm kéo thả (drag-handle) */}
            <DialogHeader className="drag-handle cursor-move flex flex-row items-center justify-between p-4 border-b space-y-0 select-none">
              <DialogTitle className="text-lg font-semibold">
                {title}
              </DialogTitle>
              <DialogDescription className="sr-only">
                {title} modal
              </DialogDescription>

              {/* Nút Close custom đưa vào trong để di chuyển cùng Modal */}
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Đóng</span>
              </Button>
            </DialogHeader>

            {/* Body */}
            <div className="p-4">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <DialogFooter className="p-4 border-t bg-muted/20">
                {footer}
              </DialogFooter>
            )}
          </div>
        </Draggable>
      </DialogContent>
    </Dialog>
  );
}