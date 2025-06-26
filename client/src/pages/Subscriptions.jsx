// client/src/pages/Subscriptions.jsx
import React, { useState } from 'react';
import NavbarStudent from '../components/NavbarStudent';
import NavbarInstructor from '../components/NavbarInstructor';
import NavbarAdmin from '../components/NavbarAdmin';

const Subscriptions = () => {
  const role = localStorage.getItem('role');
  const [plan, setPlan] = useState('');
  const [coupon, setCoupon] = useState('');
  const [referral, setReferral] = useState('');

  const handleSubscribe = () => {
    if (!plan) return alert('Please select a plan');
    alert(`Subscribed to ${plan} plan!`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {role === 'student' && <NavbarStudent />}
      {role === 'instructor' && <NavbarInstructor />}
      {role === 'admin' && <NavbarAdmin />}

      <div className="max-w-3xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">📅 Choose Your Subscription</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {['Monthly', 'Quarterly', 'Yearly'].map((p) => (
            <div
              key={p}
              className={`p-4 border rounded cursor-pointer text-center font-medium transition ${
                plan === p ? 'bg-blue-100 border-blue-600' : 'bg-white'
              }`}
              onClick={() => setPlan(p)}
            >
              {p} Plan
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Referral Code (optional)"
            value={referral}
            onChange={(e) => setReferral(e.target.value)}
            className="w-full border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Coupon Code (optional)"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            className="w-full border p-2 rounded"
          />
          <button
            onClick={handleSubscribe}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 w-full"
          >
            Subscribe Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default Subscriptions;
