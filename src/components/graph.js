import React from 'react';
import Plot from 'react-plotly.js';
import dynamic from 'next/dynamic';

const DynamicMap = dynamic(() => import('./map'), {
  ssr: false,
});

const Graph = ({ selectedGraph, graphData, mapData, mapFilter }) => {
  return (
    <div>
      {selectedGraph === 'location' ? (
        <DynamicMap mapData={mapData} mapFilter={mapFilter} />
      ) : (
        <Plot
          data={[
            {
              x: graphData.timestamps,
              y: graphData[selectedGraph].yData,
              type: 'scatter',
              mode: 'lines+points',
            },
          ]}
          layout={{ 
            width: 720, 
            height: 440, 
            title: graphData[selectedGraph].yTitle,
            xaxis: { title: 'Time' },
            yaxis: { title: graphData[selectedGraph].yTitle }
          }}
        />
      )}
    </div>
  );
};

export default Graph;
