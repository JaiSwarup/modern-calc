import { Link, Outlet, useNavigate } from 'react-router-dom'
import { ClerkProvider, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key')
}

export default function RootLayout() {
  const navigate = useNavigate()

  return (
    <ClerkProvider
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to, { replace: true })}
      publishableKey={PUBLISHABLE_KEY}
    >
      <header className="header">
        <div>
          <div>
            <p>Clerk + React + React Router App</p>
          </div>
          <SignedIn>
            <UserButton />
            {/* <div style={{ height: "100vh" }}>
      <button onClick={() => setRead(!read)}>toggle mode</button> */}
      {/* <Sheet
        height="80%"
        data={exampleData}
        options={
          read && {
            mode: "read",
            showToolbar: false,
            showGrid: false,
            showContextmenu: false
          }
        }
      /> */}
      {/* <br />
    </div> */}
          </SignedIn>
          <SignedOut>
            <Link to="/sign-in">Sign In</Link>
          </SignedOut>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </ClerkProvider>
  )
}