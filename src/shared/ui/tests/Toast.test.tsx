// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider, useToast, ToastType } from '@/shared/ui/Toast';

afterEach(() => {
  cleanup();
});

function ToastTrigger({ title, description, type }: { title: string; description: string; type?: ToastType }) {
  const { showToast } = useToast();
  return <button onClick={() => showToast(title, description, type)}>Show</button>;
}

describe('useToast', () => {
  it('throws when used outside ToastProvider', () => {
    expect(() => render(<ToastTrigger title="x" description="y" />)).toThrow(
      'useToast must be used within a ToastProvider'
    );
  });
});

describe('ToastProvider', () => {
  it('renders a toast when showToast is called', async () => {
    render(
      <ToastProvider>
        <ToastTrigger title="Done" description="Operation completed" />
      </ToastProvider>
    );

    await userEvent.click(screen.getByText('Show'));
    expect(screen.getByText('Done')).toBeInTheDocument();
    expect(screen.getByText('Operation completed')).toBeInTheDocument();
  });

  it('renders multiple toasts', async () => {
    render(
      <ToastProvider>
        <ToastTrigger title="One" description="First" />
      </ToastProvider>
    );

    const btn = screen.getByText('Show');
    await userEvent.click(btn);
    await userEvent.click(btn);

    expect(screen.getAllByText('First')).toHaveLength(2);
  });

  it('shows a dismiss button with correct aria-label', async () => {
    render(
      <ToastProvider>
        <ToastTrigger title="Dismiss me" description="gone" />
      </ToastProvider>
    );

    await userEvent.click(screen.getByText('Show'));
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
  });

  it.each(['success', 'error', 'warning', 'info', 'majestic'] as ToastType[])('renders %s toast type', async (type) => {
    render(
      <ToastProvider>
        <ToastTrigger title={type} description={`${type} toast`} type={type} />
      </ToastProvider>
    );

    await userEvent.click(screen.getByText('Show'));
    expect(screen.getByText(type)).toBeInTheDocument();
    expect(screen.getByText(`${type} toast`)).toBeInTheDocument();
  });
});
