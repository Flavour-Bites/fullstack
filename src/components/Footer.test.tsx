// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Footer from './Footer';

describe('Footer', () => {
  it('renders admin mode footer', () => {
    render(<Footer isAdminMode={true} onNavigate={vi.fn()} />);
    expect(screen.getByText(/Master Staff Portal Active/i)).toBeInTheDocument();
  });

  it('renders public footer with branding', () => {
    render(<Footer isAdminMode={false} onNavigate={vi.fn()} />);
    expect(screen.getByText(/FLAVOUR BITES/i)).toBeInTheDocument();
    expect(screen.getByText('Welcome Salon')).toBeInTheDocument();
    expect(screen.getByText('Meet Yodit Ashenafi')).toBeInTheDocument();
  });

  it('calls onNavigate when a nav link is clicked', async () => {
    const onNavigate = vi.fn();
    render(<Footer isAdminMode={false} onNavigate={onNavigate} />);

    await userEvent.click(screen.getByText('Welcome Salon'));
    expect(onNavigate).toHaveBeenCalledWith('home');
  });

  it('renders social media links', () => {
    render(<Footer isAdminMode={false} onNavigate={vi.fn()} />);
    expect(screen.getByLabelText('Follow us on Telegram')).toBeInTheDocument();
    expect(screen.getByLabelText('Follow us on Instagram')).toBeInTheDocument();
    expect(screen.getByLabelText('Email our concierge')).toBeInTheDocument();
  });
});
