import { createHashRouter } from "react-router-dom";
import FrontLayout from "../layouts/FrontLayout";
import HomePage from "../pages/HomePage";
import WordPage from "../pages/WordPage";
import BookPage from "../pages/BookPage";

const router = createHashRouter([
  {
    path: "/",
    element: <FrontLayout />,
    children: [
      {
        path: "",
        element: <HomePage />,
      },
      {
        path: "word/:id",
        element: <WordPage />,
      },
      {
        path: "book/:id",
        element: <BookPage />,
      },
    ],
  },
]);

export default router;
