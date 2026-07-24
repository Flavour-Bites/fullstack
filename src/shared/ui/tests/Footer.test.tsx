// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Footer from '@/shared/ui/Footer';

describe('Footer', () => {
  it('renders admin mode footer', () => {
    render(<Footer isAdminMode={true} />);
    expect(screen.getByText(/Staff Portal Active/i)).toBeInTheDocument();
  });

  it('renders public footer with branding', () => {
    render(<Footer isAdminMode={false} />);
    expect(screen.getByText(/FLAVOUR BITES/i)).toBeInTheDocument();
    expect(screen.getByText('Commission Your Cake')).toBeInTheDocument();
  });

  

  it('renders quick links', () => {
    render(<Footer isAdminMode={false} />);
    expect(screen.getByText('Gallery')).toBeInTheDocument();
    expect(screen.getByText('About Yodit')).toBeInTheDocument();
    expect(screen.getByText('Reviews')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  it('renders social media links', () => {
    render(<Footer isAdminMode={false} />);
    expect(screen.getByLabelText('Follow on Telegram')).toBeInTheDocument();
    expect(screen.getByLabelText('Follow on Instagram')).toBeInTheDocument();
    expect(screen.getByLabelText('Email us')).toBeInTheDocument();
  });

  it('renders info cards', () => {
    render(<Footer isAdminMode={false} />);
    expect(screen.getByText('Studio Location')).toBeInTheDocument();
    expect(screen.getByText('Response Time')).toBeInTheDocument();
    expect(screen.getByText('Within 24 hours')).toBeInTheDocument();
  });
});
