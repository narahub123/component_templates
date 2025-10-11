import { useEffect, useLayoutEffect } from "react"; // React에서 제공하는 두 가지 effect 훅을 불러온다.

const useIsomorphicLayoutEffect = // 실행 환경에 따라 알맞은 effect 훅을 선택해 사용하는 커스텀 훅을 선언한다.
  typeof window !== "undefined" // window 객체가 존재하는지 판별해 브라우저 여부를 체크한다.
    ? useLayoutEffect // 브라우저 환경이면 layout 단계에서 실행되는 useLayoutEffect를 사용한다.
    : useEffect; // 서버 환경(SSR)에서는 경고를 피하기 위해 useEffect로 대체한다.

export { useIsomorphicLayoutEffect }; // 완성된 훅을 외부에서 사용할 수 있도록 내보낸다.
