import { Link } from 'react-router-dom'
import axios from 'axios'
import React from 'react'
import { useClerk } from '@clerk/clerk-react'

export default function DashboardPage() {
  const clerk = useClerk()
  const [sheets, setSheets] = React.useState<any[]>([])
  React.useEffect(()=>{
    const user = clerk.user
    if (!user) {
      return
    }
    const data = {
      userId: user.id,
      email: user.primaryEmailAddress?.emailAddress,
    }
    axios.get(`${import.meta.env.VITE_SERVER_URL}/worksheets`, { params: data })
      .then(response => {
        setSheets(response.data)
      })
  })
  const handleClick = () => {
    const user = clerk.user
    if (!user) {
      return
    }
    const data = {
      userId: user.id,
      email: user.primaryEmailAddress?.emailAddress,
      title: 'New Sheet',
    }
    axios.post(`${import.meta.env.VITE_SERVER_URL}/worksheets`, data)
      .then(response => {
        setSheets([...sheets, response.data])
      }
      )
  }
  return (
    <>
      <h1>Dashboard page</h1>
      <p>This is a protected page.</p>

      <button onClick={handleClick}>New</button>

      
          <ul>
            {sheets.map((sheet : any) => (
              <li key={sheet.id}>
                <Link to={`/sheet/${sheet.id}`}>{sheet.title}</Link>
              </li>
            ))}
          </ul>
          <Link to="/">Return to index</Link>

    </>
  )
}