import { useCallback } from "react";
import type { KeyboardEvent } from "react";
import type { ModalOpenChangeReason } from "../types";

const ESCAPE_REASON: ModalOpenChangeReason = "escape";

type UseModalKeyboardOptions = {
  closeOnEsc: boolean;
  requestClose: (meta: { reason: ModalOpenChangeReason; nativeEvent?: Event }) => void;
  trapFocus?: (event: KeyboardEvent<HTMLDivElement>) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void;
};

const useModalKeyboard = ({
  closeOnEsc,
  requestClose,
  trapFocus,
  onKeyDown,
}: UseModalKeyboardOptions) =>
  useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) {
        return;
      }

      if (event.key === "Escape" && closeOnEsc) {
        const nativeEvent = event.nativeEvent as {
          isComposing?: boolean;
          keyCode?: number;
        };
        const composing =
          (event as unknown as { isComposing?: boolean }).isComposing ||
          nativeEvent?.isComposing ||
          nativeEvent?.keyCode === 229;

        if (composing) {
          return;
        }

        event.stopPropagation();
        requestClose({ reason: ESCAPE_REASON, nativeEvent: event.nativeEvent });
        return;
      }

      if (event.key === "Tab" && trapFocus) {
        trapFocus(event);
      }
    },
    [closeOnEsc, requestClose, trapFocus, onKeyDown]
  );

export { useModalKeyboard };
