
type Props = {}

export default function Navbar({}: Props) {
  return (
    <nav>
        <ul>
            <li>
            <a href="/sign-up">Sign Up</a>
            </li>
            <li>
            <a href="/sign-in">Sign In</a>
            </li>
            <li>
            <a href="/contact">Contact</a>
            </li>
            <li>
            <a href="/dashboard">Dashboard</a>
            </li>
        </ul>
    </nav>
  )
}