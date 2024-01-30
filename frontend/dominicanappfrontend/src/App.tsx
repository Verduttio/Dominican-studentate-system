import React from 'react';
import './App.css';
import {BrowserRouter as Router, Navigate, Route, Routes} from 'react-router-dom';
import Login from "./pages/auth/Login";
import Home from "./pages/Home";
import TasksPage from "./pages/task/TasksPage";
import UserProfilePage from "./pages/user/UserProfilePage";
import Register from "./pages/auth/Register";
import ObstaclesPage from "./pages/obstacle/ObstaclesPage";
import ConflictsPage from "./pages/conflict/ConflictsPage";
import UsersPage from "./pages/user/UsersPage";
import AddConflict from "./pages/conflict/AddConflict";
import AddTask from "./pages/task/addTask/AddTask";
import AddObstacle from "./pages/obstacle/AddObstacle";
import SchedulePage from "./pages/schedule/SchedulePage";

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
            <Route path="/schedule" Component={SchedulePage}/>
            <Route path="/user-profile" Component={UserProfilePage} />
            <Route path="/add-conflict" Component={AddConflict}/>
            <Route path="/add-task" Component={AddTask}/>
            <Route path="/add-obstacle" Component={AddObstacle}/>
            <Route path="*" element={<Navigate replace to="/login"/>}/>
        </Routes>
      </Router>
  );
}

export default App;
