import React from 'react';
import Plot from 'react-plotly.js';

interface PlotlyChartProps {
  data: any;
  config?: any;
}

const PlotlyChart: React.FC<PlotlyChartProps> = ({ data, config = {} }) => {
  const defaultConfig = {
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['pan2d', 'lasso2d'],
    ...config,
  };

  const defaultLayout = {
    autosize: true,
    margin: { l: 50, r: 50, t: 50, b: 50 },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { color: '#374151' },
    ...data.layout,
  };

  return (
    <div className="w-full h-96">
      <Plot
        data={data.data || []}
        layout={defaultLayout}
        config={defaultConfig}
        style={{ width: '100%', height: '100%' }}
        useResizeHandler={true}
      />
    </div>
  );
};

export default PlotlyChart;