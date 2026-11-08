import { createBrowserRouter, Navigate } from 'react-router-dom'
import { PathOverviewPage } from '@/features/paths/path-overview-page'
import { ReaderPage } from '@/features/reading/reader-page'

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/p/world-war-2" replace /> },
  { path: '/p/:pathId', element: <PathOverviewPage /> },
  { path: '/read/:pathId/:lessonKey', element: <ReaderPage /> },
  { path: '*', element: <Navigate to="/" replace /> },
])
