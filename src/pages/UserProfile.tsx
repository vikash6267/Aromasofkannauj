
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Layout from '@/components/layout/Layout';
import OrderList from '@/components/user/OrderList';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '@/store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store';

const UserProfile = () => {
  const user = useSelector((state: RootState) => state.auth?.user) || JSON.parse(localStorage.getItem('perfume-user') || '{}');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [address, setAddress] = useState({
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zip: user?.address?.zip || '',
    country: user?.address?.country || 'India'
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?._id) return;
    
    try {
      setSaving(true);
      import('@/services/api').then(async ({ userAPI }) => {
        const response = await userAPI.updateProfile(user._id, {
          name: profile.name,
          phone: profile.phone
        });
        if (response.success) {
          import('@/store/slices/authSlice').then(({ updateUser }) => {
            dispatch(updateUser(response.user));
          });
          alert('Profile information saved successfully!');
        }
      });
    } catch (error) {
      console.error('Failed to save profile', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?._id) return;
    
    try {
      setSaving(true);
      import('@/services/api').then(async ({ userAPI }) => {
        const response = await userAPI.updateAddress(user._id, address);
        if (response.success) {
          import('@/store/slices/authSlice').then(({ updateUser }) => {
            dispatch(updateUser(response.user));
          });
          alert('Address saved successfully!');
        }
      });
    } catch (error) {
      console.error('Failed to save address', error);
      alert('Failed to save address. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="container-custom py-8">
        <h1 className="text-3xl font-serif font-bold mb-6">My Account</h1>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="addresses">Addresses</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Manage your account details</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        name="name"
                        value={profile.name}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        name="email"
                        type="email"
                        value={profile.email}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input 
                        id="phone" 
                        name="phone"
                        value={profile.phone}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-4">
                    <Button onClick={handleSaveProfile} disabled={saving}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button variant="destructive" type="button" onClick={handleLogout}>Logout</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="orders">
            <OrderList />
          </TabsContent>
          
        <TabsContent value="addresses">
            <Card>
              <CardHeader>
                <CardTitle>Your Default Address</CardTitle>
                <CardDescription>This address will be pre-filled at checkout</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveAddress} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="street">Street Address</Label>
                      <Input 
                        id="street" 
                        name="street"
                        value={address.street}
                        onChange={handleAddressChange}
                        placeholder="123 Main Street, Apartment 4B"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input 
                        id="city" 
                        name="city"
                        value={address.city}
                        onChange={handleAddressChange}
                        placeholder="New Delhi"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input 
                        id="state" 
                        name="state"
                        value={address.state}
                        onChange={handleAddressChange}
                        placeholder="Delhi"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zip">ZIP / Postal Code</Label>
                      <Input 
                        id="zip" 
                        name="zip"
                        value={address.zip}
                        onChange={handleAddressChange}
                        placeholder="110001"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input 
                        id="country" 
                        name="country"
                        value={address.country}
                        onChange={handleAddressChange}
                        disabled
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button type="submit" disabled={saving}>
                      {saving ? 'Saving...' : 'Save Default Address'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default UserProfile;
