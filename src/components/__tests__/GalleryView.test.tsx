// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import GalleryView from '../GalleryView';

afterEach(() => {
  cleanup();
});

const noop = () => {};

describe('GalleryView', () => {
  it('renders filter category buttons', () => {
    render(
      <GalleryView
        selectedCake={null}
        onClearSelectedCake={noop}
        onSelectCake={noop}
        onCommissionCake={noop}
      />
    );
    expect(screen.getByText('All Collections')).toBeInTheDocument();
    expect(screen.getByText('Bespoke Celebrations')).toBeInTheDocument();
    expect(screen.getByText('Elite Birthdays')).toBeInTheDocument();
  });
});
