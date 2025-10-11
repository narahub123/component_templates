import { useCallback } from "react"; // 포커스 트랩 로직에 사용할 헬퍼 함수를 메모이제이션한다.
import type { KeyboardEvent, MutableRefObject, RefObject } from "react"; // 옵션/반환 타입을 명확히 하기 위한 React 타입.
import { FOCUSABLE_SELECTOR } from "../constants"; // 포커스 가능한 요소를 찾기 위한 셀렉터.
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect"; // 초기 포커스를 정확히 맞추기 위한 layout effect.

type UseModalFocusOptions = {
  contentRef: MutableRefObject<HTMLDivElement | null>;
  initialFocusRef?: RefObject<HTMLElement | null> | null;
  isMounted: boolean;
  isVisible: boolean;
  trapFocus: boolean;
};

const useModalFocus = ({
  contentRef,
  initialFocusRef,
  isMounted,
  isVisible,
  trapFocus,
}: UseModalFocusOptions) => {
  const getFocusableElements = useCallback(
    (options?: { excludeCloseButton?: boolean }) => {
      const container = contentRef.current;

      if (!container || typeof document === "undefined") {
        return [] as HTMLElement[];
      }

      const nodes = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter((element) => {
        const isHidden = element.getAttribute("aria-hidden") === "true";
        const isDisabled = (element as HTMLButtonElement).disabled;
        return !isHidden && !isDisabled;
      });

      if (options?.excludeCloseButton) {
        return nodes.filter(
          (element) => element.dataset.modalCloseButton !== "true"
        );
      }

      return nodes;
    },
    [contentRef]
  );

  useIsomorphicLayoutEffect(() => {
    if (!isMounted || !isVisible) {
      return;
    }

    const targetFromProp = initialFocusRef?.current ?? null;
    const fallbackTargets = getFocusableElements({ excludeCloseButton: true });
    const fallbackWithClose = getFocusableElements();
    const focusTarget =
      targetFromProp ??
      fallbackTargets[0] ??
      fallbackWithClose[0] ??
      contentRef.current;

    focusTarget?.focus?.({ preventScroll: true });
  }, [isMounted, isVisible, initialFocusRef, getFocusableElements, contentRef]);

  const handleTrapFocus = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (!trapFocus) {
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusable = getFocusableElements();

      if (focusable.length === 0) {
        event.preventDefault();
        contentRef.current?.focus({ preventScroll: true });
        return;
      }

      if (typeof document === "undefined") {
        return;
      }

      const active = document.activeElement as HTMLElement | null;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey) {
        if (!active || active === first) {
          event.preventDefault();
          last.focus({ preventScroll: true });
        }
        return;
      }

      if (active === last) {
        event.preventDefault();
        first.focus({ preventScroll: true });
      }
    },
    [trapFocus, contentRef, getFocusableElements]
  );

  const focusFirst = useCallback(() => {
    const fallbackTargets = getFocusableElements({ excludeCloseButton: true });
    const fallbackWithClose = getFocusableElements();
    const focusTarget =
      fallbackTargets[0] ?? fallbackWithClose[0] ?? contentRef.current;

    focusTarget?.focus?.({ preventScroll: true });
  }, [getFocusableElements, contentRef]);

  return { trapFocus: handleTrapFocus, focusFirst };
};

export { useModalFocus };
