// src/components/Profile.js
import React from 'react';

function Profile({ user }) {
  return (
    <div className="p-4">
      <h3 className="text-xl font-semibold mb-2">👤 Profile</h3>
      <div className="space-y-2">
        <p><span className="font-semibold">Name:</span> {user?.name || '-'}</p>
        <p><span className="font-semibold">Email:</span> {user?.email || '-'}</p>
        {/* add change password or edit later */}
      </div>
    </div>
  );
}

export default Profile;
