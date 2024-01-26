import React from 'react';
import './App.css';
import {BrowserRouter as Router, Navigate, Route, Routes} from 'react-router-dom';
import Login from "./components/Login";
import Home from "./components/Home";
import TasksPage from "./components/TaskPage";
import UserProfilePage from "./components/UserProfilePage";
import Register from "./components/Register";

function App() {
  return (
      <Router>
        <Routes>
            <Route path="/home" Component={Home}/>
            <Route path="/login" Component={Login}/>
            <Route path="/register" Component={Register}/>
            <Route path="/tasks" Component={TasksPage}/>
            <Route path="/user-profile" Component={UserProfilePage} />
            <Route path="*" element={<Navigate replace to="/login"/>}/>
        </Routes>
      </Router>
  );
}

export default App;
