import { createBrowserRouter, Navigate } from "react-router-dom";
import { ReaderPage } from "@/features/reading/reader-page";
import { PathPlaceholderPage } from "./path-placeholder-page";

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/read/world-war-2/treaty-of-versailles" replace /> },
  { path: "/read/:pathId/:lessonKey", element: <ReaderPage /> },
  { path: "/p/:pathId", element: <PathPlaceholderPage /> },
  { path: "*", element: <Navigate to="/" replace /> },
]);
