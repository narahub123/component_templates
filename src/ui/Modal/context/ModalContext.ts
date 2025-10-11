import { createContext, useContext } from "react";
import type { ModalContextValue } from "../types";

export const ModalContext = createContext<ModalContextValue | null>(null);

export const useModalContext = (component: string): ModalContextValue => {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error(`${component} must be used within a <Modal>`);
  }

  return context;
};
