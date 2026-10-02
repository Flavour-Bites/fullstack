import { useState, useEffect, useCallback } from 'react';
import { CustomCakeRequest } from '@shared/types';
import { http } from '@client/lib/http';
import type { ApiResponse } from '@/shared/api';

export interface UseRequestManagementReturn {
  activeRequests: CustomCakeRequest[];
  setActiveRequests: React.Dispatch<React.SetStateAction<CustomCakeRequest[]>>;
  fetchRequests: () => Promise<void>;
  deleteRequest: (id: string) => Promise<void>;
}

export function useRequestManagement(): UseRequestManagementReturn {
  const [activeRequests, setActiveRequests] = useState<CustomCakeRequest[]>([]);

  const fetchRequests = useCallback(async () => {
    try {
      const { data } = await http.get<ApiResponse<{ requests: CustomCakeRequest[] }>>('/api/requests');
      if (data.success) {
        setActiveRequests(data.requests);
      }
    } catch {
      const list = localStorage.getItem('fb_request_orders');
      if (list) {
        try { setActiveRequests(JSON.parse(list)); } catch (parseErr) { console.error('Failed to parse cached requests from localStorage:', parseErr); }
      }
    }
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const deleteRequest = useCallback(async (id: string) => {
    let deletedOnBackend = false;
    try {
      const { data } = await http.delete<ApiResponse>(`/api/requests/${id}`);
      if (data.success) { deletedOnBackend = true; fetchRequests(); }
    } catch (deleteErr) { console.error(`Failed to delete request ${id} from backend:`, deleteErr); }
    if (!deletedOnBackend) {
      const updated = activeRequests.filter((item) => item.id !== id);
      setActiveRequests(updated);
      localStorage.setItem('fb_request_orders', JSON.stringify(updated));
    }
  }, [activeRequests, fetchRequests]);

  return {
    activeRequests,
    setActiveRequests,
    fetchRequests,
    deleteRequest,
  };
}