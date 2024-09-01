import { Link } from 'react-router-dom'

export default function IndexPage() {
  return (
    <div>
      <h2>Welcome</h2>
      <h3>To</h3>
      <h1>Modern Calc</h1>
      <div>
        <ul>
          <li>
            <Link to="/sign-up">Sign Up</Link>
          </li>
          <li>
            <Link to="/sign-in">Sign In</Link>
          </li>
          <li>
            <Link to="/contact">Contact</Link>
          </li>
          <li>
            <Link to="/dashboard">Dashboard</Link>
          </li>
        </ul>
      </div>
    </div>
  )
}