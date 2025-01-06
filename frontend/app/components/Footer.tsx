import styles from "./footer.module.scss";
import Image from "next/image";
import github from "@/public/github-mark-white.svg";
import Link from "next/link";

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div>
                Modern Calc
            </div>
            <div>
                <Link href="https://github.com/JaiSwarup/modern-calc" className={styles.link}><Image src={github} alt="Link to Github" className={styles.img}></Image></Link>
            </div>

        </footer>
    );
}