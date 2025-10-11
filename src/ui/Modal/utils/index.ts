// 클래스명을 합쳐서 반환하는 헬퍼
export const joinClassNames = (
  ...classNames: Array<string | false | null | undefined>
): string => classNames.filter(Boolean).join(" ");
