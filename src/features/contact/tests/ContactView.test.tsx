// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ContactView from '@/features/contact/components/ContactView';

describe('ContactView', () => {
  it('renders contact form', () => {
    render(<ContactView />);
    expect(screen.getByText('Contact Us')).toBeInTheDocument();
  });

  it('renders Help page link banner', () => {
    render(<ContactView />);
    expect(screen.getByText('Have specific questions?')).toBeInTheDocument();
  });
});
