import type {
  ButtonHTMLAttributes,
  MouseEvent as ReactMouseEvent,
} from "react";
import { forwardRef } from "react";
import styles from "../Modal.module.css";
import { useModalContext } from "../context";
import { joinClassNames } from "../utils";
import type { ModalOpenChangeReason } from "../types";

type ModalCloseButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

const CLOSE_BUTTON_REASON: ModalOpenChangeReason = "close-button";

const ModalCloseButton = forwardRef<HTMLButtonElement, ModalCloseButtonProps>(
  ({ className, children, onClick, ...rest }, ref) => {
    const { close } = useModalContext("Modal.CloseButton");
    const { ["aria-label"]: ariaLabelProp, ...remaining } = rest;
    const ariaLabel = ariaLabelProp ?? "Close modal";

    // 사용자가 onClick 이후 preventDefault 하지 않았다면 기본 닫기 동작 수행
    const handleClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
      onClick?.(event);

      if (!event.defaultPrevented) {
        close({
          reason: CLOSE_BUTTON_REASON,
          nativeEvent: event.nativeEvent,
        });
      }
    };

    return (
      <button
        type="button"
        {...remaining}
        ref={ref}
        className={joinClassNames(styles.closeButton, className)}
        aria-label={ariaLabel}
        onClick={handleClick}
        data-modal-close-button="true"
      >
        {children ?? (
          <span className={styles.closeIcon} aria-hidden="true">
            x
          </span>
        )}
      </button>
    );
  }
);

ModalCloseButton.displayName = "Modal.CloseButton";

export type { ModalCloseButtonProps };
export default ModalCloseButton;
