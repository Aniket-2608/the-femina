import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../store/index.js';
import {
  useUpdateProfileMutation,
  useAddAddressMutation,
  useDeleteAddressMutation,
} from '../../../store/api/apiSlice.js';
import { updateUserProfile } from '../../../store/slices/authSlice.js';
import { addToast } from '../../../store/slices/uiSlice.js';
import { Button } from '../../../components/common/Button.js';
import {
  User as UserIcon,
  Mail,
  Phone,
  CheckCircle2,
  MapPin,
  Trash2,
  Plus,
  ShieldCheck,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [showAddAddress, setShowAddAddress] = useState(false);

  const [newAddress, setNewAddress] = useState({
    fullName: user ? `${user.firstName} ${user.lastName}` : '',
    phone: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [updateProfileMutation, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();
  const [addAddressMutation, { isLoading: isAddingAddress }] = useAddAddressMutation();
  const [deleteAddressMutation] = useDeleteAddressMutation();

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await updateProfileMutation({ firstName, lastName }).unwrap();
      dispatch(updateUserProfile(res.data.user));
      dispatch(addToast({ type: 'success', message: 'Profile updated successfully.' }));
    } catch {
      dispatch(addToast({ type: 'error', message: 'Failed to update profile.' }));
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await addAddressMutation(newAddress).unwrap();
      if (user) {
        dispatch(updateUserProfile({ ...user, savedAddresses: res.data.savedAddresses }));
      }
      setShowAddAddress(false);
      setNewAddress({
        fullName: user ? `${user.firstName} ${user.lastName}` : '',
        phone: user?.phone || '',
        addressLine1: '',
        addressLine2: '',
        landmark: '',
        city: '',
        state: '',
        pincode: '',
      });
      dispatch(addToast({ type: 'success', message: 'New address added to your address book.' }));
    } catch {
      dispatch(addToast({ type: 'error', message: 'Failed to add address.' }));
    }
  };

  const handleDeleteAddress = async (id?: string) => {
    if (!id) return;
    try {
      const res = await deleteAddressMutation(id).unwrap();
      if (user) {
        dispatch(updateUserProfile({ ...user, savedAddresses: res.data.savedAddresses }));
      }
      dispatch(addToast({ type: 'info', message: 'Address removed.' }));
    } catch {
      dispatch(addToast({ type: 'error', message: 'Failed to remove address.' }));
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <span className="text-xs font-bold text-femina-700 tracking-[0.25em] uppercase">Private Atelier</span>
        <h1 className="font-serif text-3xl font-bold text-luxury-dark mt-1">My Profile</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Personal Information & Verification Status */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-femina-200 shadow-luxury space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-luxury-wine text-white flex items-center justify-center font-serif text-xl font-bold shadow-md">
                {user.firstName[0]}
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-luxury-dark">
                  {user.firstName} {user.lastName}
                </h3>
                <span className="text-xs text-gray-500 capitalize">{user.role.replace('_', ' ')}</span>
              </div>
            </div>

            {/* Verification Status Pills */}
            <div className="space-y-2 pt-4 border-t border-femina-100">
              <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-femina-50 border border-femina-200">
                <span className="flex items-center gap-2 text-gray-700">
                  <Mail className="w-4 h-4 text-femina-600" />
                  <span className="truncate max-w-[130px]">{user.email}</span>
                </span>
                {user.isEmailVerified ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                  </span>
                ) : (
                  <span className="text-amber-700 font-bold text-[11px]">Pending</span>
                )}
              </div>

              <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-femina-50 border border-femina-200">
                <span className="flex items-center gap-2 text-gray-700">
                  <Phone className="w-4 h-4 text-femina-600" />
                  <span>{user.phone}</span>
                </span>
                {user.isPhoneVerified ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                  </span>
                ) : (
                  <span className="text-amber-700 font-bold text-[11px]">Pending</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Columns: Edit Info & Address Book */}
        <div className="md:col-span-2 space-y-6">
          {/* 1. Edit Name Form */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-femina-200 shadow-luxury space-y-4">
            <h3 className="font-serif text-base font-bold text-luxury-wine uppercase tracking-wider">
              Personal Information
            </h3>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-femina-50/50 border border-femina-200 rounded-xl text-xs focus:outline-none focus:border-luxury-wine"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-femina-50/50 border border-femina-200 rounded-xl text-xs focus:outline-none focus:border-luxury-wine"
                  />
                </div>
              </div>
              <Button type="submit" variant="primary" size="sm" isLoading={isUpdatingProfile}>
                Save Changes
              </Button>
            </form>
          </div>

          {/* 2. Address Book */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-femina-200 shadow-luxury space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-luxury-wine" />
                <h3 className="font-serif text-base font-bold text-luxury-wine uppercase tracking-wider">
                  Saved Address Book
                </h3>
              </div>
              {!showAddAddress && (
                <button
                  type="button"
                  onClick={() => setShowAddAddress(true)}
                  className="text-xs font-semibold text-luxury-wine hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Address
                </button>
              )}
            </div>

            {/* List of Saved Addresses */}
            {user.savedAddresses?.length > 0 ? (
              <div className="space-y-3">
                {user.savedAddresses.map((addr) => (
                  <div
                    key={addr._id}
                    className="flex items-start justify-between p-4 rounded-2xl border border-femina-200 bg-femina-50/40 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-luxury-dark">{addr.fullName} ({addr.phone})</div>
                      <div className="text-gray-600">
                        {addr.addressLine1}, {addr.addressLine2 ? `${addr.addressLine2}, ` : ''}
                        {addr.city}, {addr.state} — <strong>{addr.pincode}</strong>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteAddress(addr._id)}
                      className="text-gray-400 hover:text-rose-600 p-1.5 transition-colors"
                      title="Delete Address"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500">No addresses saved yet.</p>
            )}

            {/* Add Address Form Modal / Inline */}
            {showAddAddress && (
              <form onSubmit={handleAddAddress} className="p-4 bg-femina-50 rounded-2xl border border-femina-200 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-700 uppercase mb-1">
                      Recipient Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newAddress.fullName}
                      onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-femina-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-700 uppercase mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      required
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-femina-200 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-700 uppercase mb-1">
                    Address Line
                  </label>
                  <input
                    type="text"
                    required
                    value={newAddress.addressLine1}
                    onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-femina-200 rounded-lg text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-700 uppercase mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-femina-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-700 uppercase mb-1">State</label>
                    <input
                      type="text"
                      required
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-femina-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-700 uppercase mb-1">Pincode</label>
                    <input
                      type="text"
                      required
                      value={newAddress.pincode}
                      onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-femina-200 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button type="submit" variant="primary" size="sm" isLoading={isAddingAddress}>
                    Save Address
                  </Button>
                  <button
                    type="button"
                    onClick={() => setShowAddAddress(false)}
                    className="text-xs text-gray-500 hover:text-luxury-wine"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
