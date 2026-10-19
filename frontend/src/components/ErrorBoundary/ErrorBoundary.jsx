import React from 'react';
import Button from '../Button/Button';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="my-4 rounded-2xl border border-border-soft bg-surface-alt p-6 text-brand-text shadow-sm" role="alert">
          <h3 className="m-0 text-lg font-bold text-danger">
            {this.props.title || 'Сталася помилка відображення'}
          </h3>
          <p className="mt-2 text-[14px] leading-relaxed text-muted">
            {this.props.message ||
              'Не вдалося відобразити цей розділ. Ваші збережені дані не втрачено.'}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button size="sm" variant="secondary" onClick={this.handleReset}>
              Спробувати знову
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => window.location.reload()}
            >
              Оновити сторінку
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

