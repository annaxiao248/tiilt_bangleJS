import React from 'react';
import Plot from 'react-plotly.js';

const Graph = ({ id, title, xData, yData, yTitle }) => {
  return (
    <div id={id} style={{ width: '100%', height: '400px' }}>
      <Plot
        data={[
          {
            x: xData,
            y: yData,
            type: 'scatter',
            mode: 'lines',
            name: title,
          },
        ]}
        layout={{
          title: title,
          xaxis: { title: 'Timestamp' },
          yaxis: { title: yTitle },
        }}
      />
    </div>
  );
};

export default Graph;