import type { HTMLAttributes } from "react";
import styles from "../Modal.module.css";
import { joinClassNames } from "../utils";

type ModalFooterProps = HTMLAttributes<HTMLDivElement>;

const ModalFooter = ({ className, children, ...rest }: ModalFooterProps) => (
  <div className={joinClassNames(styles.footer, className)} {...rest}>
    {children}
  </div>
);

ModalFooter.displayName = "Modal.Footer";

export type { ModalFooterProps };
export default ModalFooter;
