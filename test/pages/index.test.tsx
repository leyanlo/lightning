import React from 'react';

import { Home } from '../../pages';
import { render, screen } from '@testing-library/react';

jest.mock('next/head', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: () => {
    const MockMaze = () => <div data-testid="maze" />;
    MockMaze.displayName = 'MockMaze';
    return MockMaze;
  },
}));

describe('Home page', () => {
  it('renders the maze, repository link, and canonical URL', () => {
    render(<Home />);

    expect(screen.getByTestId('maze')).toBeTruthy();

    const repositoryLink = screen.getByRole('link', { name: 'GitHub Logo' });
    expect(repositoryLink.getAttribute('href')).toBe(
      'https://github.com/leyanlo/lightning',
    );
    expect(repositoryLink.getAttribute('target')).toBe('_blank');

    expect(
      document.head
        .querySelector('link[rel="canonical"]')
        ?.getAttribute('href'),
    ).toBe('https://lightning.leyanlo.com/');
    expect(
      document.head
        .querySelector('meta[property="og:url"]')
        ?.getAttribute('content'),
    ).toBe('https://lightning.leyanlo.com/');
  });
});
