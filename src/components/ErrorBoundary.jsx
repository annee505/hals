import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-lg w-full text-center"
                    >
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>

                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Something went wrong
                        </h1>

                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            We're sorry for the inconvenience. Please try reloading the page.
                        </p>

                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center mx-auto"
                        >
                            <RefreshCw className="w-5 h-5 mr-2" />
                            Reload Application
                        </button>

                        {process.env.NODE_ENV === 'development' && (
                            <details className="mt-8 text-left bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-auto max-h-48">
                                <summary className="text-xs font-mono text-gray-500 cursor-pointer">Error Details</summary>
                                <pre className="text-xs text-red-600 mt-2 whitespace-pre-wrap">
                                    {this.state.error && this.state.error.toString()}
                                </pre>
                            </details>
                        )}
                    </motion.div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
