import { SignedOut, SignedIn, SignInButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Navbar() {
    return (
        <nav>
            <div>
                <Link href="/"><h1>Modern Calc</h1></Link>
                <Link href="/">About</Link>
            </div>
            <SignedOut>
                <SignInButton>
                    <button className="light">Sign In</button>
                </SignInButton>
            </SignedOut>
            <SignedIn>
                <Link href="/dashboard" className="dark">Dashboard</Link>
            </SignedIn>
        </nav>
    );
}