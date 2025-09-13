import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const chatService = {
  sendMessage: async (message: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/chat/`, {
        message,
        timestamp: new Date().toISOString(),
      }, {
        timeout: 30000, // 30 second timeout for complex queries
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Chat service error:', error);
      
      // Return more sophisticated mock responses based on query content
      const mockResponse = generateMockResponse(message);
      return mockResponse;
    }
  },

  getChatHistory: async (userId?: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/chat/history`, {
        params: { user_id: userId || 'demo' }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching chat history:', error);
      return { messages: [] };
    }
  }
};

const generateMockResponse = (message: string) => {
  const lowerMessage = message.toLowerCase();
  
  // Temperature queries
  if (lowerMessage.includes('temperature')) {
    if (lowerMessage.includes('anomaly') || lowerMessage.includes('unusual')) {
      return {
        message: "I've analyzed temperature anomalies in the requested region. The data shows 3 significant temperature anomalies in the past month, with deviations of +2.1°C, -1.8°C, and +3.2°C from the seasonal average. These anomalies are highlighted in the visualization below.",
        data: generateTemperatureAnomalyData(),
        visualizations: [
          {
            type: 'plot',
            data: generateTemperatureAnomalyVisualization()
          }
        ],
        suggestions: [
          "Show depth profile for these anomalies",
          "Compare with historical data",
          "Analyze salinity during anomaly periods",
          "Check ocean current patterns"
        ]
      };
    } else if (lowerMessage.includes('depth') || lowerMessage.includes('profile')) {
      return {
        message: "Here's the temperature depth profile for the selected region. The thermocline is clearly visible at approximately 200-800m depth, with surface temperatures around 22°C decreasing to 4°C at 2000m depth.",
        data: generateDepthProfileData(),
        visualizations: [
          {
            type: 'plot',
            data: generateDepthProfileVisualization()
          }
        ],
        suggestions: [
          "Show salinity depth profile",
          "Compare different seasons",
          "Analyze thermocline variability",
          "Display mixed layer depth"
        ]
      };
    } else if (lowerMessage.includes('trend')) {
      return {
        message: "Temperature trend analysis shows a warming trend of +0.15°C per decade in this region. The analysis covers the last 15 years of ARGO data with high confidence intervals. Seasonal patterns show peak temperatures in August-September.",
        data: generateTrendData(),
        visualizations: [
          {
            type: 'plot',
            data: generateTrendVisualization()
          }
        ],
        suggestions: [
          "Show confidence intervals",
          "Compare with global trends",
          "Analyze seasonal variations",
          "Project future temperatures"
        ]
      };
    } else {
      return {
        message: "I've retrieved temperature data for your specified region and time period. The analysis shows mean temperatures of 18.7°C with a standard deviation of 2.3°C. Data quality is excellent with 96% valid measurements from 47 active floats.",
        data: generateTemperatureTimeSeriesData(),
        visualizations: [
          {
            type: 'plot',
            data: generateTemperatureTimeSeriesVisualization()
          },
          {
            type: 'map',
            data: generateTemperatureMapData()
          }
        ],
        suggestions: [
          "Show temperature depth profile",
          "Analyze temperature anomalies",
          "Compare with salinity data",
          "Display seasonal patterns"
        ]
      };
    }
  }
  
  // Salinity queries
  else if (lowerMessage.includes('salinity')) {
    return {
      message: "Salinity analysis completed for the requested area. Average salinity is 35.2 PSU with interesting variability near the surface due to precipitation and evaporation effects. The halocline is well-defined between 100-400m depth.",
      data: generateSalinityData(),
      visualizations: [
        {
          type: 'plot',
          data: generateSalinityVisualization()
        }
      ],
      suggestions: [
        "Show salinity-temperature relationship",
        "Analyze density profiles",
        "Display freshwater influence",
        "Compare with temperature data"
      ]
    };
  }
  
  // Current/velocity queries
  else if (lowerMessage.includes('current') || lowerMessage.includes('velocity')) {
    return {
      message: "Ocean current analysis shows predominant southwestward flow with average velocities of 0.23 m/s. Strong seasonal variability is observed with peak velocities during winter months. The current structure shows typical characteristics of the regional circulation pattern.",
      data: generateCurrentData(),
      visualizations: [
        {
          type: 'map',
          data: generateCurrentMapData()
        },
        {
          type: 'plot',
          data: generateCurrentTimeSeriesVisualization()
        }
      ],
      suggestions: [
        "Show velocity depth profile",
        "Analyze current direction patterns",
        "Compare with wind data",
        "Display eddy activity"
      ]
    };
  }
  
  // Geographic specific queries
  else if (lowerMessage.includes('atlantic')) {
    return {
      message: "North Atlantic Ocean analysis reveals typical mid-latitude oceanic conditions. The region shows strong seasonal temperature cycles, well-developed thermocline structure, and characteristic salinity patterns influenced by the Gulf Stream system.",
      data: generateAtlanticData(),
      visualizations: [
        {
          type: 'map',
          data: generateAtlanticMapData()
        },
        {
          type: 'plot',
          data: generateAtlanticTimeSeriesVisualization()
        }
      ],
      suggestions: [
        "Analyze Gulf Stream influence",
        "Show North Atlantic Oscillation effects",
        "Compare with Pacific data",
        "Display seasonal variations"
      ]
    };
  }
  
  else if (lowerMessage.includes('pacific')) {
    return {
      message: "Pacific Ocean data analysis reveals the vast scale and complexity of this ocean basin. Temperature patterns show strong equatorial upwelling, El Niño/La Niña influences, and distinct North-South gradients. The Pacific contains the world's deepest ocean trenches reflected in our depth profile data.",
      data: generatePacificData(),
      visualizations: [
        {
          type: 'map',
          data: generatePacificMapData()
        }
      ],
      suggestions: [
        "Show El Niño effects",
        "Analyze Pacific Decadal Oscillation",
        "Display equatorial upwelling",
        "Compare North vs South Pacific"
      ]
    };
  }
  
  // Default comprehensive response
  else {
    return {
      message: "I've processed your ocean data query and prepared a comprehensive analysis. The data includes measurements from multiple ARGO floats covering temperature, salinity, and depth information. The visualization shows spatial and temporal patterns in the requested parameters.",
      data: generateDefaultData(),
      visualizations: [
        {
          type: 'plot',
          data: generateDefaultVisualization()
        }
      ],
      suggestions: [
        "Show me temperature trends",
        "Analyze salinity patterns",
        "Display depth profiles",
        "Find temperature anomalies"
      ]
    };
  }
};

// Mock data generation functions
const generateTemperatureAnomalyData = () => ({
  region: 'North Atlantic',
  parameter: 'temperature',
  anomalies: [
    { date: '2024-01-15', value: 20.1, anomaly: 2.1, lat: 45.2, lon: -30.1 },
    { date: '2024-01-22', value: 16.2, anomaly: -1.8, lat: 47.8, lon: -28.5 },
    { date: '2024-02-03', value: 21.2, anomaly: 3.2, lat: 44.1, lon: -32.3 }
  ],
  statistics: {
    total_anomalies: 3,
    max_positive: 3.2,
    max_negative: -1.8,
    confidence: 0.95
  }
});

const generateTemperatureAnomalyVisualization = () => ({
  data: [
    {
      x: ['Jan 1', 'Jan 8', 'Jan 15', 'Jan 22', 'Jan 29', 'Feb 5', 'Feb 12', 'Feb 19', 'Feb 26'],
      y: [18.2, 18.5, 20.1, 16.2, 18.9, 21.2, 18.7, 19.1, 18.4],
      type: 'scatter',
      mode: 'lines+markers',
      name: 'Temperature',
      line: { color: '#0891b2', width: 3 },
      marker: { size: 8 }
    },
    {
      x: ['Jan 15', 'Jan 22', 'Feb 5'],
      y: [20.1, 16.2, 21.2],
      type: 'scatter',
      mode: 'markers',
      name: 'Anomalies',
      marker: { color: '#dc2626', size: 12, symbol: 'x' }
    }
  ],
  layout: {
    title: 'Temperature Anomaly Detection',
    xaxis: { title: 'Date' },
    yaxis: { title: 'Temperature (°C)' },
  }
});

const generateDepthProfileData = () => ({
  depths: [0, 10, 20, 50, 100, 150, 200, 300, 500, 750, 1000, 1500, 2000],
  temperatures: [22.1, 21.8, 21.2, 19.5, 16.8, 13.2, 10.5, 8.1, 6.2, 5.1, 4.8, 4.2, 4.0],
  location: { lat: 40.5, lon: -30.0, region: 'North Atlantic' }
});

const generateDepthProfileVisualization = () => ({
  data: [
    {
      x: [22.1, 21.8, 21.2, 19.5, 16.8, 13.2, 10.5, 8.1, 6.2, 5.1, 4.8, 4.2, 4.0],
      y: [0, 10, 20, 50, 100, 150, 200, 300, 500, 750, 1000, 1500, 2000],
      type: 'scatter',
      mode: 'lines+markers',
      name: 'Temperature Profile',
      line: { color: '#dc2626', width: 3 },
    }
  ],
  layout: {
    title: 'Ocean Temperature Depth Profile',
    xaxis: { title: 'Temperature (°C)' },
    yaxis: { title: 'Depth (m)', autorange: 'reversed' },
  }
});

const generateTrendData = () => ({
  years: [2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
  temperatures: [17.8, 17.9, 18.1, 18.0, 18.3, 18.4, 18.6, 18.8, 18.7, 19.0, 19.2, 19.1, 19.3, 19.5, 19.4, 19.6],
  trend_slope: 0.015, // °C per year
  r_squared: 0.87
});

const generateTrendVisualization = () => ({
  data: [
    {
      x: [2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
      y: [17.8, 17.9, 18.1, 18.0, 18.3, 18.4, 18.6, 18.8, 18.7, 19.0, 19.2, 19.1, 19.3, 19.5, 19.4, 19.6],
      type: 'scatter',
      mode: 'lines+markers',
      name: 'Annual Mean Temperature',
      line: { color: '#0891b2', width: 2 },
    },
    {
      x: [2009, 2024],
      y: [17.775, 19.625], // Linear trend line
      type: 'scatter',
      mode: 'lines',
      name: 'Trend (+0.15°C/decade)',
      line: { color: '#dc2626', width: 3, dash: 'dash' },
    }
  ],
  layout: {
    title: 'Long-term Temperature Trend Analysis',
    xaxis: { title: 'Year' },
    yaxis: { title: 'Temperature (°C)' },
  }
});

const generateTemperatureTimeSeriesData = () => ({
  dates: Array.from({length: 30}, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date.toISOString().split('T')[0];
  }),
  temperatures: Array.from({length: 30}, () => 18.7 + (Math.random() - 0.5) * 4.6),
  statistics: {
    mean: 18.7,
    std: 2.3,
    min: 15.2,
    max: 22.1,
    valid_measurements: 0.96,
    active_floats: 47
  }
});

const generateTemperatureTimeSeriesVisualization = () => {
  const dates = Array.from({length: 30}, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date.toLocaleDateString();
  });
  const temperatures = Array.from({length: 30}, () => 18.7 + (Math.random() - 0.5) * 4.6);

  return {
    data: [
      {
        x: dates,
        y: temperatures,
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Temperature',
        line: { color: '#0891b2', width: 3 },
      }
    ],
    layout: {
      title: 'Ocean Temperature Time Series',
      xaxis: { title: 'Date' },
      yaxis: { title: 'Temperature (°C)' },
    }
  };
};

const generateTemperatureMapData = () => ({
  markers: [
    { lat: 42.3, lon: -71.1, title: 'Float #2847', description: 'Temperature: 19.2°C', data: { temp: '19.2°C', salinity: '35.1 PSU' } },
    { lat: 40.7, lon: -74.0, title: 'Float #2851', description: 'Temperature: 18.5°C', data: { temp: '18.5°C', salinity: '35.3 PSU' } },
    { lat: 39.1, lon: -76.8, title: 'Float #2856', description: 'Temperature: 17.8°C', data: { temp: '17.8°C', salinity: '35.0 PSU' } },
  ]
});

const generateSalinityData = () => ({
  depths: [0, 25, 50, 100, 200, 400, 600, 800, 1000, 1500, 2000],
  salinity: [34.8, 35.1, 35.3, 35.6, 35.8, 35.9, 35.9, 35.8, 35.7, 35.5, 35.4],
  statistics: { mean: 35.2, std: 0.4, halocline_depth: 250 }
});

const generateSalinityVisualization = () => ({
  data: [
    {
      x: [34.8, 35.1, 35.3, 35.6, 35.8, 35.9, 35.9, 35.8, 35.7, 35.5, 35.4],
      y: [0, 25, 50, 100, 200, 400, 600, 800, 1000, 1500, 2000],
      type: 'scatter',
      mode: 'lines+markers',
      name: 'Salinity Profile',
      line: { color: '#059669', width: 3 },
    }
  ],
  layout: {
    title: 'Ocean Salinity Depth Profile',
    xaxis: { title: 'Salinity (PSU)' },
    yaxis: { title: 'Depth (m)', autorange: 'reversed' },
  }
});

const generateCurrentData = () => ({
  velocities: [0.15, 0.23, 0.31, 0.28, 0.19, 0.34, 0.41, 0.38, 0.25, 0.29],
  directions: [225, 230, 235, 220, 240, 225, 215, 230, 235, 228], // degrees
  statistics: { mean_velocity: 0.28, predominant_direction: 228 }
});

const generateCurrentMapData = () => ({
  markers: [
    { lat: 35.5, lon: -75.0, title: 'Current Station A', description: 'Velocity: 0.31 m/s SW', data: { velocity: '0.31 m/s', direction: '225°' } },
    { lat: 36.2, lon: -74.5, title: 'Current Station B', description: 'Velocity: 0.28 m/s SW', data: { velocity: '0.28 m/s', direction: '230°' } },
  ]
});

const generateCurrentTimeSeriesVisualization = () => ({
  data: [
    {
      x: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      y: [0.25, 0.32, 0.28, 0.31],
      type: 'bar',
      name: 'Current Velocity',
      marker: { color: '#7c3aed' },
    }
  ],
  layout: {
    title: 'Ocean Current Velocity Over Time',
    xaxis: { title: 'Time Period' },
    yaxis: { title: 'Velocity (m/s)' },
  }
});

const generateAtlanticData = () => ({
  region: 'North Atlantic',
  temperature_range: [12.5, 24.8],
  salinity_range: [34.2, 36.5],
  characteristics: ['Gulf Stream influence', 'Strong seasonal cycles', 'Deep water formation']
});

const generateAtlanticMapData = () => ({
  markers: [
    { lat: 40.0, lon: -70.0, title: 'Gulf Stream', description: 'Warm current system', data: { temp: '22.5°C', salinity: '36.2 PSU' } },
    { lat: 45.0, lon: -45.0, title: 'North Atlantic Current', description: 'Extension of Gulf Stream', data: { temp: '15.8°C', salinity: '35.4 PSU' } },
    { lat: 35.0, lon: -65.0, title: 'Sargasso Sea', description: 'Subtropical gyre center', data: { temp: '24.1°C', salinity: '36.8 PSU' } },
  ]
});

const generateAtlanticTimeSeriesVisualization = () => ({
  data: [
    {
      x: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      y: [16.2, 15.8, 16.5, 18.2, 20.1, 22.5, 24.8, 24.2, 22.8, 20.5, 18.9, 17.1],
      type: 'scatter',
      mode: 'lines+markers',
      name: 'North Atlantic SST',
      line: { color: '#0891b2', width: 3 },
    }
  ],
  layout: {
    title: 'North Atlantic Seasonal Temperature Cycle',
    xaxis: { title: 'Month' },
    yaxis: { title: 'Temperature (°C)' },
  }
});

const generatePacificData = () => ({
  region: 'Pacific Ocean',
  area: '165.2 million km²',
  characteristics: ['Largest ocean basin', 'Ring of Fire', 'El Niño/La Niña oscillations'],
  depth_stats: { mean: 4280, max: 11034 } // meters
});

const generatePacificMapData = () => ({
  markers: [
    { lat: 0, lon: -150, title: 'Equatorial Pacific', description: 'Upwelling zone', data: { temp: '26.8°C', salinity: '34.5 PSU' } },
    { lat: 35, lon: -140, title: 'Kuroshio Current', description: 'Western boundary current', data: { temp: '18.5°C', salinity: '34.8 PSU' } },
    { lat: -20, lon: -150, title: 'South Pacific Gyre', description: 'Subtropical circulation', data: { temp: '25.2°C', salinity: '35.2 PSU' } },
  ]
});

const generateDefaultData = () => ({
  measurement_count: 1247,
  float_count: 23,
  date_range: '2024-01-01 to 2024-02-01',
  parameters: ['temperature', 'salinity', 'pressure']
});

const generateDefaultVisualization = () => ({
  data: [
    {
      x: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      y: [18.2, 18.7, 17.9, 19.1],
      type: 'scatter',
      mode: 'lines+markers',
      name: 'Ocean Parameter',
      line: { color: '#0891b2', width: 3 },
    }
  ],
  layout: {
    title: 'Ocean Data Analysis',
    xaxis: { title: 'Time Period' },
    yaxis: { title: 'Measurement Value' },
  }
});