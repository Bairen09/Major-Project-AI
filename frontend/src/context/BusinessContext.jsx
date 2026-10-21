import React, { createContext, useContext, useState, useEffect } from 'react';
import { getBusinesses } from '../services/business.service';
import { useAuth } from './AuthContext';

const BusinessContext = createContext(undefined);

export function BusinessProvider({ children }) {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState([]);
  const [activeBusiness, setActiveBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBusinesses = async () => {
    if (!user) {
      setBusinesses([]);
      setActiveBusiness(null);
      setLoading(false);
      return;
    }
    
    // Only fetch businesses for standard users/owners, not super admins
    if (user.platformRole === 'SUPER_ADMIN' || user.platformRole === 'BLOGGER') {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await getBusinesses();
      const fetchedBusinesses = res.data.data || [];
      setBusinesses(fetchedBusinesses);

      if (fetchedBusinesses.length > 0) {
        // Try to restore from localStorage, else default to first
        const savedId = localStorage.getItem('activeBusinessId');
        const found = fetchedBusinesses.find(b => b._id === savedId);
        if (found) {
          setActiveBusiness(found);
        } else {
          setActiveBusiness(fetchedBusinesses[0]);
          localStorage.setItem('activeBusinessId', fetchedBusinesses[0]._id);
        }
      } else {
        setActiveBusiness(null);
        localStorage.removeItem('activeBusinessId');
      }
    } catch (error) {
      console.error('Failed to fetch businesses:', error);
      setBusinesses([]);
      setActiveBusiness(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, [user]);

  const changeActiveBusiness = (businessId) => {
    const found = businesses.find(b => b._id === businessId);
    if (found) {
      setActiveBusiness(found);
      localStorage.setItem('activeBusinessId', found._id);
    }
  };

  return (
    <BusinessContext.Provider value={{ businesses, activeBusiness, loading, changeActiveBusiness, refreshBusinesses: fetchBusinesses }}>
      {children}
    </BusinessContext.Provider>
  );
}

export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
};
