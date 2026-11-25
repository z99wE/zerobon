import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in UI boundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.fallback) {
        return this.fallback;
      }
      return (
        <div className="card-feature-light p-8 text-center my-6 bg-[#f6f9fc] border border-[#e3e8ee]">
          <h3 className="font-heading-lg text-[#0d253d] mb-2">Atmospheric Viewport Standby</h3>
          <p className="font-body-md text-xs text-[#475569] mb-4">
            The 3D WebGL renderer encountered a hardware suspension. Your physics mass-balance and routine telemetry remain fully active.
          </p>
          <button
            type="button"
            aria-label="Re-engage atmospheric viewport"
            onClick={() => this.setState({ hasError: false })}
            className="button-primary-pill text-xs px-4 py-1.5"
          >
            Re-engage Viewport
          </button>
        </div>
      );
    }

    return this.props.children;
  }

  private get fallback(): ReactNode {
    return this.props.fallback;
  }
}
