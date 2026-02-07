export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-6">📊 Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Total Users</h2>
          <p className="text-3xl font-bold text-blue-600">1,234</p>
          <p className="text-green-500 mt-2">+12% from last month</p>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Revenue</h2>
          <p className="text-3xl font-bold text-green-600">$45,678</p>
          <p className="text-green-500 mt-2">+8% from last month</p>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Orders</h2>
          <p className="text-3xl font-bold text-purple-600">567</p>
          <p className="text-red-500 mt-2">-3% from last month</p>
        </div>

        {/* Chart Placeholder */}
        <div className="bg-white p-6 rounded-lg shadow-md md:col-span-2 lg:col-span-3">
          <h2 className="text-xl font-semibold mb-4">Analytics</h2>
          <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">📊 Chart goes here</p>
          </div>
        </div>
      </div>
    </div>
  );
}