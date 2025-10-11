import { useEffect } from "react"; // side effect 처리를 위해 useEffect 훅을 가져온다.

type UseLockBodyScrollOptions = { // 훅에 전달할 옵션 객체의 타입을 정의한다.
  lockScroll: boolean; // 스크롤 잠금을 적용할지 여부다.
  isMounted: boolean; // 모달이 마운트되어 있는지 여부다.
  isVisible: boolean; // 모달이 화면에 보이는 상태인지 여부다.
};

/**
 * 모달이 열려 있는 동안 배경 스크롤을 잠그는 훅. // 훅의 역할을 한 문장으로 설명한다.
 *
 * - scroll bar가 사라질 때 레이아웃이 흔들리지 않도록 paddingRight 보정도 함께 수행한다. // 세부 동작 1을 설명한다.
 * - 모달이 닫히거나 lockScroll 플래그가 false가 되면 원래 상태로 복구한다. // 세부 동작 2를 설명한다.
 */
const useLockBodyScroll = ({ // 훅 본체를 선언한다.
  lockScroll, // 스크롤 잠금이 필요한지 나타내는 플래그다.
  isMounted, // 모달 마운트 상태를 받는다.
  isVisible, // 모달 가시성 상태를 받는다.
}: UseLockBodyScrollOptions) => {
  useEffect(() => { // 스크롤 잠금을 처리할 effect다.
    if (!lockScroll || !isMounted) { // 잠금이 필요 없거나 아직 모달 DOM이 준비되지 않았다면
      return; // 아무 작업도 하지 않는다.
    }

    if (typeof document === "undefined") { // 서버 환경에서는 document가 없으므로
      return; // 스크롤 잠금을 적용하지 않는다.
    }

    const originalOverflow = document.body.style.overflow; // 현재 body overflow 값을 저장한다.
    const originalPaddingRight = document.body.style.paddingRight; // 기존 paddingRight도 저장한다.

    const scrollBarWidth = // 스크롤바가 차지하던 폭을 계산한다.
      window.innerWidth - document.documentElement.clientWidth; // 창 너비와 문서 너비의 차이를 사용한다.
    if (scrollBarWidth > 0) { // 스크롤바가 존재했다면
      document.body.style.paddingRight = `${scrollBarWidth}px`; // 사라진 폭만큼 paddingRight를 보정한다.
    }

    document.body.style.overflow = "hidden"; // body overflow를 hidden으로 바꿔 스크롤을 잠근다.

    return () => { // effect clean-up에서 원래 상태를 복구한다.
      document.body.style.overflow = originalOverflow; // 저장해둔 overflow로 되돌린다.
      document.body.style.paddingRight = originalPaddingRight; // paddingRight도 이전 값으로 되돌린다.
    };
  }, [lockScroll, isMounted, isVisible]); // 관련 상태가 변할 때마다 effect를 다시 평가한다.
};

export { useLockBodyScroll }; // 외부에서 사용할 수 있도록 훅을 내보낸다.
