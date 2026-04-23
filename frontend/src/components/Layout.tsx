import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-14 min-h-screen">
        <div className="max-w-screen-xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
