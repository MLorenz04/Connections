import { Link } from "react-router-dom";
import "./navbar.css";
export default function Navbar() {
  return (
    <nav>
      <ul>
        <li>
          <Link href="/create">Vytvořit </Link>
        </li>
        <li>
          <Link href="/random">Náhodné</Link>
        </li>
        <li>
          <Link href="/random">Dnešní</Link>
        </li>
        <li>
          <Link href="/random">Vyhledat</Link>
        </li>
      </ul>
    </nav>
  );
}
