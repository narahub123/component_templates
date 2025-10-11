import type {
  CSSProperties,
  KeyboardEvent,
  ReactNode,
  RefObject,
} from "react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import styles from "../Modal.module.css";
import { ModalContext } from "../context";
import { useModalRoot } from "../hooks";
import { joinClassNames } from "../utils";
import type {
  ModalImperativeHandle,
  ModalOpenChangeHandler,
  ModalOpenChangeMetaInput,
  ModalOpenChangeReason,
  ModalHistoryOptions,
  ResolvedModalHistoryOptions,
  ModalMobileBehavior,
} from "../types";

type ModalSizeValue = number | string;

type ModalSizeVars = Record<string, string>;

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
  history?: ModalHistoryOptions;
  mobileBehavior?: ModalMobileBehavior;
  width?: ModalSizeValue;
  height?: ModalSizeValue;
  maxWidth?: ModalSizeValue;
  maxHeight?: ModalSizeValue;
  minWidth?: ModalSizeValue;
  minHeight?: ModalSizeValue;
};

const PROGRAMMATIC_REASON: ModalOpenChangeReason = "programmatic";
const HISTORY_REASON: ModalOpenChangeReason = "history";
const HISTORY_STATE_KEY = "__modalId";

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
      history,
      mobileBehavior = "fullscreen",
      width,
      height,
      maxWidth,
      maxHeight,
      minWidth,
      minHeight,
    },
    ref
  ) => {
    const isControlled = openProp !== undefined;
    const [internalOpen, setInternalOpen] = useState<boolean>(
      defaultOpen ?? false
    );

    const open = isControlled ? Boolean(openProp) : internalOpen;

    const resolvedHistory = useMemo<ResolvedModalHistoryOptions>(() => {
      if (typeof history === "boolean") {
        return { enabled: history };
      }

      if (!history) {
        return { enabled: false };
      }

      const { enabled, state, url } = history;
      return {
        enabled: enabled ?? true,
        state,
        url: url ?? null,
      };
    }, [history]);

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
      [open, isControlled, onOpenChange]
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

    const historyIdRef = useRef<string>(
      `modal-${Math.random().toString(36).slice(2)}`
    );
    const historyActiveRef = useRef(false);
    const suppressPopRef = useRef(false);

    const handleClose = useCallback(
      ({ reason, nativeEvent }: CloseIntent) => {
        const shouldSyncHistory =
          resolvedHistory.enabled &&
          historyActiveRef.current &&
          reason !== HISTORY_REASON &&
          typeof window !== "undefined";

        if (shouldSyncHistory) {
          suppressPopRef.current = true;
          historyActiveRef.current = false;
          try {
            window.history.back();
          } catch (error) {
            suppressPopRef.current = false;
          }
        }

        changeOpen(false, { reason, nativeEvent }, reason);
      },
      [changeOpen, resolvedHistory.enabled]
    );

    const modalMobileClassName =
      mobileBehavior === "centered"
        ? styles.mobileCentered
        : mobileBehavior === "sheet"
        ? styles.mobileSheet
        : styles.mobileFullscreen;

    const portalMobileClassName =
      mobileBehavior === "centered"
        ? styles.portalMobileCentered
        : mobileBehavior === "sheet"
        ? styles.portalMobileSheet
        : styles.portalMobileFullscreen;

    const positionerMobileClassName =
      mobileBehavior === "centered"
        ? styles.positionerMobileCentered
        : mobileBehavior === "sheet"
        ? styles.positionerMobileSheet
        : styles.positionerMobileFullscreen;

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
      mobileClassName: modalMobileClassName,
      portalElement,
    });

    const toCssValue = useCallback((value?: ModalSizeValue) => {
      if (value === undefined || value === null) {
        return undefined;
      }
      return typeof value === "number" ? `${value}px` : value;
    }, []);

    const sizeStyle = useMemo<ModalSizeVars>(() => {
      const vars: ModalSizeVars = {};
      const widthValue = toCssValue(width);
      const heightValue = toCssValue(height);
      const maxWidthValue = toCssValue(maxWidth);
      const maxHeightValue = toCssValue(maxHeight);
      const minWidthValue = toCssValue(minWidth);
      const minHeightValue = toCssValue(minHeight);

      if (widthValue) {
        vars["--modal-width"] = widthValue;
      }
      if (heightValue) {
        vars["--modal-height"] = heightValue;
      }
      if (maxWidthValue) {
        vars["--modal-max-width"] = maxWidthValue;
      }
      if (maxHeightValue) {
        vars["--modal-max-height"] = maxHeightValue;
      }
      if (minWidthValue) {
        vars["--modal-min-width"] = minWidthValue;
      }
      if (minHeightValue) {
        vars["--modal-min-height"] = minHeightValue;
      }

      return vars;
    }, [height, maxHeight, maxWidth, minHeight, minWidth, toCssValue, width]);

    const modalInlineStyle = useMemo<CSSProperties>(() => {
      const base = { ...sizeStyle } as CSSProperties;
      if (style) {
        return { ...base, ...style };
      }
      return base;
    }, [sizeStyle, style]);

    const portalClassName = joinClassNames(
      styles.portal,
      portalMobileClassName
    );

    const positionerClassName = joinClassNames(
      styles.positioner,
      positionerMobileClassName
    );

    useEffect(() => {
      if (!resolvedHistory.enabled || typeof window === "undefined") {
        return;
      }

      const handlePopState = (event: PopStateEvent) => {
        const state = event.state as Record<string, unknown> | null;
        const isCurrentModal = Boolean(
          state && state[HISTORY_STATE_KEY] === historyIdRef.current
        );

        if (!isCurrentModal) {
          return;
        }

        if (suppressPopRef.current) {
          suppressPopRef.current = false;
          return;
        }

        historyActiveRef.current = false;
        changeOpen(false, { reason: HISTORY_REASON, nativeEvent: event }, HISTORY_REASON);
      };

      window.addEventListener("popstate", handlePopState);
      return () => {
        window.removeEventListener("popstate", handlePopState);
      };
    }, [resolvedHistory.enabled, changeOpen]);

    useEffect(() => {
      if (
        !resolvedHistory.enabled ||
        !open ||
        typeof window === "undefined" ||
        historyActiveRef.current
      ) {
        return;
      }

      const state = {
        ...(resolvedHistory.state ?? {}),
        [HISTORY_STATE_KEY]: historyIdRef.current,
      };

      try {
        window.history.pushState(
          state,
          "",
          resolvedHistory.url ?? undefined
        );
        historyActiveRef.current = true;
      } catch (error) {
        // ignore pushState failures in non-browser environments
      }
    }, [
      open,
      resolvedHistory.enabled,
      resolvedHistory.state,
      resolvedHistory.url,
    ]);

    useEffect(() => {
      if (!resolvedHistory.enabled || typeof window === "undefined") {
        return;
      }

      return () => {
        if (historyActiveRef.current) {
          suppressPopRef.current = true;
          historyActiveRef.current = false;
          try {
            window.history.back();
          } catch (error) {
            suppressPopRef.current = false;
          }
        }
      };
    }, [resolvedHistory.enabled]);

    useEffect(() => {
      if (
        !resolvedHistory.enabled ||
        typeof window === "undefined" ||
        open ||
        !historyActiveRef.current
      ) {
        return;
      }

      suppressPopRef.current = true;
      historyActiveRef.current = false;
      try {
        window.history.back();
      } catch (error) {
        suppressPopRef.current = false;
      }
    }, [open, resolvedHistory.enabled]);

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
          className={portalClassName}
          style={{ zIndex }}
          onMouseDown={handleRootMouseDown}
        >
          {hasOverlay ? (
            <div className={overlayClassName} aria-hidden="true" />
          ) : null}
          <div className={positionerClassName}>
            <div
              ref={contentRef}
              className={modalClassName}
              style={modalInlineStyle}
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
