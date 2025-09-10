import { render, screen } from '@testing-library/react';
import App from './App';

test('renders points counter', () => {
  render(<App />);
  const pointsElement = screen.getByText(/points:/i);
  expect(pointsElement).toBeInTheDocument();
});
