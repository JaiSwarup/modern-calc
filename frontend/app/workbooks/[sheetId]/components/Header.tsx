import Link from "next/link";
import {useState} from "react";
import { FaArrowLeft } from "react-icons/fa";
type Props = {
    name: string;
    src?: string;
    alt?: string;
    onChange: (name : string) => void;
    users: number
    className?: string;
};

export default function Header({ name, onChange, users, className }: Props) {
    const [sheetname, setSheetname] = useState(name);

    return (
        <header className={className}>
            <div>
            <Link href="/dashboard">
                <FaArrowLeft />
            </Link>
            <input
                type="text"
                value={sheetname}
                onChange={(e) => setSheetname(e.target.value)}
                onBlur={() => onChange(sheetname)}
                />
            </div>
            {/* <img src={src} alt={alt} /> */}
            <span>{users} online</span>
        </header>
    );
}