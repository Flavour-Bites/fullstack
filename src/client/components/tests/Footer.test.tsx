// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Footer from '@client/components/Footer';

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('Footer', () => {
  it('renders public footer with branding', () => {
    renderWithRouter(<Footer />);
    expect(screen.getAllByText(/FLAVOUR/i).length).toBeGreaterThan(0);
    expect(screen.getByText('Commission Your Cake')).toBeInTheDocument();
  });

  it('renders quick links', () => {
    renderWithRouter(<Footer />);
    expect(screen.getByText('Gallery')).toBeInTheDocument();
    expect(screen.getByText('About Yodit')).toBeInTheDocument();
    expect(screen.getByText('Reviews')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  it('renders social media links', () => {
    renderWithRouter(<Footer />);
    expect(screen.getByLabelText('Follow on Telegram')).toBeInTheDocument();
    expect(screen.getByLabelText('Follow on Instagram')).toBeInTheDocument();
    expect(screen.getByLabelText('Email us')).toBeInTheDocument();
  });

  it('renders info cards', () => {
    renderWithRouter(<Footer />);
    expect(screen.getByText('Studio Location')).toBeInTheDocument();
    expect(screen.getByText('Response Time')).toBeInTheDocument();
    expect(screen.getByText('Within 24 hours')).toBeInTheDocument();
  });
});
