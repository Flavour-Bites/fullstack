// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Footer from '../Footer';

describe('Footer', () => {
  it('renders admin mode footer', () => {
    render(<Footer isAdminMode={true} onNavigate={vi.fn()} />);
    expect(screen.getByText(/Staff Portal Active/i)).toBeInTheDocument();
  });

  it('renders public footer with branding', () => {
    render(<Footer isAdminMode={false} onNavigate={vi.fn()} />);
    expect(screen.getByText(/FLAVOUR BITES/i)).toBeInTheDocument();
    expect(screen.getByText('Commission Your Cake')).toBeInTheDocument();
  });

  it('calls onNavigate when CTA is clicked', async () => {
    const onNavigate = vi.fn();
    render(<Footer isAdminMode={false} onNavigate={onNavigate} />);

    await userEvent.click(screen.getByText('Commission Your Cake'));
    expect(onNavigate).toHaveBeenCalledWith('request');
  });

  it('renders quick links', () => {
    render(<Footer isAdminMode={false} onNavigate={vi.fn()} />);
    expect(screen.getByText('Gallery')).toBeInTheDocument();
    expect(screen.getByText('About Yodit')).toBeInTheDocument();
    expect(screen.getByText('Reviews')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  it('renders social media links', () => {
    render(<Footer isAdminMode={false} onNavigate={vi.fn()} />);
    expect(screen.getByLabelText('Follow on Telegram')).toBeInTheDocument();
    expect(screen.getByLabelText('Follow on Instagram')).toBeInTheDocument();
    expect(screen.getByLabelText('Email us')).toBeInTheDocument();
  });

  it('renders info cards', () => {
    render(<Footer isAdminMode={false} onNavigate={vi.fn()} />);
    expect(screen.getByText('Studio Location')).toBeInTheDocument();
    expect(screen.getByText('Response Time')).toBeInTheDocument();
    expect(screen.getByText('Within 24 hours')).toBeInTheDocument();
  });
});
