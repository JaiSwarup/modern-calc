import './App.css'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import RootLayout from './layouts/route-layout'
import IndexPage from './routes/LandingPage'
import DashboardPage from './routes/Dashboard'
import { useAuth, useClerk } from '@clerk/clerk-react'
// import InvoicesPage from './routes/Invoices'
// import ContactPage from './routes/Contact'
import SignInPage from './routes/Sign-in'
import SignUpPage from './routes/Sign-up'
import { useEffect } from 'react'
import axios from 'axios'
// import NotFoundPage from './routes/NotFound'

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <IndexPage /> },
      // { path: '/contact', element: <ContactPage /> },
      { path: '/sign-in/*', element: <SignInPage /> },
      { path: '/sign-up/*', element: <SignUpPage /> },
      {
        // element: <DashboardLayout />,
        path: 'dashboard',
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          // { path: '/dashboard/invoices', element: <InvoicesPage /> },
        ],
      },
    ],
  },
])

function App() {

  return (
    
    <RouterProvider router={router} />
  );
}

export default App
