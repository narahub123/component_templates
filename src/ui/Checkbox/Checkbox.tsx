import {
  forwardRef,
  useEffect,
  useState,
  type InputHTMLAttributes,
} from "react";
import { IoCheckbox, IoSquareOutline } from "react-icons/io5";

type ReactInputType = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" & "defaultChecked"
>;

type CheckboxProps = ReactInputType & {};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ id: _id, onChange, className: _className, checked, ...props }, ref) => {
    const [isChecked, setIsChecked] = useState(false);

    const className = ["", _className].join(" ");

    useEffect(() => {
      if (checked !== undefined) {
        setIsChecked(checked);
      }
    }, [checked]);

    // input:checkbox의 checked 감지
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setIsChecked(e.target.checked);
      onChange?.(e); // 외부 onChange 있으면 호출
    };

    return (
      <label htmlFor={_id}>
        <input
          type="checkbox"
          id={_id}
          ref={ref}
          onChange={handleChange}
          checked={isChecked}
          {...props}
          hidden
        />
        <span className={className}>
          {isChecked ? <IoCheckbox /> : <IoSquareOutline />}
        </span>
      </label>
    );
  }
);
