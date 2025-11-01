import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Toaster } from '@/components/ui/sonner'
import { createBrowserRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { Presentation } from './presentation'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/presentation',
    element: <Presentation />,
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
    <Toaster closeButton />
  </StrictMode>
)
