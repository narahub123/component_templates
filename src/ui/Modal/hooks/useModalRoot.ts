import {
  useCallback,
  useContext,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import type { KeyboardEvent as ReactKeyboardEvent, RefObject } from "react";
import styles from "../Modal.module.css";
import { joinClassNames } from "../utils";
import type {
  ModalContextValue,
  ModalOpenChangeMetaInput,
  ModalOpenChangeReason,
} from "../types";
import { useLockBodyScroll } from "./useLockBodyScroll";
import { useModalFocus } from "./useModalFocus";
import { useModalKeyboard } from "./useModalKeyboard";
import { useModalLifecycle } from "./useModalLifecycle";
import { useModalOutsideClick } from "./useModalOutsideClick";
import { usePortalInert } from "./usePortalInert";
import { ModalStackContext } from "../context";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";

const PROGRAMMATIC_REASON: ModalOpenChangeReason = "programmatic";

type CloseRequest = {
  reason: ModalOpenChangeReason;
  nativeEvent?: Event;
};

type UseModalRootParams = {
  open: boolean;
  onClose: (intent: CloseRequest) => void;
  closeOnEsc: boolean;
  closeOnOutsideClick: boolean;
  initialFocusRef?: RefObject<HTMLElement | null> | null;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  lockScroll: boolean;
  trapFocus: boolean;
  restoreFocusRef?: RefObject<HTMLElement | null> | null;
  disableKeyBindings?: boolean;
  onKeyDown?: (event: ReactKeyboardEvent<HTMLDivElement>) => void;
  className?: string;
  portalElement?: HTMLElement | null;
};

type UseModalRootResult = {
  isMounted: boolean;
  targetElement: HTMLElement | null;
  contextValue: ModalContextValue;
  overlayClassName: string;
  modalClassName: string;
  labelledBy: string | undefined;
  describedBy: string | undefined;
  handleKeyDown: (event: ReactKeyboardEvent<HTMLDivElement>) => void;
  handleRootMouseDown: ReturnType<typeof useModalOutsideClick>;
  contentRef: ModalContextValue["contentRef"];
  portalRef: RefObject<HTMLDivElement | null>;
  focusFirst: () => void;
};

const useModalRoot = ({
  open,
  onClose,
  closeOnEsc,
  closeOnOutsideClick,
  initialFocusRef,
  ariaLabelledBy,
  ariaDescribedBy,
  lockScroll,
  trapFocus,
  restoreFocusRef,
  disableKeyBindings = false,
  onKeyDown,
  className,
  portalElement,
}: UseModalRootParams): UseModalRootResult => {
  const { isMounted, isVisible, contentRef } = useModalLifecycle({
    isOpen: open,
    restoreFocusRef,
  });
  const titleId = useId();
  const descriptionId = useId();
  const stackId = useId();
  const [registeredLabelId, setRegisteredLabelId] = useState<string | null>(
    null
  );
  const [registeredDescriptionId, setRegisteredDescriptionId] = useState<
    string | null
  >(null);
  const portalRef = useRef<HTMLDivElement | null>(null);
  const stackContext = useContext(ModalStackContext);
  const stackRegister = stackContext?.register;
  const stackUnregister = stackContext?.unregister;
  const stackIsTop = stackContext?.isTop;
  const stackList = stackContext?.stack;

  useIsomorphicLayoutEffect(() => {
    if (!stackRegister || !stackUnregister || !open) {
      return;
    }

    stackRegister(stackId);
    return () => {
      stackUnregister(stackId);
    };
  }, [stackRegister, stackUnregister, stackId, open]);

  const isTopMost =
    !stackContext ||
    !stackList ||
    !stackList.includes(stackId) ||
    stackIsTop?.(stackId) === true;

  useLockBodyScroll({ lockScroll, isMounted, isVisible });

  const { trapFocus: enforceFocus, focusFirst } = useModalFocus({
    contentRef,
    initialFocusRef,
    isMounted,
    isVisible,
    trapFocus: trapFocus && isTopMost && !disableKeyBindings,
  });

  const forwardCloseIntent = useCallback(
    ({ reason, nativeEvent }: CloseRequest) => {
      onClose({ reason, nativeEvent });
    },
    [onClose]
  );

  const handleKeyDown = disableKeyBindings
    ? (event: ReactKeyboardEvent<HTMLDivElement>) => {
        onKeyDown?.(event);
      }
    : useModalKeyboard({
        closeOnEsc: closeOnEsc && isTopMost,
        requestClose: ({ reason, nativeEvent }) =>
          forwardCloseIntent({ reason, nativeEvent }),
        trapFocus: enforceFocus,
        onKeyDown,
      });

  const handleRootMouseDown = useModalOutsideClick({
    closeOnOutsideClick: closeOnOutsideClick && isTopMost,
    onClose: ({ reason, nativeEvent }) =>
      forwardCloseIntent({ reason, nativeEvent }),
    contentRef,
  });

  const registerLabel = useCallback((id: string | null) => {
    setRegisteredLabelId(id);
  }, []);

  const registerDescription = useCallback((id: string | null) => {
    setRegisteredDescriptionId(id);
  }, []);

  const contextValue = useMemo<ModalContextValue>(() => {
    const close = (meta?: ModalOpenChangeMetaInput) => {
      const reason = meta?.reason ?? PROGRAMMATIC_REASON;
      forwardCloseIntent({ reason, nativeEvent: meta?.nativeEvent });
    };

    return {
      close,
      registerLabel,
      registerDescription,
      titleId,
      descriptionId,
      contentRef,
    };
  }, [
    forwardCloseIntent,
    registerLabel,
    registerDescription,
    titleId,
    descriptionId,
    contentRef,
  ]);

  const labelledBy = ariaLabelledBy ?? registeredLabelId ?? undefined;
  const describedBy = ariaDescribedBy ?? registeredDescriptionId ?? undefined;

  const targetElement =
    portalElement ?? (typeof document !== "undefined" ? document.body : null);

  const overlayClassName = joinClassNames(
    styles.overlay,
    isVisible ? styles.overlayVisible : styles.overlayHidden
  );

  const modalClassName = joinClassNames(
    styles.modal,
    isVisible ? styles.modalVisible : styles.modalHidden,
    className
  );

  usePortalInert({ isActive: isMounted, portalRef });

  return {
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
  };
};

export type { UseModalRootParams, UseModalRootResult };
export { useModalRoot };
