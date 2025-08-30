"use client";
import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Sidebar Error Boundary caught an error:", error, errorInfo);
        
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }
    }

    render() {
        if (this.state.hasError) {
            return (
                this.props.fallback || (
                    <div className="flex h-screen w-full items-center justify-center bg-red-50 dark:bg-red-950">
                        <div className="text-center">
                            <h2 className="text-lg font-semibold text-red-800 dark:text-red-200">
                                Something went wrong
                            </h2>
                            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                                The sidebar encountered an error. Please refresh the page.
                            </p>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-4 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
                            >
                                Refresh Page
                            </button>
                        </div>
                    </div>
                )
            );
        }

        return this.props.children;
    }
}