// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import AboutView from '../AboutView';

describe('AboutView', () => {
  it('renders hero section', () => {
    render(<AboutView />);
    expect(screen.getByText('Yodit Ashenafi')).toBeInTheDocument();
    expect(screen.getByText(/Baking Custom Cakes with Love/)).toBeInTheDocument();
  });

  it('renders highlights block', () => {
    render(<AboutView />);
    expect(screen.getByText('Authentic Recipes')).toBeInTheDocument();
    expect(screen.getByText('Custom Decorations')).toBeInTheDocument();
  });

  it('renders ingredient selectors', () => {
    render(<AboutView />);
    expect(screen.getAllByText('Our Ingredients').length).toBe(2);
  });

  it('renders studio ethos section', () => {
    render(<AboutView />);
    expect(screen.getByText('The Studio Ethos')).toBeInTheDocument();
  });

  it('switches ingredient spotlight on click', async () => {
    const user = userEvent.setup();
    render(<AboutView />);
    const secondIngredient = screen.getAllByRole('button')[1];
    await user.click(secondIngredient);
    expect(secondIngredient).toHaveClass('bg-stone-850');
  });
});
