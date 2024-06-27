import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

const Graph = ({ selectedGraph, graphData, mapFilter, selectedEntries }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const colors = ['red', 'blue', 'green', 'orange', 'purple', 'brown', 'pink', 'gray', 'yellow', 'cyan'];

  const getFilteredMapData = (mapData) => {
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

  if (!isClient) {
    return null;
  }

  return (
    <div>
      {selectedGraph === 'location' ? (
        selectedEntries.map((entryId, index) => {
          const entryData = graphData.find((data, i) => selectedEntries[i] === entryId);
          if (!entryData) {
            return null;
          }
          const mapData = entryData.mapData;
          const filteredMapData = getFilteredMapData(mapData);
          const latitudes = filteredMapData.map(row => row['Latitude']);
          const longitudes = filteredMapData.map(row => row['Longitude']);
          
          return (
            <Plot
              key={entryId}
              data={[
                {
                  type: 'scattermapbox',
                  lat: latitudes,
                  lon: longitudes,
                  mode: 'markers',
                  marker: { size: 14, color: colors[index % colors.length] }, // Assign a unique color to each set of points
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
          );
        })
      ) : (
        <Plot
          data={selectedEntries.map((entryId, index) => {
            const entryData = graphData.find((data, i) => selectedEntries[i] === entryId);
            if (!entryData) {
              return null;
            }
            const graphEntry = entryData[selectedGraph];
            return {
              x: entryData.timestamps,
              y: graphEntry.yData,
              type: 'scatter',
              mode: 'lines+points',
              name: `Entry ${index + 1}`,
              line: { color: colors[index % colors.length] },
            };
          }).filter(data => data !== null)}
          layout={{ width: 720, height: 440, title: graphData[0][selectedGraph].yTitle }}
        />
      )}
    </div>
  );
};

export default Graph;
