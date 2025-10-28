import { createBrowserRouter } from "react-router-dom";
import { InputCheckboxPage, ModalPage } from "../pages";

export const router = createBrowserRouter([
  {
    path: "/modal",
    element: <ModalPage />,
  },
  {
    path: "/checkbox",
    element: <InputCheckboxPage />,
  },
]);
