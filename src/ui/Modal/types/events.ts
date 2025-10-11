export type ModalOpenChangeReason =
  | "escape"
  | "outside"
  | "trigger"
  | "programmatic"
  | "submit"
  | "close-button";

export type ModalOpenChangeMeta = {
  reason: ModalOpenChangeReason;
  nativeEvent?: Event;
};

export type ModalOpenChangeMetaInput = {
  reason?: ModalOpenChangeReason;
  nativeEvent?: Event;
};

export type ModalOpenChangeHandler = (
  open: boolean,
  meta: ModalOpenChangeMeta
) => void;

export type ModalImperativeHandle = {
  open: (meta?: ModalOpenChangeMetaInput) => void;
  close: (meta?: ModalOpenChangeMetaInput) => void;
  toggle: (meta?: ModalOpenChangeMetaInput) => void;
  focusFirst: () => void;
};
