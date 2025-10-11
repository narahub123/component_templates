import type { HTMLAttributes } from "react";
import { useEffect } from "react";
import styles from "../Modal.module.css";
import { useModalContext } from "../context";
import { joinClassNames } from "../utils";

type ModalHeaderProps = HTMLAttributes<HTMLDivElement>;

const ModalHeader = ({
  className,
  children,
  id,
  ...rest
}: ModalHeaderProps) => {
  const { registerLabel, titleId } = useModalContext("Modal.Header");
  const headerId = id ?? titleId;

  // 헤더 영역을 dialog의 레이블로 연결
  useEffect(() => {
    registerLabel(headerId);
    return () => registerLabel(null);
  }, [headerId, registerLabel]);

  return (
    <div
      id={headerId}
      className={joinClassNames(styles.header, className)}
      {...rest}
    >
      {children}
    </div>
  );
};

ModalHeader.displayName = "Modal.Header";

export type { ModalHeaderProps };
export default ModalHeader;
