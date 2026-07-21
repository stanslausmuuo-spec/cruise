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
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
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
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <Button onClick={() => this.setState({ hasError: false, error: null })} variant="outline" size="sm">
              Try again
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
