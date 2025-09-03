import React, { Component } from 'react';
import { AlertTriangle } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
    
    // You could also log to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-500 p-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6 max-w-md w-full">
            <div className="flex flex-col items-center text-center">
              <div className="bg-red-500/20 p-4 rounded-full mb-4">
                <AlertTriangle size={48} className="text-red-400" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Something went wrong</h2>
              <p className="text-white/70 mb-6">
                We're sorry, but an error occurred while rendering this component.
              </p>
              
              {this.props.showDetails && (
                <div className="bg-white/5 rounded-lg p-4 mb-6 w-full overflow-auto text-left">
                  <p className="text-red-300 text-sm font-mono mb-2">
                    {this.state.error && this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <details className="text-white/50 text-xs font-mono">
                      <summary className="cursor-pointer text-white/70 mb-1">Stack trace</summary>
                      <pre>{this.state.errorInfo.componentStack}</pre>
                    </details>
                  )}
                </div>
              )}
              
              <div className="flex gap-4">
                <button
                  onClick={this.handleReset}
                  className="bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Reload Page
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // If no error, render children normally
    return this.props.children;
  }
}

ErrorBoundary.defaultProps = {
  showDetails: process.env.NODE_ENV === 'development'
};

export default ErrorBoundary;

