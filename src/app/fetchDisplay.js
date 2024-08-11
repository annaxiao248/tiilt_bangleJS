'use client';
import React, { useState, useRef, useEffect } from 'react';
import { collection, doc, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import DynamicGraph from '../components/dynamicGraph';

export default function Home() {
  const [names, setNames] = useState(['', '']);
  const [dataSets, setDataSets] = useState([[], []]);
  const [entries, setEntries] = useState([[], []]);
  const [selectedEntries, setSelectedEntries] = useState([[], []]);
  const [selectedGraph, setSelectedGraph] = useState('heartRate');
  const [mapFilter, setMapFilter] = useState('all');
  const fileInputRef = useRef(null);

  const fetchDataFromDB = async (index, e) => {
    e.preventDefault();
    const name = names[index];
    if (name !== '') {
      const userDocRef = doc(db, 'tiilt-bangleJS', name.trim());
      const userSubCollectionRef = collection(userDocRef, 'entries');
      const userDocsSnap = await getDocs(userSubCollectionRef);
      let userEntries = userDocsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      if (userEntries.length > 0) {
        userEntries = userEntries.sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);
        setEntries(prevEntries => {
          const newEntries = [...prevEntries];
          newEntries[index] = userEntries;
          return newEntries;
        });
      } else {
        alert('No data found for this name.');
      }
    } else {
      alert('Please enter a name.');
    }
  };

  useEffect(() => {
    dataSets.forEach((dataSet, index) => {
      if (selectedEntries[index].length > 0 && entries[index].length > 0) {
        const fetchedData = selectedEntries[index].map(entryId => {
          const entry = entries[index].find(entry => entry.id === entryId);
          if (entry) {
            return entry.data.map(dataEntry => {
              if (dataEntry.Time && dataEntry.Time.seconds) {
                return {
                  ...dataEntry,
                  Time: new Date(dataEntry.Time.seconds * 1000)
                };
              }
              return dataEntry;
            });
          }
          return [];
        });
        setDataSets(prevDataSets => {
          const newDataSets = [...prevDataSets];
          newDataSets[index] = fetchedData;
          return newDataSets;
        });
      } else {
        setDataSets(prevDataSets => {
          const newDataSets = [...prevDataSets];
          newDataSets[index] = [];
          return newDataSets;
        });
      }
    });
  }, [selectedEntries, entries]);

  const handleCheckboxChange = (index, entryId) => {
    setSelectedEntries(prevState => {
      const newSelectedEntries = [...prevState];
      newSelectedEntries[index] = newSelectedEntries[index].includes(entryId)
        ? newSelectedEntries[index].filter(id => id !== entryId)
        : [...newSelectedEntries[index], entryId];
      return newSelectedEntries;
    });
  };

  const filteredDataSets = dataSets.map(dataSet => 
    dataSet.map(entryData => entryData.filter(row => row['Confidence'] > 70))
  );

  const graphDataSets = filteredDataSets.map(filteredData => 
    filteredData.map(entry => {
      const timestamps = entry.map(row => row['Time']);
      const heartRates = entry.map(row => row['Heartrate']);
      const steps = entry.map(row => row['Steps']);
      const altitudes = entry.map(row => row['Altitude']);
      const temperatures = entry.map(row => row['Barometer Temperature']);
      const mapData = entry.filter(row => row['Latitude'] && row['Longitude']);

      return {
        timestamps,
        heartRate: { yData: heartRates, yTitle: "Heart Rate" },
        steps: { yData: steps, yTitle: "Steps" },
        altitude: { yData: altitudes, yTitle: "Altitude" },
        temperature: { yData: temperatures, yTitle: "Temperature" },
        mapData,
      };
    })
  );

  const combinedGraphData = graphDataSets.reduce((acc, graphData, index) => {
    graphData.forEach((entryData, entryIndex) => {
      if (!acc[entryIndex]) acc[entryIndex] = { timestamps: entryData.timestamps, data: [] };
      acc[entryIndex].data.push({
        yData: entryData[selectedGraph].yData,
        name: `User ${index + 1} Entry ${entryIndex + 1}`,
        line: { dash: index === 0 ? 'solid' : 'dash' }
      });
    });
    return acc;
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between sm:p-24 p-4">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl p-4 text-center"> Tiilt BangleJS</h1>
        <div className="bg-slate-800 p-4 rounded-lg">
          {names.map((name, index) => (
            <form key={index} className="grid grid-cols-7 items-center text-black mb-4">
              <input className="col-span-2 p-3 border"
                type="text"
                value={name}
                onChange={(e) => setNames(prevNames => {
                  const newNames = [...prevNames];
                  newNames[index] = e.target.value;
                  return newNames;
                })}
                placeholder={`Enter name ${index + 1}`}
              />
              <button 
                onClick={(e) => fetchDataFromDB(index, e)}
                className="col-span-2 text-white bg-slate-600 hover:bg-slate-500 p-3 text-sm mx-3"
                type="button"
              >
                Fetch Data
              </button>
            </form>
          ))}
        </div>
      </div>
      {entries.map((entrySet, index) => (
        entrySet.length > 0 && (
          <div key={index} className="mt-4 w-full">
            <label className="text-black">Select Entries for {names[index]}: </label>
            {entrySet.map(entry => (
              <div key={entry.id}>
                <input 
                  type="checkbox"
                  id={`${index}-${entry.id}`}
                  value={entry.id}
                  onChange={() => handleCheckboxChange(index, entry.id)}
                  checked={selectedEntries[index].includes(entry.id)}
                />
                <label htmlFor={`${index}-${entry.id}`}>
                  {new Date(entry.timestamp.seconds * 1000).toLocaleString()}
                </label>
              </div>
            ))}
          </div>
        )
      ))}
      {dataSets.some(dataSet => dataSet.length > 0) && (
        <>
          <div className="mt-4">
            <label htmlFor="graphSelect" className="text-black">Select Graph: </label>
            <select id="graphSelect" value={selectedGraph} onChange={(e) => setSelectedGraph(e.target.value)}>
              <option value="heartRate">Heart Rate</option>
              <option value="steps">Steps</option>
              <option value="altitude">Altitude</option>
              <option value="temperature">Temperature</option>
              <option value="location">Location</option>
            </select>
            {selectedGraph === 'location' && (
              <select id="mapFilterSelect" value={mapFilter} onChange={(e) => setMapFilter(e.target.value)}>
                <option value="all">All</option>
                <option value="chicago">Chicago</option>
                <option value="us">US</option>
              </select>
            )}
          </div>
          <div className="w-full mt-8">
            {combinedGraphData.length > 0 && (selectedGraph === 'location' ? combinedGraphData.some(g => g.mapData.length > 0) : combinedGraphData[0].data.length > 0) && (
              <DynamicGraph
                selectedGraph={selectedGraph}
                combinedGraphData={combinedGraphData}
                mapFilter={mapFilter}
              />
            )}
          </div>
        </>
      )}
    </main>
  );
}
