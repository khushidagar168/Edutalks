// client/src/pages/Profile.jsx
import React, { useState } from 'react';
import NavbarStudent from '../components/NavbarStudent';
import NavbarInstructor from '../components/NavbarInstructor';
import NavbarAdmin from '../components/NavbarAdmin';

const Profile = () => {
  const [image, setImage] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [goals, setGoals] = useState('');
  const [referralCode] = useState('EDU12345');
  const [wallet, setWallet] = useState(150); // mock balance
  const [subscription] = useState({ plan: 'Monthly', renew: '2025-07-01' });

  const role = localStorage.getItem('role');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImage(URL.createObjectURL(file));
  };

  return (
    <div className="min-h-screen bg-gray-100">

      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6">Your Profile</h2>
        <div className="bg-white p-6 rounded shadow space-y-6">
          {/* Profile Image */}
          <div className="flex items-center gap-4">
            <img
              src={image || 'https://via.placeholder.com/80'}
              alt="profile"
              className="w-20 h-20 rounded-full object-cover"
            />
            <input type="file" accept="image/*" onChange={handleImageChange} />
          </div>

          {/* User Info */}
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border p-2 rounded"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-2 rounded"
          />
          <textarea
            placeholder="Short Bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full border p-2 rounded"
          />
          <textarea
            placeholder="Learning Goals"
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            className="w-full border p-2 rounded"
          />
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Save Changes
          </button>

          {/* Referral and Wallet */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border p-4 rounded">
              <h4 className="font-semibold mb-2">Referral Code</h4>
              <p className="text-gray-700">{referralCode}</p>
            </div>
            <div className="border p-4 rounded">
              <h4 className="font-semibold mb-2">Wallet Balance</h4>
              <p className="text-green-600 font-bold">₹{wallet}</p>
              <div className="flex gap-2 mt-2">
                <button className="bg-green-500 text-white px-3 py-1 rounded">Withdraw</button>
                <button className="bg-blue-500 text-white px-3 py-1 rounded">Use for Courses</button>
              </div>
            </div>
          </div>

          {/* Subscription Info */}
          <div className="border p-4 rounded">
            <h4 className="font-semibold mb-2">Subscription</h4>
            <p>Current Plan: {subscription.plan}</p>
            <p>Renew Date: {subscription.renew}</p>
          </div>

          {/* Account Security */}
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-2">Account Security</h4>
            <button className="text-blue-600 underline">Change Password</button>
            <br />
            <button className="text-red-500 underline mt-2">Delete Account</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
