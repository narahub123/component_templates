import type { DetailedHTMLProps, FC, HTMLAttributes } from "react";
import { icons } from "../../ui";

type ReactSpanProps = DetailedHTMLProps<
  HTMLAttributes<HTMLSpanElement>,
  HTMLSpanElement
>;

type IconProps = ReactSpanProps & {
  name: keyof typeof icons;
};

export const Icon: FC<IconProps> = ({
  name,
  className: _className,
  ...props
}) => {
  const className = ["text-xl", _className].join(" ");

  const Comp = icons[name];
  return (
    <span className={className} {...props}>
      <Comp />
    </span>
  );
};
