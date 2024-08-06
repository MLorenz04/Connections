import { Link, useLocation } from "react-router-dom";
import "./navbar.css";
export default function Navbar() {
  return (
    <nav>
      <ul>
        <li>
          <Link to="/create">Vytvořit </Link>
        </li>
        <li>
          <Link to="/connection/random">Náhodné</Link>
        </li>

        <li>
          <Link to="/connection/daily">Dnešní</Link>
        </li>
      </ul>
    </nav>
  );
}
