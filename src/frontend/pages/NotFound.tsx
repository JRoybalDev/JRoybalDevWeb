import { Link } from "react-router-dom";
import { FiArrowLeft, FiCoffee } from "react-icons/fi";

export default function NotFound() {
  return (
    <section className="page-shell status-page">
      <div className="status-panel">
        <div className="status-art" aria-hidden="true">
          <div className="status-cup">
            <FiCoffee size={34} />
          </div>
          <div className="status-ripple status-ripple-one" />
          <div className="status-ripple status-ripple-two" />
        </div>

        <div className="status-copy">
          <p className="eyebrow">Lost order</p>
          <h1>404</h1>
          <h2>That page slipped off the menu.</h2>
          <p>
            The route you opened does not exist anymore, or it may have been moved
            during the latest roast.
          </p>
        </div>

        <div className="status-actions">
          <Link className="button button-alt" to="/">
            <FiArrowLeft size={16} />
            Back to home
          </Link>
          <Link className="button" to="/projects">
            View projects
          </Link>
        </div>
      </div>
    </section>
  );
}
