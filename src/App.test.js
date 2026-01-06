import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';

let queryClient;

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false
    })
  });
});

beforeEach(() => {
  sessionStorage.setItem('pubg-intro-dismissed', 'true');
  queryClient = new QueryClient();
});

afterEach(() => {
  queryClient.clear();
});

test('renders app header brand within router', () => {
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>
  );

  const brand = screen.getByText(/tktk clan/i);
  expect(brand).toBeInTheDocument();
});
