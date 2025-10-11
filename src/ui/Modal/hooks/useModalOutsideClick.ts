import { useCallback, useEffect } from "react"; // 외부 포인터 이벤트를 감시해 닫기 여부를 판단한다.
import type { MutableRefObject } from "react";
import type { ModalOpenChangeReason } from "../types";

const OUTSIDE_REASON: ModalOpenChangeReason = "outside";

type UseModalOutsideClickOptions = {
  closeOnOutsideClick: boolean;
  onClose: (meta: { reason: ModalOpenChangeReason; nativeEvent?: Event }) => void;
  contentRef: MutableRefObject<HTMLDivElement | null>;
};

const useModalOutsideClick = ({
  closeOnOutsideClick,
  onClose,
  contentRef,
}: UseModalOutsideClickOptions) => {
  useEffect(() => {
    if (!closeOnOutsideClick) {
      return undefined;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (event.button !== 0) {
        return;
      }

      const container = contentRef.current;
      if (!container) {
        return;
      }

      const target = event.target as Node;
      if (!container.contains(target)) {
        onClose({ reason: OUTSIDE_REASON, nativeEvent: event });
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [closeOnOutsideClick, onClose, contentRef]);

  return useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!closeOnOutsideClick || event.button !== 0) {
        return;
      }

      const container = contentRef.current;
      const target = event.target as Node;

      if (!container || container.contains(target)) {
        return;
      }

      event.preventDefault();
      onClose({ reason: OUTSIDE_REASON, nativeEvent: event.nativeEvent });
    },
    [closeOnOutsideClick, onClose, contentRef]
  );
};

export { useModalOutsideClick };
