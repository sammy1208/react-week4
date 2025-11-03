import { createHashRouter } from "react-router-dom";
import FrontLayout from "../layouts/FrontLayout";
import HomePage from "../pages/HomePage";
import WordPage from "../pages/WordPage";
import BookPage from "../pages/BookPage";

const router = createHashRouter([
  {
    path: "/",
    element: <FrontLayout/>,
    children: [
      {
        path: "",
        element: <HomePage />
      },
      {
        path: "word",
        element: <WordPage />
      },
      {
        path: "book",
        element: <BookPage />
      }
    ]
  }
]);

export default router;