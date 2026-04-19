'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    ccId: '',
    ccExpiration: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('firstName, lastName, address, ccId')
          .eq('email', user.email)
          .maybeSingle();

        if (error) throw error;

        let existingExpiration = '';
        if (data?.ccId) {
          const { data: ccData } = await supabase
            .from('creditcards')
            .select('expiration')
            .eq('id', data.ccId)
            .maybeSingle();
            
          if (ccData?.expiration) {
            existingExpiration = ccData.expiration;
          }
        }

        if (data) {
          setFormData({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            address: data.address || '',
            ccId: data.ccId || '',
            ccExpiration: existingExpiration
          });
        }
      } catch (err: unknown) {
        console.error("Profile fetch error:", err);
        setError(`Failed to load profile details: ${(err instanceof Error ? err.message : (typeof err === "object" && err !== null && "message" in err ? String((err as Record<string, unknown>).message) : String(err))) || JSON.stringify(err)}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSaving(true);
    setMessage('');
    setError('');

    try {
      // 1. Upsert Custom Credit Card row natively since ID is the primary key
      const { error: ccError } = await supabase
        .from('creditcards')
        .upsert([{
          id: formData.ccId,
          firstName: formData.firstName,
          lastName: formData.lastName,
          expiration: formData.ccExpiration
        }]);
        
      if (ccError) throw new Error('Failed to cache credit card backend link');

      // 2. Fetch existing customer to avoid inserting duplicate rows since email isn't the primary key
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('email', user.email)
        .maybeSingle();

      if (existingCustomer) {
         // Update existing profile securely
         const { error: updateError } = await supabase
           .from('customers')
           .update({
             firstName: formData.firstName,
             lastName: formData.lastName,
             address: formData.address,
             ccId: formData.ccId
           })
           .eq('id', existingCustomer.id);
         if (updateError) throw updateError;
      } else {
         // Insert missing legacy profile with dummy password to bypass NOT NULL constraints
         const { error: insertError } = await supabase
           .from('customers')
           .insert([{
             email: user.email,
             password: 'LEGACY_MIGRATION_AUTH',
             firstName: formData.firstName,
             lastName: formData.lastName,
             address: formData.address,
             ccId: formData.ccId
           }]);
         if (insertError) throw insertError;
      }
      
      // Update Auth Metadata simultaneously to keep them perfectly synced 
      await supabase.auth.updateUser({
        data: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          address: formData.address,
          ccId: formData.ccId
        }
      });

      setMessage('Profile updated successfully!');
    } catch (err: unknown) {
      setError((err instanceof Error ? err.message : (typeof err === "object" && err !== null && "message" in err ? String((err as Record<string, unknown>).message) : String(err))) || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container py-5 d-flex justify-content-center">
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) return null; // Component redirect handles the rest

  return (
    <div className="container py-5 min-vh-100">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card bg-dark border-secondary shadow-lg">
            <div className="card-body p-4 p-md-5">
              <h2 className="fw-bold text-white mb-4 border-bottom border-secondary pb-3">
                Account Profile
              </h2>
              
              <div className="mb-4 p-3 bg-secondary bg-opacity-25 rounded border border-secondary">
                <p className="mb-1 text-muted small fw-bold text-uppercase">Registered Email ID</p>
                <div className="d-flex align-items-center">
                  <span className="text-light fs-5 me-2">{user.email}</span>
                  <span className="badge bg-success text-dark">Verified</span>
                </div>
              </div>

              {message && <div className="alert alert-success">{message}</div>}
              {error && <div className="alert alert-danger">{error}</div>}

              <form onSubmit={handleSave}>
                <div className="row g-4">
                  <div className="col-md-6">
                    <label className="form-label text-light fw-semibold">First Name</label>
                    <input 
                      type="text" 
                      name="firstName" 
                      value={formData.firstName}
                      onChange={handleChange}
                      className="form-control bg-secondary text-light border-0 focus-ring focus-ring-warning" 
                      required 
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-light fw-semibold">Last Name</label>
                    <input 
                      type="text" 
                      name="lastName" 
                      value={formData.lastName}
                      onChange={handleChange}
                      className="form-control bg-secondary text-light border-0 focus-ring focus-ring-warning" 
                      required 
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label text-light fw-semibold">Billing Address</label>
                    <input 
                      type="text" 
                      name="address" 
                      value={formData.address}
                      onChange={handleChange}
                      className="form-control bg-secondary text-light border-0 focus-ring focus-ring-warning" 
                      required 
                    />
                  </div>
                  <div className="col-md-7">
                    <label className="form-label text-light fw-semibold">Bank Credit Card Number</label>
                    <input 
                      type="text" 
                      name="ccId" 
                      value={formData.ccId}
                      onChange={handleChange}
                      className="form-control bg-secondary text-light border-0 focus-ring focus-ring-warning" 
                      required
                      placeholder="e.g. 1234567890" 
                    />
                  </div>
                  <div className="col-md-5">
                    <label className="form-label text-light fw-semibold">Expiration Date</label>
                    <input 
                      type="date" 
                      name="ccExpiration" 
                      value={formData.ccExpiration}
                      onChange={handleChange}
                      className="form-control bg-secondary text-light border-0 focus-ring focus-ring-warning" 
                      required 
                    />
                  </div>
                </div>
                
                <div className="mt-5 pt-3 border-top border-secondary d-flex justify-content-end">
                  <button 
                    type="submit" 
                    className="btn btn-warning fw-bold px-4 py-2"
                    disabled={saving}
                  >
                    {saving ? 'Saving Changes...' : 'Save Profile'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
