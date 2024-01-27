import React from 'react';
import './App.css';
import {BrowserRouter as Router, Navigate, Route, Routes} from 'react-router-dom';
import Login from "./pages/Login";
import Home from "./pages/Home";
import TasksPage from "./pages/TasksPage";
import UserProfilePage from "./pages/UserProfilePage";
import Register from "./pages/Register";
import ObstaclesPage from "./pages/ObstaclesPage";
import ConflictsPage from "./pages/ConflictsPage";
import UsersPage from "./pages/UsersPage";
import AddConflict from "./pages/AddConflict";

function App() {
  return (
      <Router>
        <Routes>
            <Route path="/home" Component={Home}/>
            <Route path="/login" Component={Login}/>
            <Route path="/register" Component={Register}/>
            <Route path="/tasks" Component={TasksPage}/>
            <Route path="/obstacles" Component={ObstaclesPage}/>
            <Route path="/conflicts" Component={ConflictsPage}/>
            <Route path="/users" Component={UsersPage}/>
            <Route path="/user-profile" Component={UserProfilePage} />
            <Route path="/add-conflict" Component={AddConflict}/>
            <Route path="*" element={<Navigate replace to="/login"/>}/>
        </Routes>
      </Router>
  );
}

export default App;
