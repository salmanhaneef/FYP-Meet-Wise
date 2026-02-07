export default function ProfilePage() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-6">👤 Profile</h1>
      
      <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
        {/* Profile Header */}
        <div className="flex items-center mb-8">
          <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-4xl text-white">JD</span>
          </div>
          <div className="ml-6">
            <h2 className="text-2xl font-bold">John Doe</h2>
            <p className="text-gray-600">john@example.com</p>
            <p className="text-sm text-gray-500 mt-1">Member since January 2024</p>
          </div>
        </div>

        {/* Profile Info */}
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b pb-4">
            <span className="text-gray-700 font-medium">Role</span>
            <span className="text-blue-600 font-semibold">Administrator</span>
          </div>

          <div className="flex justify-between items-center border-b pb-4">
            <span className="text-gray-700 font-medium">Status</span>
            <span className="text-green-600 font-semibold">Active</span>
          </div>

          <div className="flex justify-between items-center border-b pb-4">
            <span className="text-gray-700 font-medium">Last Login</span>
            <span className="text-gray-900">Today at 10:30 AM</span>
          </div>

          <div className="flex justify-between items-center pb-4">
            <span className="text-gray-700 font-medium">Account Type</span>
            <span className="text-purple-600 font-semibold">Premium</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <button className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Edit Profile
          </button>
          <button className="flex-1 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
            Change Password
          </button>
        </div>
      </div>
    </div>
  );
}