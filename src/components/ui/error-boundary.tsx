"use client";

import { Component, type ReactNode } from "react";
import { Button } from "./button";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error internally but never expose to users
    console.error("[ErrorBoundary]", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-brand-gold-400 mx-auto mb-4" />
            <h2 className="font-heading text-xl font-bold text-charcoal dark:text-cream mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-charcoal/60 dark:text-cream/60 mb-4">
              An unexpected error occurred. Please try again.
            </p>
            <Button onClick={() => this.setState({ hasError: false })} variant="outline" size="sm">
              Try again
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
