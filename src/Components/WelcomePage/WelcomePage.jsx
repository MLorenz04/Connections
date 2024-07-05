import Connection from "../Connection/Connection";
import Navbar from "../Navbar/Navbar";
import "./welcomepage.css";
export default function WelcomePage() {
  return (
    <div id="welcome-page">
      <section id="welcome-page__content">
        <h2> Dnešní hádanka </h2>

        <Connection id="daily"></Connection>
      </section>
    </div>
  );
}
