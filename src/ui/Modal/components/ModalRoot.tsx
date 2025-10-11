import type {
  CSSProperties,
  KeyboardEvent,
  ReactNode,
  RefObject,
} from "react";
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useState,
} from "react";
import { createPortal } from "react-dom";
import styles from "../Modal.module.css";
import { ModalContext } from "../context";
import { useModalRoot } from "../hooks";
import type {
  ModalImperativeHandle,
  ModalOpenChangeHandler,
  ModalOpenChangeMetaInput,
  ModalOpenChangeReason,
} from "../types";

type ModalProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: ModalOpenChangeHandler;
  children: ReactNode;
  hasOverlay?: boolean;
  closeOnEsc?: boolean;
  closeOnOutsideClick?: boolean;
  initialFocusRef?: RefObject<HTMLElement | null> | null;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  lockScroll?: boolean;
  trapFocus?: boolean;
  restoreFocusRef?: RefObject<HTMLElement | null> | null;
  role?: "dialog" | "alertdialog";
  onKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void;
  disableKeyBindings?: boolean;
  zIndex?: number;
  className?: string;
  style?: CSSProperties;
  portalElement?: HTMLElement | null;
};

const PROGRAMMATIC_REASON: ModalOpenChangeReason = "programmatic";

type CloseIntent = {
  reason: ModalOpenChangeReason;
  nativeEvent?: Event;
};

const ModalRoot = forwardRef<ModalImperativeHandle, ModalProps>(
  (
    {
      open: openProp,
      defaultOpen,
      onOpenChange,
      children,
      hasOverlay = true,
      closeOnEsc = true,
      closeOnOutsideClick = true,
      initialFocusRef,
      ariaLabelledBy,
      ariaDescribedBy,
      lockScroll = true,
      trapFocus = true,
      restoreFocusRef,
      role = "dialog",
      onKeyDown,
      disableKeyBindings = false,
      zIndex = 1300,
      className,
      style,
      portalElement,
    },
    ref
  ) => {
    const isControlled = openProp !== undefined;
    const [internalOpen, setInternalOpen] = useState<boolean>(
      defaultOpen ?? false
    );

    const open = isControlled ? Boolean(openProp) : internalOpen;

    const changeOpen = useCallback(
      (
        nextOpen: boolean,
        meta: ModalOpenChangeMetaInput | undefined,
        fallbackReason: ModalOpenChangeReason
      ) => {
        const reason = meta?.reason ?? fallbackReason;

        if (nextOpen === open) {
          return;
        }

        if (!isControlled) {
          setInternalOpen(nextOpen);
        }

        onOpenChange?.(nextOpen, {
          reason,
          nativeEvent: meta?.nativeEvent,
        });
      },
      [open, isControlled, onOpenChange, setInternalOpen]
    );

    const openModal = useCallback(
      (meta?: ModalOpenChangeMetaInput) => {
        changeOpen(true, meta, meta?.reason ?? PROGRAMMATIC_REASON);
      },
      [changeOpen]
    );

    const closeModal = useCallback(
      (meta?: ModalOpenChangeMetaInput) => {
        changeOpen(false, meta, meta?.reason ?? PROGRAMMATIC_REASON);
      },
      [changeOpen]
    );

    const toggleModal = useCallback(
      (meta?: ModalOpenChangeMetaInput) => {
        changeOpen(!open, meta, meta?.reason ?? PROGRAMMATIC_REASON);
      },
      [changeOpen, open]
    );

    const handleClose = useCallback(
      ({ reason, nativeEvent }: CloseIntent) => {
        changeOpen(false, { reason, nativeEvent }, reason);
      },
      [changeOpen]
    );

    const {
      isMounted,
      targetElement,
      contextValue,
      overlayClassName,
      modalClassName,
      labelledBy,
      describedBy,
      handleKeyDown,
      handleRootMouseDown,
      contentRef,
      portalRef,
      focusFirst,
    } = useModalRoot({
      open,
      onClose: handleClose,
      closeOnEsc,
      closeOnOutsideClick,
      initialFocusRef,
      ariaLabelledBy,
      ariaDescribedBy,
      lockScroll,
      trapFocus,
      restoreFocusRef,
      onKeyDown,
      disableKeyBindings,
      className,
      portalElement,
    });

    useImperativeHandle(
      ref,
      () => ({
        open: openModal,
        close: closeModal,
        toggle: toggleModal,
        focusFirst,
      }),
      [openModal, closeModal, toggleModal, focusFirst]
    );

    if (!isMounted || !targetElement) {
      return null;
    }

    return createPortal(
      <ModalContext.Provider value={contextValue}>
        <div
          ref={portalRef}
          className={styles.portal}
          style={{ zIndex }}
          onMouseDown={handleRootMouseDown}
        >
          {hasOverlay ? (
            <div className={overlayClassName} aria-hidden="true" />
          ) : null}
          <div className={styles.positioner}>
            <div
              ref={contentRef}
              className={modalClassName}
              style={style}
              role={role}
              aria-modal="true"
              aria-labelledby={labelledBy}
              aria-describedby={describedBy}
              tabIndex={-1}
              onKeyDown={handleKeyDown}
              onMouseDown={(event) => event.stopPropagation()}
            >
              {children}
            </div>
          </div>
        </div>
      </ModalContext.Provider>,
      targetElement
    );
  }
);

ModalRoot.displayName = "ModalRoot";

export type { ModalProps };
export default ModalRoot;
