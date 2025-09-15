import { Button } from './Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './Components/ui/card';
import { Input } from './Components/ui/input';
import { User } from './Entities/User';
import { CheckCircle, Mail, Phone, ShieldAlert } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        address: { street: '', city: '', state: '', zip: '' },
        is_email_verified: false,
        is_phone_verified: false,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const currentUser = await User.me();
                setUser(currentUser);
                setFormData({
                    full_name: currentUser.full_name || '',
                    email: currentUser.email || '',
                    phone: currentUser.phone || '',
                    address: currentUser.address || { street: '', city: '', state: '', zip: '' },
                    is_email_verified: currentUser.is_email_verified || false,
                    is_phone_verified: currentUser.is_phone_verified || false,
                });
            } catch (error) {
                // Not logged in, redirect or handle
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            address: { ...prev.address, [name]: value }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await User.updateMyUserData({
                full_name: formData.full_name,
                phone: formData.phone,
                address: formData.address
            });
            toast.success('Profile updated successfully!');
        } catch (error) {
            console.error('Failed to update profile:', error);
            toast.error('Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-8">Loading profile...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>
            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>Update your personal details and manage account verification.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <Input id="full_name" name="full_name" value={formData.full_name} onChange={handleInputChange} />
                        </div>

                        <div className="space-y-2">
                             <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                             <div className="flex items-center gap-4">
                                <div className="relative flex-grow">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input id="email" name="email" value={formData.email} disabled className="pl-10" />
                                </div>
                                {formData.is_email_verified ? (
                                     <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                                        <CheckCircle className="w-5 h-5"/>
                                        <span>Verified</span>
                                    </div>
                                ) : (
                                    <Button type="button" variant="outline" size="sm" disabled>Verify Email</Button>
                                )}
                             </div>
                        </div>

                        <div className="space-y-2">
                             <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                             <div className="flex items-center gap-4">
                                <div className="relative flex-grow">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="e.g., +1 555-123-4567" className="pl-10"/>
                                </div>
                                {formData.is_phone_verified ? (
                                    <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                                        <CheckCircle className="w-5 h-5"/>
                                        <span>Verified</span>
                                    </div>
                                ) : (
                                    <Button type="button" variant="outline" size="sm" disabled>Verify Phone</Button>
                                )}
                             </div>
                              {!formData.is_email_verified && !formData.is_phone_verified && (
                                <div className="flex items-start gap-2 p-3 bg-yellow-50 text-yellow-800 rounded-lg">
                                    <ShieldAlert className="w-5 h-5 mt-0.5"/>
                                    <p className="text-sm">Account verification is recommended for faster checkout and enhanced security. Full OTP functionality requires an integration not yet enabled.</p>
                                </div>
                             )}
                        </div>
                        
                        <div className="border-t pt-6">
                            <h3 className="text-lg font-medium mb-4">Shipping Address</h3>
                            <div className="space-y-4">
                                <Input name="street" placeholder="Street Address" value={formData.address.street} onChange={handleAddressChange} />
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Input name="city" placeholder="City" value={formData.address.city} onChange={handleAddressChange} />
                                    <Input name="state" placeholder="State" value={formData.address.state} onChange={handleAddressChange} />
                                    <Input name="zip" placeholder="ZIP Code" value={formData.address.zip} onChange={handleAddressChange} />
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={saving}>
                                {saving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}