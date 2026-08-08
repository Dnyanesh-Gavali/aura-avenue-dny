
import React from 'react';
import { BrowserRouter as Router, Routes, Route, BrowserRouter } from 'react-router-dom';
import DestApp from '../pages/Destination-pages/DestApp';
import AuthApp from '../authentication/AuthApp'
import Home from './Home'; 
import Login from '../authentication/Login';
import Signup from '../authentication/Signup';
import Contact from '../authentication/Contact';
import About from '../authentication/About';


function HomeApp() {
  return (
    <></>
    // <BrowserRouter>
    //   <Routes>
    //     {/* 2. Tell React to load your Home component when users visit the main link */}
    //     <Route path="/" element={<Home />} />
    //     <Route path = "/destinations/*" element = {<DestApp/>} />
    //     <Route path="/login" element = {<Login/>} />
    //     <Route path="/signup" element={<Signup />} />
    //     <Route path="/contact" element={<Contact />} />
    //     <Route path="/about" element={<About />} />
    //   </Routes>
    // </BrowserRouter>
  );
}

export default HomeApp;
