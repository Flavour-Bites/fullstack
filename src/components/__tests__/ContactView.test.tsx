// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import ContactView from '../ContactView';

describe('ContactView', () => {
  it('renders contact form', () => {
    render(<ContactView />);
    expect(screen.getByText('Contact Us')).toBeInTheDocument();
  });

  it('renders delivery calculator', () => {
    render(<ContactView />);
    expect(screen.getByText('Sub-City Logistic Lookup')).toBeInTheDocument();
  });

  it('renders FAQ section', () => {
    render(<ContactView />);
    expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument();
  });
});
