import { Checkbox } from "../ui";

export const InputCheckboxPage = () => {
  return (
    <div>
      <div>
        <h1>체크박스 컴포넌트</h1>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
        <Checkbox id="anything" className={"peer-checked:text-blue-300"} />
        <label htmlFor="anything">아무것나</label>
      </div>
    </div>
  );
};
