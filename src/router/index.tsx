import { createHashRouter } from "react-router-dom";
import FrontLayout from "../layouts/FrontLayout";
import HomePage from "../pages/HomePage";
import WordPage from "../pages/WordPage";
import BookPage from "../pages/BookPage";
import CompanionPage from "../pages/companionPage";

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
        path: "CP/:cpId",
        element: <CompanionPage />,
      },
      {
        path: "CP/:cpId/:bookId",
        element: <BookPage />,
      },
    ],
  },
]);

export default router;
