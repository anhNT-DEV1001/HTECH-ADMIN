"use client";

import { X } from "lucide-react";
import Draggable from "react-draggable";
import { ReactNode, useRef } from "react";

interface ModalProps {
  open: boolean;
  title?: string;
  onClose: () => void;
  children?: ReactNode;
  footer?: ReactNode;
  width?: string;
}

export default function Modal({
  open,
  title,
  onClose,
  children,
  footer,
  width = "max-w-lg",
}: ModalProps) {
  const nodeRef = useRef<HTMLDivElement>(null);

  if (!open) return null;

  return (
    <div className="modal" onClick={onClose}>
      <Draggable handle=".modal-header" nodeRef={nodeRef}>
        <div
          ref={nodeRef}
          className={`modal-content ${width} absolute`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="modal-header cursor-move select-none">
            <h3 className="modal-title">{title}</h3>
            <button className="modal-close" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="modal-body">{children}</div>

          {/* Footer */}
          {footer && <div className="modal-footer">{footer}</div>}
        </div>
      </Draggable>
    </div>
  );
}
