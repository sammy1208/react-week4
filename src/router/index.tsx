import { createHashRouter } from "react-router-dom";
import FrontLayout from "../layouts/FrontLayout";
import HomePage from "../pages/HomePage";
import WordPage from "../pages/WordPage";
import BookPage from "../pages/BookPage";
import CompanionPage from "../pages/companionPage";
import AurelisPage from "../pages/AurelisPage";
import SeriesStoryPage from "../pages/SeriesStoryPage";
import SeriesChapterPage from "../pages/SeriesChapterPage";

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
        path: "series/aurelis",
        element: <AurelisPage />,
      },
      {
        path: "series/:seriesId/:storyId",
        element: <SeriesStoryPage />,
      },
      {
        path: "series/:seriesId/:storyId/:chapterId",
        element: <SeriesChapterPage />,
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
