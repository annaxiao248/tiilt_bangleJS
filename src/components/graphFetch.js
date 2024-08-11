import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

const graphFetch = ({ selectedGraph, combinedGraphData, mapFilter }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const colors = ['red', 'blue', 'green', 'orange', 'purple', 'brown', 'pink', 'gray', 'yellow', 'cyan'];

  const getFilteredMapData = (mapData) => {
    if (mapFilter === 'chicago') {
      return mapData.filter(
        row => row.Latitude >= 41.644 && row.Latitude <= 42.023 && row.Longitude >= -87.940 && row.Longitude <= -87.524
      );
    } else if (mapFilter === 'us') {
      return mapData.filter(
        row => row.Latitude >= 24.396308 && row.Latitude <= 49.384358 && row.Longitude >= -125.0 && row.Longitude <= -66.93457
      );
    } else {
      return mapData;
    }
  };

  const graphTraces = combinedGraphData.flatMap((graphEntry, userIndex) =>
    graphEntry.data.map((dataEntry, entryIndex) => ({
      x: graphEntry.timestamps,
      y: dataEntry.yData,
      name: dataEntry.name,
      line: { dash: dataEntry.line.dash, color: colors[userIndex % colors.length] }
    }))
  );

  return isClient ? (
    <Plot
      data={graphTraces}
      layout={{
        title: selectedGraph.charAt(0).toUpperCase() + selectedGraph.slice(1),
        xaxis: { title: 'Time' },
        yaxis: { title: combinedGraphData[0].data[0].yTitle }
      }}
      config={{ responsive: true }}
      style={{ width: '100%', height: '100%' }}
    />
  ) : null;
};

export default graphFetch;
