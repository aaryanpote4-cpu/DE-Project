import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled React Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetStorage = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/';
    } catch {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
          <div className="max-w-xl w-full bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-400 mb-4">
              <AlertTriangle size={36} />
              <h1 className="text-2xl font-bold text-white">Something Went Wrong</h1>
            </div>

            <p className="text-slate-300 mb-6 leading-relaxed">
              An unexpected error occurred while rendering this view. Your application state has been preserved, but you can reload or clear cached data to recover immediately.
            </p>

            {this.state.error && (
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 mb-6 font-mono text-xs text-rose-300 overflow-x-auto max-h-48">
                <div className="font-semibold text-rose-400 mb-1">
                  {this.state.error.name}: {this.state.error.message}
                </div>
                {this.state.error.stack && (
                  <pre className="text-slate-500 whitespace-pre-wrap">{this.state.error.stack}</pre>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                onClick={this.handleReload}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-medium transition cursor-pointer"
              >
                <RefreshCw size={18} />
                Reload Page
              </button>

              <button
                onClick={() => { window.location.href = '/dashboard'; }}
                className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-5 py-2.5 rounded-xl font-medium transition cursor-pointer"
              >
                <Home size={18} />
                Go to Dashboard
              </button>

              <button
                onClick={this.handleResetStorage}
                className="flex items-center gap-2 bg-rose-900/40 hover:bg-rose-900/60 border border-rose-700/50 text-rose-300 px-4 py-2.5 rounded-xl font-medium transition cursor-pointer ml-auto"
                title="Clears corrupted localStorage cache"
              >
                <Trash2 size={16} />
                Reset Cache
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
