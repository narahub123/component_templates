import { useEffect, useRef, useState } from "react"; // Track modal mount/visibility states and last focused element.
import type { MutableRefObject, RefObject } from "react";
import { ANIMATION_DURATION } from "../constants"; // Shared animation duration for enter/exit.
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect"; // Capture focus before the modal steals it.

type UseModalLifecycleOptions = {
  isOpen: boolean;
  restoreFocusRef?: RefObject<HTMLElement | null> | null;
};

type UseModalLifecycleResult = {
  isMounted: boolean;
  isVisible: boolean;
  contentRef: MutableRefObject<HTMLDivElement | null>;
};

const useModalLifecycle = ({
  isOpen,
  restoreFocusRef,
}: UseModalLifecycleOptions): UseModalLifecycleResult => {
  const [isMounted, setIsMounted] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(isOpen);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useIsomorphicLayoutEffect(() => {
    if (!isOpen) {
      return;
    }

    if (typeof document !== "undefined") {
      lastFocusedRef.current = document.activeElement as HTMLElement | null; // Store the trigger before focus moves inside the modal.
    }
  }, [isOpen]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const query = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updatePreference = (matches: boolean) => {
      setPrefersReducedMotion(matches);
    };

    updatePreference(query.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      updatePreference(event.matches);
    };

    if (typeof query.addEventListener === "function") {
      query.addEventListener("change", handleChange);
      return () => {
        query.removeEventListener("change", handleChange);
      };
    }

    query.addListener(handleChange);
    return () => {
      query.removeListener(handleChange);
    };
  }, []);

  useEffect(() => {
    let timeout: number | undefined;

    if (isOpen) {
      setIsMounted(true);

      if (prefersReducedMotion) {
        setIsVisible(true);
      } else if (typeof window !== "undefined") {
        timeout = window.setTimeout(() => setIsVisible(true), 16);
      } else {
        setIsVisible(true);
      }
    } else {
      setIsVisible(false);

      if (typeof window !== "undefined") {
        const exitDelay = prefersReducedMotion ? 0 : ANIMATION_DURATION;

        if (exitDelay > 0) {
          timeout = window.setTimeout(() => {
            setIsMounted(false);
          }, exitDelay);
        } else {
          setIsMounted(false);
        }
      } else {
        setIsMounted(false);
      }
    }

    return () => {
      if (typeof window !== "undefined" && timeout) {
        window.clearTimeout(timeout);
      }
    };
  }, [isOpen, prefersReducedMotion]);

  useEffect(() => {
    if (!isMounted) {
      return undefined;
    }

    return () => {
      const restoreTarget =
        restoreFocusRef?.current ?? lastFocusedRef.current;

      if (restoreTarget && typeof restoreTarget.focus === "function") {
        const restore = () => restoreTarget.focus({ preventScroll: true }); // 포커스를 복원하는 동작을 함수로 추출한다.
        if (typeof window !== "undefined") {
          window.setTimeout(restore, 0); // 같은 렌더 사이클에서 등록된 inert clean-up이 먼저 실행되도록 한 템포 지연한다.
        } else {
          restore(); // SSR 등 window가 없는 환경에서는 지연이 의미 없으므로 즉시 복원한다.
        }
      }
    };
  }, [isMounted, restoreFocusRef]);

  return { isMounted, isVisible, contentRef };
};

export { useModalLifecycle };
