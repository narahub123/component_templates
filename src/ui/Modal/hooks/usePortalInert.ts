import { useEffect } from "react"; // inert 처리를 effect로 수행하기 위해 useEffect를 사용한다.
import type { RefObject } from "react"; // 포털 DOM 요소 ref 타입을 명시해 타입 안전성을 확보한다.

type UsePortalInertOptions = {
  isActive: boolean; // 모달이 마운트되어 inert를 적용해야 하는지 여부.
  portalRef: RefObject<HTMLDivElement | null>; // inert를 건너뛰어야 할 포털 컨테이너 ref.
};

/**
 * 모달이 열릴 때 포털 외부 영역에 inert 속성을 적용해
 * 배경과의 상호작용을 완전히 차단한다.
 */
const usePortalInert = ({ isActive, portalRef }: UsePortalInertOptions) => {
  useEffect(() => {
    if (!isActive) {
      return undefined; // 모달이 닫혀 있다면 inert를 적용할 필요가 없다.
    }

    if (typeof document === "undefined") {
      return undefined; // SSR 환경에서는 document가 없어 inert 조작을 수행할 수 없다.
    }

    const portalNode = portalRef.current;
    if (!portalNode) {
      return undefined; // 포털 DOM을 찾지 못하면 배경을 실수로 비활성화할 수 있으므로 중단한다.
    }

    const affectedElements: HTMLElement[] = []; // inert를 새로 적용한 요소를 저장해 닫힐 때 복원한다.
    const bodyChildren = Array.from(document.body.children); // body 하위 요소를 순회하며 포털 외부 요소를 찾는다.

    bodyChildren.forEach((element) => {
      if (!(element instanceof HTMLElement)) {
        return; // HTMLElement가 아니면 inert를 적용하지 않는다.
      }

      if (element.contains(portalNode)) {
        return; // 모달 포털을 포함하는 요소에 inert를 걸면 모달까지 비활성화되므로 제외한다.
      }

      if (element.hasAttribute("inert")) {
        return; // 이미 inert가 설정된 요소는 건드리지 않아야 의도치 않은 해제/덮어쓰기를 막을 수 있다.
      }

      element.setAttribute("inert", ""); // 배경 요소를 비활성화해 포커스와 클릭이 빠져나가지 않도록 한다.
      affectedElements.push(element); // 나중에 inert 속성을 제거할 수 있도록 기록한다.
    });

    return () => {
      affectedElements.forEach((element) => {
        element.removeAttribute("inert"); // 모달이 닫히면 inert 속성을 제거해 원래 상태로 복구한다.
      });
    };
  }, [isActive, portalRef]); // 모달 활성화 여부나 포털 ref가 바뀌면 inert 적용 상태를 재평가한다.
};

export { usePortalInert };
