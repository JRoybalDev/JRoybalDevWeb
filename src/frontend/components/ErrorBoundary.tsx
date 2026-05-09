import React, { ReactNode } from "react";
import { FiAlertTriangle, FiHome, FiRefreshCcw } from "react-icons/fi";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    // eslint-disable-next-line no-console
    console.error("ErrorBoundary caught:", error);
  }

  render() {
    if (this.state.hasError) {
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
              <h1>Oops</h1>
              <h2>An unexpected error occurred.</h2>
              <p>{this.state.error?.message ?? "The page hit an unexpected issue."}</p>
            </div>

            <div className="status-actions">
              <button className="button button-alt" onClick={() => { window.location.href = "/"; }}>
                <FiHome size={16} />
                Back to home
              </button>
              <button className="button" onClick={() => window.location.reload()}>
                <FiRefreshCcw size={16} />
                Reload page
              </button>
            </div>
          </div>
        </section>
      );
    }

    return this.props.children;
  }
}
