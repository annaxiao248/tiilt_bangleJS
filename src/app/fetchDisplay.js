'use client'
import React, { useState, useRef, useEffect } from 'react';
import { collection, doc, addDoc, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import Papa from 'papaparse';
import DynamicGraph from '../components/dynamicGraph';

export default function Home() {
  const [name, setName] = useState('');
  const [data, setData] = useState([]);
  const [entries, setEntries] = useState([]);
  const [selectedEntries, setSelectedEntries] = useState([]);
  const [selectedGraph, setSelectedGraph] = useState('heartRate');
  const [mapFilter, setMapFilter] = useState('all');
  const fileInputRef = useRef(null);

  const fetchDataFromDB = async (e) => {
    e.preventDefault();
    if (name !== '') {
      const userDocRef = doc(db, 'tiilt-bangleJS', name.trim());
      const userSubCollectionRef = collection(userDocRef, 'entries');
      const userDocsSnap = await getDocs(userSubCollectionRef);
      let userEntries = userDocsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      if (userEntries.length > 0) {
        // Sort entries by timestamp from newest to oldest
        userEntries = userEntries.sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);
        setEntries(userEntries);
        console.log("fetched", entries)
      } else {
        alert('No data found for this name.');
      }
    } else {
      alert('Please enter a name.');
    }
  };

  useEffect(() => {
    console.log("selcted", selectedEntries)
    if (selectedEntries.length > 0 && entries.length > 0) {
      const fetchedData = selectedEntries.map(entryId => {
        const entry = entries.find(entry => entry.id === entryId);
        console.log("entry in useeffect", entry)
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
      setData(fetchedData);
      console.log("data in useffect", data)
    } else {
      setData([]);
    }
  }, [selectedEntries, entries]);

 
  console.log("data4", data)
  const filteredData = data.map(entryData => entryData.filter(row => row['Confidence'] > 70));
  console.log("filted data", filteredData)

  const graphData = filteredData.map(entry => {
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
  });

  const handleCheckboxChange = (entryId) => {
    setSelectedEntries(prevState =>
      prevState.includes(entryId)
        ? prevState.filter(id => id !== entryId)
        : [...prevState, entryId]
    );
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between sm:p-24 p-4">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl p-4 text-center"> Tiilt BangleJS</h1>
        <div className="bg-slate-800 p-4 rounded-lg">
          <form className="grid grid-cols-7 items-center text-black">
            <input className="col-span-2 p-3 border"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
            />
            <button 
              onClick={fetchDataFromDB}
              className="col-span-2 text-white bg-slate-600 hover:bg-slate-500 p-3 text-sm mx-3"
              type="button"
            >
              Fetch Data
            </button>
          </form>
        </div>
       
      </div>
      {entries.length > 0 && (
        <div className="mt-4">
          <label className="text-black">Select Entries: </label>
          {entries.map(entry => (
            <div key={entry.id}>
              <input 
                type="checkbox"
                id={entry.id}
                value={entry.id}
                onChange={() => handleCheckboxChange(entry.id)}
                checked={selectedEntries.includes(entry.id)}
              />
              <label htmlFor={entry.id}>
                {new Date(entry.timestamp.seconds * 1000).toLocaleString()}
              </label>
            </div>
          ))}
        </div>
      )}
      {data.length > 0 && (
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
          <DynamicGraph
            selectedGraph={selectedGraph} 
            graphData={graphData} 
            mapFilter={mapFilter} 
            selectedEntries={selectedEntries}
          />
        </>
      )}
    </main>
  );
}
