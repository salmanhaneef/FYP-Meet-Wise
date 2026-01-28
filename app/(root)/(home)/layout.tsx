import { ReactNode } from 'react';
import { Metadata } from 'next';


// import Navbar from '@/components/dashboard/Navbar';
// import Sidebar from '@/components/dashboard/Sidebar';

export const metadata: Metadata = {
  title: 'MeetWise - Team Workspace',
  description: 'A workspace for your team, powered by Stream Chat and Clerk.',
};

// import StreamVideoProvider from '@/providers/StreamClientProvider';

const RootLayout = ({ children }: Readonly<{ children: ReactNode }>) => {
  return (
    <main>
        dashboard
      {/* <StreamVideoProvider>{children}</StreamVideoProvider> */}
    </main>
    
  );
};

export default RootLayout;