import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("[MAITRI] ErrorBoundary caught an error", error, info);
  }

  render() {
    if (this.state.hasError) {
      return "Something went wrong. Check console.";
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
