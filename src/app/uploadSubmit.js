'use client'
import React, { useState, useRef, useEffect } from 'react';
import { collection, doc, addDoc, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import Papa from 'papaparse';
import DynamicGraphSingle from '@/components/dyamicGraphSingle';

export default function Home() {
  const [name, setName] = useState('');
  const [data, setData] = useState([]);
  const [entries, setEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState('');
  const [selectedGraph, setSelectedGraph] = useState('heartRate');
  const [mapFilter, setMapFilter] = useState('all');
  const fileInputRef = useRef(null);

  const submitDB = async (e) => {
    e.preventDefault();
    if (name !== '' && data.length > 0) {
      const userDocRef = doc(db, 'tiilt-bangleJS', name.trim());
      const userSubCollectionRef = collection(userDocRef, 'entries');
      const newEntry = {
        data: data,
        timestamp: Timestamp.now()
      };

      try {
        await addDoc(userSubCollectionRef, newEntry);
        alert('Submission successful!');

        setName('');
        setData([]);
        setEntries([]);
        setSelectedEntry('');
        if (fileInputRef.current) {
          fileInputRef.current.value = ''; // Reset file input
        }
      } catch (error) {
        console.error('Error submitting data: ', error);
        alert('Error submitting data. Please try again.');
      }
    } else {
      alert('Please enter a name and upload a CSV file.');
    }
  };

  

  useEffect(() => {
    if (selectedEntry && entries.length > 0) {
      const entry = entries.find(entry => entry.id === selectedEntry);
      if (entry) {
        const fetchedData = entry.data.map(dataEntry => {
          if (dataEntry.Time && dataEntry.Time.seconds) {
            return {
              ...dataEntry,
              Time: new Date(dataEntry.Time.seconds * 1000)
            };
          }
          return dataEntry;
        });
        setData(fetchedData);
      }
    }
  }, [selectedEntry, entries]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      complete: function(results) {
        if (results.data.length > 0) {
          console.log("Field Names:", Object.keys(results.data[0])); 
        }
        setData(results.data);
      }
    });
  };

  const filteredData = data.filter(row => row['Confidence'] > 70);
  const timestamps = filteredData.map(row => row['Time']);
  const heartRates = filteredData.map(row => row['Heartrate']);
  const steps = filteredData.map(row => row['Steps']);
  const altitudes = filteredData.map(row => row['Altitude']);
  const temperatures = filteredData.map(row => row['Barometer Temperature']);

  const mapData = filteredData.filter(row => row['Latitude'] && row['Longitude']);

  const graphData = {
    timestamps,
    heartRate: { yData: heartRates, yTitle: "Heart Rate" },
    steps: { yData: steps, yTitle: "Steps" },
    altitude: { yData: altitudes, yTitle: "Altitude" },
    temperature: { yData: temperatures, yTitle: "Temperature" },
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between sm:p-24 p-4">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl p-4 text-center"> Tiilt BangleJS</h1>
        <div className="bg-slate-800 p-4 rounded-lg">
          <form className="grid grid-cols-7 items-center text-black" onSubmit={submitDB}>
            <input className="col-span-2 p-3 border"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
            />
            <button 
              className="col-span-2 text-white bg-slate-600 hover:bg-slate-500 p-3 text-sm mx-3"
              type="submit"
            >
              Submit
            </button>
          </form>
        </div>
        <div>
          <input 
            className="col-span-2 mt-3"
            type="file" 
            onChange={handleFileUpload}   
            ref={fileInputRef} // Assign the ref to the file input
          />
        </div>
      </div>
      {entries.length > 0 && (
        <div className="mt-4">
          <label htmlFor="entrySelect" className="text-black">Select Entry: </label>
          <select id="entrySelect" value={selectedEntry} onChange={(e) => setSelectedEntry(e.target.value)}>
            {entries.map(entry => (
              <option key={entry.id} value={entry.id}>
                {new Date(entry.timestamp.seconds * 1000).toLocaleString()}
              </option>
            ))}
          </select>
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
          <DynamicGraphSingle
            selectedGraph={selectedGraph} 
            graphData={graphData} 
            mapData={mapData} 
            mapFilter={mapFilter} 
          />
        </>
      )}
    </main>
  );
}


