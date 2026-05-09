import { Link } from "react-router-dom";
import { FiAlertTriangle, FiArrowLeft, FiRefreshCcw } from "react-icons/fi";

export default function ErrorPage({ message = "Something went wrong" }: { message?: string }) {
  return (
    <section className="page-shell status-page">
      <div className="status-panel status-panel-error">
        <div className="status-art status-art-error" aria-hidden="true">
          <div className="status-cup">
            <FiAlertTriangle size={34} />
          </div>
          <div className="status-ripple status-ripple-one" />
          <div className="status-ripple status-ripple-two" />
        </div>

        <div className="status-copy">
          <p className="eyebrow">Brew interrupted</p>
          <h1>Error</h1>
          <h2>Something overflowed behind the counter.</h2>
          <p>{message}</p>
        </div>

        <div className="status-actions">
          <Link className="button button-alt" to="/">
            <FiArrowLeft size={16} />
            Back to home
          </Link>
          <button className="button" onClick={() => window.location.reload()}>
            <FiRefreshCcw size={16} />
            Try again
          </button>
        </div>
      </div>
    </section>
  );
}
