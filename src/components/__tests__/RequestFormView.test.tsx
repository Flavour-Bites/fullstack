// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { ToastProvider } from '../Toast';
import RequestFormView from '../RequestFormView';

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(new Response('{"success":true}'))));
});

afterEach(() => {
  vi.unstubAllGlobals();
  cleanup();
});

describe('RequestFormView', () => {
  it('renders request form', () => {
    render(
      <ToastProvider>
        <RequestFormView prefilledCake={null} onClearPrefilledCake={vi.fn()} />
      </ToastProvider>
    );
    expect(screen.getByText('Request a Custom Cake')).toBeInTheDocument();
  });
});
