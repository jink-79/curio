import { RouterProvider } from 'react-router-dom'
import { ReaderSettingsProvider } from '@/features/reading/reader-settings-provider'
import { router } from './router.tsx'

function App() {
  return (
    <ReaderSettingsProvider>
      <RouterProvider router={router} />
    </ReaderSettingsProvider>
  )
}

export default App
