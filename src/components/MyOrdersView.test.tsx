// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import React from 'react';
import MyOrdersView from './MyOrdersView';

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(new Response('{"success":true,"requests":[]}'))));
});

afterEach(() => {
  vi.unstubAllGlobals();
  cleanup();
});

describe('MyOrdersView', () => {
  it('renders page title', () => {
    render(<MyOrdersView />);
    expect(screen.getByText('Order Updates')).toBeInTheDocument();
  });
});
