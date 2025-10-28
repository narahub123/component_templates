import type { ForwardRefExoticComponent, RefAttributes } from "react";
import {
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  ModalHeader,
  ModalRoot,
} from "./components";
import type { ModalProps } from "./components/ModalRoot";
import type { ModalImperativeHandle } from "./types";

type ModalComponent = ForwardRefExoticComponent<
  ModalProps & RefAttributes<ModalImperativeHandle>
> & {
  Header: typeof ModalHeader;
  Body: typeof ModalBody;
  Footer: typeof ModalFooter;
  CloseButton: typeof ModalCloseButton;
};

export const Modal = ModalRoot as ModalComponent;
Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;
Modal.CloseButton = ModalCloseButton;

export type { ModalProps };
export type {
  ModalImperativeHandle,
  ModalOpenChangeHandler,
  ModalOpenChangeMeta,
  ModalOpenChangeMetaInput,
  ModalOpenChangeReason,
  ModalHistoryOptions,
  ResolvedModalHistoryOptions,
  ModalMobileBehavior,
} from "./types";

export * from "./context";
