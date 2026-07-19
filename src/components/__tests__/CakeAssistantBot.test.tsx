// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CakeAssistantBot from '../CakeAssistantBot';

describe('CakeAssistantBot', () => {
  it('renders chat toggle button', () => {
    render(<CakeAssistantBot />);
    expect(screen.getByLabelText('Toggle cake assistant chat')).toBeInTheDocument();
  });
});
