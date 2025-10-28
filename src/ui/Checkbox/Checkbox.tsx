import { forwardRef, type InputHTMLAttributes } from "react";
import { Icon } from "../Icon";

type ReactInputType = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" & "defaultChecked"
>;

type CheckboxProps = ReactInputType & {};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ id: _id, className: _className, ...props }, ref) => {
    const className = ["text-xl", _className].join(" ");

    return (
      <label htmlFor={_id}>
        <input
          type="checkbox"
          className="sr-only peer"
          id={_id}
          ref={ref}
          {...props}
        />
        <Icon
          name="checkbox"
          className={`inline peer-checked:hidden text-gray-400 ${className}`}
        />
        <Icon
          name="checkboxFill"
          className={`hidden peer-checked:inline text-orange-400 ${className}`}
        />
      </label>
    );
  }
);
