import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import './components/Common.css';
import {BrowserRouter as Router, Navigate, Route, Routes, useLocation} from 'react-router-dom';
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
import ViewRoles from "./pages/role/RolesPage";
import AddRole from "./pages/role/AddRole";
import AddSchedule from "./pages/schedule/AddSchedule";
import ScheduleCreatorRoleSelection from "./pages/schedule/ScheduleCreatorRoleSelection";
import ScheduleCreatorTaskSelection from "./pages/schedule/ScheduleCreatorTaskSelection";
import ScheduleCreatorAssignToTaskWeekly from "./pages/schedule/ScheduleCreatorAssignToTaskWeekly";
import VerifyUserPage from "./pages/user/VerifyUserPage";
import ScheduleCreatorAssignToTaskDaily from "./pages/schedule/ScheduleCreatorAssignToTaskDaily";
import NavigationBar from "./components/NavigationBar";
import EditRole from "./pages/role/EditRole";
import EditConflict from "./pages/conflict/EditConflict";

const AppContent = () => {
    const location = useLocation();
    const hideBarPaths = ['/login', '/register'];
    const backgroundStyle = hideBarPaths.includes(location.pathname) ?
        { minHeight: '100vh' } : {};

    return (
        <>
            {hideBarPaths.includes(location.pathname) ? null : <NavigationBar/>}
            <div className="background" style={backgroundStyle}>
                <Routes>
                    <Route path="/home" Component={Home}/>
                    <Route path="/login" Component={Login}/>
                    <Route path="/register" Component={Register}/>
                    <Route path="/tasks" Component={TasksPage}/>
                    <Route path="/obstacles" Component={ObstaclesPage}/>
                    <Route path="/conflicts" Component={ConflictsPage}/>
                    <Route path="/add-conflict" Component={AddConflict}/>
                    <Route path="/edit-conflict/:conflictId" Component={EditConflict}/>
                    <Route path="/users" Component={UsersPage}/>
                    <Route path="/users/:id/verify" Component={VerifyUserPage}/>
                    <Route path="/roles" Component={ViewRoles}/>
                    <Route path="/add-role" Component={AddRole}/>
                    <Route path="/edit-role/:roleId" Component={EditRole}/>
                    <Route path="/schedule" Component={SchedulePage}/>
                    <Route path="/add-schedule" Component={AddSchedule}/>
                    <Route path="/schedule-creator" Component={ScheduleCreatorRoleSelection}/>
                    <Route path="/schedule-creator/tasks" Component={ScheduleCreatorTaskSelection}/>
                    <Route path="/schedule-creator/task/assignWeekly" Component={ScheduleCreatorAssignToTaskWeekly}/>
                    <Route path="/schedule-creator/task/assignDaily" Component={ScheduleCreatorAssignToTaskDaily}/>
                    <Route path="/user-profile" Component={UserProfilePage}/>
                    <Route path="/add-task" Component={AddTask}/>
                    <Route path="/add-obstacle" Component={AddObstacle}/>
                    <Route path="*" element={<Navigate replace to="/login"/>}/>
                </Routes>
            </div>
        </>
    );
}


function App() {

    return (
      <Router>
          <AppContent />
      </Router>
  );
}

export default App;
