import type { MutableRefObject } from "react";
import type { ModalOpenChangeMetaInput } from "./events";

export type ModalContextValue = {
  close: (meta?: ModalOpenChangeMetaInput) => void;
  registerLabel: (id: string | null) => void;
  registerDescription: (id: string | null) => void;
  titleId: string;
  descriptionId: string;
  contentRef: MutableRefObject<HTMLDivElement | null>;
};
