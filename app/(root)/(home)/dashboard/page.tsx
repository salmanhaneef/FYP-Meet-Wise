import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import DashboardLayout from './components/DashboardLayout';
import UpcomingMeetings from './components/UpcomingMeetings';
import PreviousMeetings from './components/PreviousMeetings';
export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  return (
    <DashboardLayout userId={user.id}>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {user.firstName || 'User'}!</p>
      </div>
       {/* 👇 THIS is what gets rendered in {children} */}
      <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-6">
        {/* Right Side - Upcoming Meetings */}
        <div className="w-full lg:w-1/2 order-2 lg:order-1">
          <UpcomingMeetings userId={user.id} />
        </div>

        {/* Left Side - Previous Meetings */}
        <div className="w-full lg:w-1/2 order-1 lg:order-2">
          <PreviousMeetings userId={user.id} />
        </div>
      </div>
    </DashboardLayout>
  );
}