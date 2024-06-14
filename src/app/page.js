'use client'
import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import Papa from 'papaparse';
import Graph from "../components/graph";

export default function Home() {
  const [name, setName] = useState('');
  const [randomString, setRandomString] = useState(''); 
  const [data, setData] = useState([]);
  const [selectedGraph, setSelectedGraph] = useState('heartRate');

  function generateRandomString() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < 10; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    setRandomString(result);
    console.log("rand str:", result);
  }

  // add name to db
  const submitDB = async (e) => {
    e.preventDefault();
    if (name !== '' && randomString !== '') {
      console.log("submittin:", name, randomString);
      await addDoc(collection(db, 'tiilt-bangleJS'), {
        name: name.trim(),
        data: randomString
      });
      setName('');
      setRandomString('');
    } else {
      alert('Please enter a name and generate a random string.');
    }
  }

  // const handleFileUpload = (e) => {
  //   const file = e.target.files[0];
  //   Papa.parse(file, {
  //     header: true,
  //     dynamicTyping: true,
  //     complete: function(results) {
  //       console.log("Parsed Data:", results.data);
  //       setData(results.data);
  //     }
  //   });
  // };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      complete: function(results) {
        // console.log("Parsed Data:", results.data.slice(0, 5)); 
        if (results.data.length > 0) {
          console.log("Field Names:", Object.keys(results.data[0])); 
        }
        setData(results.data);
      }
    });
  };
  


  console.log("data heree", data)
  // console.log("yayya", data[1])
  
  const filteredData = data.filter(row => {
    // console.log("Row Confidence:", row['Confidence']); // Adjust field name if necessary
    return row['Confidence'] > 70; // Adjust field name if necessary
  });
  // console.log("Filtered Data:", filteredData);

  // const filteredData = data.filter(row => row.confidence > 70);
  const timestamps = filteredData.map(row => row['Time']);
  const heartRates = filteredData.map(row => row['Heartrate']);
  const steps = filteredData.map(row => row['Steps']);
  const altitudes = filteredData.map(row => row['Altitude']);
  const temperatures = filteredData.map(row => row['Barometer Temperature']);

  // console.log("Timestamps:", timestamps);
  // console.log("Heart Rates:", heartRates);
  // console.log("Steps:", steps);
  // console.log("Altitudes:", altitudes);
  // console.log("Temperatures:", temperatures);

  const graphData = {
    heartRate: { yData: heartRates, yTitle: "Heart Rate" },
    steps: { yData: steps, yTitle: "Steps" },
    altitude: { yData: altitudes, yTitle: "Altitude" },
    temperature: { yData: temperatures, yTitle: "Temperature " },
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
            <input className="col-span-3 p-3 border mx-3"
              type="text"
              value={randomString}
              placeholder="Random String"
              readOnly
            />
            <button 
              type="button"
              onClick={generateRandomString}
              className="col-span-2 text-white bg-slate-600 hover:bg-slate-500 p-3 text-sm"
            >
              Generate string
            </button>
            
          </form>
          
        </div>
        
        <button 
          onClick={submitDB}
          className="col-span-2 text-white bg-slate-600 hover:bg-slate-500 p-3 text-sm mt-5 align-center"
          type="submit"
        >
          Submit
        </button>
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
              </select>
            </div>
            <Graph 
              id={`${selectedGraph}Graph`} 
              title={selectedGraph.charAt(0).toUpperCase() + selectedGraph.slice(1)} 
              xData={timestamps} 
              yData={graphData[selectedGraph].yData} 
              yTitle={graphData[selectedGraph].yTitle} 
            />
          </>
        )}
     
    </main>
  );
}
