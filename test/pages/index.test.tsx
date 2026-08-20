import React from 'react';

import { Home } from '../../pages';
import { render, screen } from '@testing-library/react';

jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: () => {
    const MockMaze = () => <div data-testid="maze" />;
    MockMaze.displayName = 'MockMaze';
    return MockMaze;
  },
}));

describe('Home page', () => {
  it('renders the maze and repository link', () => {
    render(<Home />);

    expect(screen.getByTestId('maze')).toBeTruthy();

    const repositoryLink = screen.getByRole('link', { name: 'GitHub Logo' });
    expect(repositoryLink.getAttribute('href')).toBe(
      'https://github.com/leyanlo/lightning',
    );
    expect(repositoryLink.getAttribute('target')).toBe('_blank');
  });
});
