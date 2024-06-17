import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

const Graph = ({ selectedGraph, graphData, mapData, mapFilter }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Filter map data based on mapFilter
  const getFilteredMapData = () => {
    if (mapFilter === 'chicago') {
      return mapData.filter(row => 
        row['Latitude'] >= 41.644335 && row['Latitude'] <= 42.023131 &&
        row['Longitude'] >= -87.940101 && row['Longitude'] <= -87.523661
      );
    } else if (mapFilter === 'us') {
      return mapData.filter(row => 
        row['Latitude'] >= 24.396308 && row['Latitude'] <= 49.384358 &&
        row['Longitude'] >= -125.00165 && row['Longitude'] <= -66.93457
      );
    } else {
      return mapData;
    }
  };

  const filteredMapData = getFilteredMapData();
  const latitudes = filteredMapData.map(row => row['Latitude']);
  const longitudes = filteredMapData.map(row => row['Longitude']);

  if (!isClient) {
    return null;
  }

  return (
    <div>
      {selectedGraph === 'location' ? (
        <Plot
          data={[
            {
              type: 'scattermapbox',
              lat: latitudes,
              lon: longitudes,
              mode: 'markers',
              marker: { size: 14 },
              text: filteredMapData.map(row => `Lat: ${row['Latitude']}, Lon: ${row['Longitude']}`),
            },
          ]}
          layout={{
            autosize: true,
            hovermode: 'closest',
            mapbox: {
              style: 'open-street-map',
              center: { lat: 41.8781, lon: -87.6298 },
              zoom: 10,
            },
            margin: { t: 0, b: 0, l: 0, r: 0 },
          }}
          style={{ width: '100%', height: '600px' }}
          useResizeHandler
        />
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
          layout={{ width: 720, height: 440, title: graphData[selectedGraph].yTitle }}
        />
      )}
    </div>
  );
};

export default Graph;
