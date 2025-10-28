import { createBrowserRouter } from "react-router-dom";
import { InputCheckboxPage } from "../pages";

export const router = createBrowserRouter([
  {
    path: "/modal",
    element: <></>,
  },
  {
    path: "/checkbox",
    element: <InputCheckboxPage />,
  },
]);
