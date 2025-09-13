import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Globe, Thermometer, Activity, Waves, MapPin, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import PlotlyChart from './PlotlyChart';
import MapVisualization from './MapVisualization';
import { dashboardService } from '../services/dashboardService';

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');

  useEffect(() => {
    loadDashboardData();
  }, [selectedTimeRange]);

  const loadDashboardData = async () => {
    try {
      const data = await dashboardService.getDashboardData();
      setDashboardData(data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const temperatureTrendData = {
    data: [
      {
        x: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        y: [15.2, 15.8, 16.5, 17.2, 18.1, 19.3, 20.1, 20.8, 19.9, 18.7, 17.2, 16.1],
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Global Average (°C)',
        line: { color: '#0891b2', width: 3 },
        marker: { size: 8 }
      },
      {
        x: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        y: [14.8, 15.1, 15.9, 16.8, 17.5, 18.9, 19.7, 20.3, 19.4, 18.2, 16.8, 15.7],
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Previous Year (°C)',
        line: { color: '#64748b', width: 2, dash: 'dash' },
        marker: { size: 6 }
      }
    ],
    layout: {
      title: { text: 'Global Ocean Temperature Trends', font: { size: 16 } },
      xaxis: { title: 'Month', gridcolor: '#e2e8f0' },
      yaxis: { title: 'Temperature (°C)', gridcolor: '#e2e8f0' },
      showlegend: true,
      legend: { orientation: 'h', y: -0.2 }
    },
  };

  const salinityDepthData = {
    data: [
      {
        x: [34.5, 34.7, 34.9, 35.1, 35.3, 35.5, 35.7, 35.9, 36.1, 36.3],
        y: [0, 100, 200, 300, 500, 750, 1000, 1500, 2000, 2500],
        type: 'scatter',
        mode: 'lines+markers',
        name: 'North Atlantic',
        line: { color: '#dc2626', width: 3 },
      },
      {
        x: [34.2, 34.4, 34.6, 34.8, 35.0, 35.2, 35.4, 35.6, 35.8, 36.0],
        y: [0, 100, 200, 300, 500, 750, 1000, 1500, 2000, 2500],
        type: 'scatter',
        mode: 'lines+markers',
        name: 'North Pacific',
        line: { color: '#059669', width: 3 },
      }
    ],
    layout: {
      title: { text: 'Salinity Depth Profiles', font: { size: 16 } },
      xaxis: { title: 'Salinity (PSU)', gridcolor: '#e2e8f0' },
      yaxis: { title: 'Depth (m)', autorange: 'reversed', gridcolor: '#e2e8f0' },
      showlegend: true,
    },
  };

  const globalFloatData = {
    markers: [
      { lat: 40.7, lon: -74.0, title: 'North Atlantic Station', description: 'Active float network', data: { temp: '18.5°C', salinity: '35.2 PSU', depth: '2000m' } },
      { lat: 36.1, lon: -5.3, title: 'Gibraltar Station', description: 'Mediterranean monitoring', data: { temp: '19.8°C', salinity: '36.5 PSU', depth: '1800m' } },
      { lat: -33.9, lon: 18.4, title: 'Cape Town Station', description: 'Agulhas Current', data: { temp: '16.2°C', salinity: '35.1 PSU', depth: '2200m' } },
      { lat: 35.7, lon: 139.7, title: 'Kuroshio Station', description: 'Western Pacific', data: { temp: '21.3°C', salinity: '34.8 PSU', depth: '1900m' } },
      { lat: 25.8, lon: -80.2, title: 'Gulf Stream Station', description: 'Atlantic warm current', data: { temp: '24.1°C', salinity: '36.2 PSU', depth: '1750m' } },
    ],
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Activity className="h-12 w-12 text-cyan-400 animate-pulse mx-auto mb-4" />
          <div className="text-white text-xl">Loading ocean analytics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-white mb-3"
        >
          Ocean Data Dashboard
        </motion.h1>
        <p className="text-slate-300 text-lg">Real-time insights from global ARGO monitoring networks</p>
        
        <div className="mt-6 flex justify-center space-x-4">
          {['7d', '30d', '90d', '1y'].map((range) => (
            <button
              key={range}
              onClick={() => setSelectedTimeRange(range)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedTimeRange === range
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {range === '7d' ? 'Week' : range === '30d' ? 'Month' : range === '90d' ? 'Quarter' : 'Year'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { icon: Globe, label: 'Active Floats', value: '3,847', change: '+23', color: 'cyan' },
          { icon: Thermometer, label: 'Avg Temperature', value: '18.2°C', change: '+0.3°C', color: 'red' },
          { icon: Waves, label: 'Data Points', value: '2.1M', change: '+147K', color: 'blue' },
          { icon: TrendingUp, label: 'Monthly Trend', value: '+1.2°C', change: 'Rising', color: 'green' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10"
          >
            <div className="flex items-center justify-between mb-4">
              <stat.icon className={`h-8 w-8 text-${stat.color}-400`} />
              <span className={`text-sm px-2 py-1 bg-${stat.color}-600/20 text-${stat.color}-300 rounded-full`}>
                {stat.change}
              </span>
            </div>
            <div>
              <p className="text-slate-300 text-sm mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10"
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Temperature Analysis
          </h3>
          <PlotlyChart data={temperatureTrendData} />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10"
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Salinity Profiles
          </h3>
          <PlotlyChart data={salinityDepthData} />
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10"
      >
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          Global ARGO Float Network
        </h3>
        <MapVisualization data={globalFloatData} />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Recent Analysis Queries
          </h3>
          <div className="space-y-3">
            {[
              { query: 'Pacific Ocean temperature anomalies', time: '2 minutes ago', type: 'anomaly' },
              { query: 'Mediterranean salinity trends', time: '15 minutes ago', type: 'trend' },
              { query: 'Arctic temperature depth profiles', time: '1 hour ago', type: 'profile' },
              { query: 'Agulhas Current analysis', time: '3 hours ago', type: 'current' },
              { query: 'Global temperature summary', time: '1 day ago', type: 'summary' },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    item.type === 'anomaly' ? 'bg-red-400' :
                    item.type === 'trend' ? 'bg-blue-400' :
                    item.type === 'profile' ? 'bg-green-400' :
                    item.type === 'current' ? 'bg-purple-400' :
                    'bg-cyan-400'
                  }`}></div>
                  <span className="text-slate-300">{item.query}</span>
                </div>
                <span className="text-xs text-slate-500">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-4">System Performance</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-slate-300 mb-2">
                <span>API Response Time</span>
                <span>245ms</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{width: '85%'}}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm text-slate-300 mb-2">
                <span>Data Processing</span>
                <span>1.2s avg</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div className="bg-cyan-500 h-2 rounded-full" style={{width: '78%'}}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm text-slate-300 mb-2">
                <span>Cache Hit Rate</span>
                <span>92.3%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{width: '92%'}}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm text-slate-300 mb-2">
                <span>Active Connections</span>
                <span>1,247</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{width: '67%'}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;