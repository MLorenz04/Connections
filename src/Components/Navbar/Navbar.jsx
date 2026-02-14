import { Link, useLocation } from "react-router-dom";
import "./navbar.css";
import { useState } from "react";
export default function Navbar() {
  let [random_id, set_random_id] = useState(0);
  return (
    <nav>
      <ul>
        <li>
          <Link to="/create">Vytvořit </Link>
        </li>
        <li>
          <Link
            onClick={() => set_random_id((prev) => (prev = prev + 1))}
            to={`/connection/random?number_of_random=${random_id}`}
          >
            Náhodné
          </Link>
        </li>

        <li>
          <Link to="/connection/daily">Dnešní</Link>
        </li>
        <li>
          <Link to="/connection/list">Seznam</Link>
        </li>
      </ul>
    </nav>
  );
}
