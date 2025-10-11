import type { HTMLAttributes } from "react";
import { useEffect } from "react";
import styles from "../Modal.module.css";
import { useModalContext } from "../context";
import { joinClassNames } from "../utils";

type ModalBodyProps = HTMLAttributes<HTMLDivElement>;

const ModalBody = ({ className, children, id, ...rest }: ModalBodyProps) => {
  const { registerDescription, descriptionId } = useModalContext("Modal.Body");
  const bodyId = id ?? descriptionId;

  // 바디 영역을 dialog 설명과 연결
  useEffect(() => {
    registerDescription(bodyId);
    return () => registerDescription(null);
  }, [bodyId, registerDescription]);

  return (
    <div
      id={bodyId}
      className={joinClassNames(styles.body, className)}
      {...rest}
    >
      {children}
    </div>
  );
};

ModalBody.displayName = "Modal.Body";

export type { ModalBodyProps };
export default ModalBody;
