// src/components/graph.js
import React from 'react';
import Plot from 'react-plotly.js';
import dynamic from 'next/dynamic';

const DynamicMapComponent = dynamic(() => import('./map'), {
  ssr: false, // Ensure this component is only rendered on the client-side
});

const Graph = ({ selectedGraph, graphData, mapData, mapFilter }) => {
  return (
    <div>
      {selectedGraph === 'location' ? (
        <DynamicMapComponent mapData={mapData} mapFilter={mapFilter} />
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
            xaxis: { title: 'Time' }, // Ensure x-axis is labeled as 'Time'
            yaxis: { title: graphData[selectedGraph].yTitle } // Ensure y-axis is labeled
          }}
        />
      )}
    </div>
  );
};

export default Graph;
