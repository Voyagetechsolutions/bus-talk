import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ error, errorInfo });
    
    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-primary flex items-center justify-center p-4">
          <div className="card max-w-lg w-full text-center">
            <div className="text-6xl mb-4">🚌💥</div>
            <h1 className="text-2xl font-bold mb-4 text-accent-red">
              Oops! Something went wrong
            </h1>
            <p className="text-gray-400 mb-6">
              The bus hit a bump in the road. Don't worry, we're working to fix it!
            </p>
            
            <div className="space-y-4">
              <button
                onClick={() => window.location.reload()}
                className="btn-primary w-full"
              >
                🔄 Reload Page
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="btn-secondary w-full"
              >
                🏠 Go Home
              </button>
            </div>
            
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-accent-yellow">
                  Show Error Details (Dev Mode)
                </summary>
                <div className="mt-4 p-4 bg-gray-800 rounded text-xs overflow-auto">
                  <pre className="text-red-400">
                    {this.state.error?.toString()}
                  </pre>
                  <pre className="text-gray-400 mt-2">
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;