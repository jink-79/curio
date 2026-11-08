import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/app/app-layout'
import { CategoryPage } from '@/features/discover/category-page'
import { DiscoverPage } from '@/features/discover/discover-page'
import { LibraryPage } from '@/features/library/library-page'
import { PathOverviewPage } from '@/features/paths/path-overview-page'
import { ReaderPage } from '@/features/reading/reader-page'

export const router = createBrowserRouter([
  {
    // Screens with the bottom tab bar.
    element: <AppLayout />,
    children: [
      { path: '/discover', element: <DiscoverPage /> },
      { path: '/discover/c/:slug', element: <CategoryPage /> },
      { path: '/p/:pathId', element: <PathOverviewPage /> },
      { path: '/library', element: <LibraryPage /> },
    ],
  },
  // Full-screen reader, no tab bar.
  { path: '/read/:pathId/:lessonKey', element: <ReaderPage /> },
  { path: '/', element: <Navigate to="/discover" replace /> },
  { path: '*', element: <Navigate to="/" replace /> },
])
