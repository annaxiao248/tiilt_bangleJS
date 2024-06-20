'use client'
import React, { useState } from 'react';
import { collection, doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import Papa from 'papaparse';
import DynamicGraph from '../components/dynamicGraph';

export default function Home() {
  const [name, setName] = useState('');
  const [data, setData] = useState([]);
  const [selectedGraph, setSelectedGraph] = useState('heartRate');
  const [mapFilter, setMapFilter] = useState('all');

  // add name and data to db
  const submitDB = async (e) => {
    e.preventDefault();
    if (name !== '' && data.length > 0) {
      console.log("submitting:", name, data);
      await setDoc(doc(db, 'tiilt-bangleJS', name.trim()), {
        name: name.trim(),
        data: data
      });
      setName('');
      setData([]);
    } else {
      alert('Please enter a name and upload a CSV file.');
    }
  };

  // fetch data from db
  const fetchDataFromDB = async (e) => {
    e.preventDefault();
    if (name !== '') {
      const docRef = doc(db, 'tiilt-bangleJS', name.trim());
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const fetchedData = docSnap.data().data.map(entry => {
          if (entry.Time instanceof Timestamp) {
            return {
              ...entry,
              Time: entry.Time.toDate()
            };
          }
          return entry;
        });
        console.log("fetched data:", fetchedData);
        setData(fetchedData);
      } else {
        alert('No data found for this name.');
      }
    } else {
      alert('Please enter a name.');
  }
};

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
              className="col-span-2 text-white bg-slate-600 hover:bg-slate-500 p-3 text-sm"
              type="submit"
            >
              Submit
            </button>
            <button 
              onClick={fetchDataFromDB}
              className="col-span-2 text-white bg-slate-600 hover:bg-slate-500 p-3 text-sm"
              type="button"
            >
              Fetch Data
            </button>
          </form>
        </div>
        <div>
          <input 
            className= "col-span-2 mt-3"
            type="file" 
            onChange={handleFileUpload}   
          />
        </div>
      </div>
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
            mapData={mapData} 
            mapFilter={mapFilter} 
          />
        </>
      )}
    </main>
  );
}
