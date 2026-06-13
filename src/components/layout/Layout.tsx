import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex-1 min-w-0 overflow-x-hidden flex flex-col">
        <Header onMenuClick={() => setMobileOpen(true)} />
        <div className="pt-16 lg:pt-0 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
