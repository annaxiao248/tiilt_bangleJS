'use client'
import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function Home() {
  const [name, setName] = useState('');
  const [randomString, setRandomString] = useState(''); 

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
      </div>
    </main>
  );
}
