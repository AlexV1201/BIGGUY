import { RouterProvider } from 'react-router';
import { router } from './routes';
import { UserProvider } from '../contexts/UserContext';
import { Toaster } from './components/ui/sonner';

export default function App() {
  return (
    <UserProvider>
      <RouterProvider router={router} />
      <Toaster />
    </UserProvider>
  );
}