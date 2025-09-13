import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const dashboardService = {
  getDashboardData: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/dashboard`);
      return response.data;
    } catch (error) {
      console.error('Dashboard service error:', error);
      return {
        stats: {
          activeFloats: 3847,
          avgTemperature: 18.2,
          dataPoints: 2100000,
          trend: 1.2,
        },
        recentQueries: [
          'Show temperature profiles for the Pacific Ocean',
          'What is the salinity trend in the Mediterranean?',
          'Display current data for the Gulf Stream',
          'Temperature anomalies in the Arctic Ocean',
        ],
      };
    }
  },

  saveQuery: async (query: string, results: any) => {
    try {
      await axios.post(`${API_BASE_URL}/api/dashboard/save-query`, {
        query,
        results,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Save query error:', error);
    }
  },
};