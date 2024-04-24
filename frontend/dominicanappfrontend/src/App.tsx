import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
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
import AddScheduleRoleSelection from "./pages/schedule/AddScheduleRoleSelection";
import ScheduleCreatorRoleSelection from "./pages/schedule/ScheduleCreatorRoleSelection";
import ScheduleCreatorTaskSelection from "./pages/schedule/ScheduleCreatorTaskSelection";
import ScheduleCreatorAssignToTaskWeekly from "./pages/schedule/ScheduleCreatorAssignToTaskWeekly";
import VerifyUserPage from "./pages/user/VerifyUserPage";
import ScheduleCreatorAssignToTaskDaily from "./pages/schedule/ScheduleCreatorAssignToTaskDaily";
import NavigationBar from "./components/NavigationBar";
import EditRole from "./pages/role/EditRole";
import EditConflict from "./pages/conflict/EditConflict";
import EditObstacle from "./pages/obstacle/EditObstacle";
import EditTask from "./pages/task/EditTask";
import ScheduleCreatorChooseMethod from "./pages/schedule/ScheduleCreatorChooseMethod";
import OtherEntities from "./pages/other/OtherEntities";
import AddMyObstacle from "./pages/obstacle/AddMyObstacle";
import UserDetailsViewer from "./pages/user/UserDetailsViewer";
import HomeLogged from "./pages/HomeLogged";
import AddScheduleWeekly from "./pages/schedule/AddScheduleWeekly";
import AddScheduleDaily from "./pages/schedule/AddScheduleDaily";
import DatesPage from "./pages/specialDate/DatesPage";
import NonStandardPdfPrinterPage from "./pages/schedule/NonStandardPdfPrinterPage";
import AddScheduleWeeklyByAllDays from "./pages/schedule/AddScheduleWeeklyByAllDays";
import SchedulePageByDays from "./pages/schedule/SchedulePageByDays";

const AppContent = () => {
    const location = useLocation();
    const hideBarPaths = ['/loginForm', '/register'];
    const fluidContainerPaths = ['/add-schedule/weekly'];

    const containerClass = fluidContainerPaths.includes(location.pathname) ? 'container-fluid' : 'container';

    return (
        <>
            {hideBarPaths.includes(location.pathname) ? null : <NavigationBar/>}
            <div className={containerClass}>
                <Routes>
                    <Route path="/home" Component={Home}/>
                    <Route path="/home/logged" Component={HomeLogged}/>
                    <Route path="/loginForm" Component={Login}/>
                    <Route path="/register" Component={Register}/>
                    <Route path="/tasks" Component={TasksPage}/>
                    <Route path="/add-task" Component={AddTask}/>
                    <Route path="/edit-task/:taskId" Component={EditTask}/>
                    <Route path="/obstacles" Component={ObstaclesPage}/>
                    <Route path="/add-obstacle" Component={AddObstacle}/>
                    <Route path="/edit-obstacle/:obstacleId" Component={EditObstacle} />
                    <Route path="/conflicts" Component={ConflictsPage}/>
                    <Route path="/add-conflict" Component={AddConflict}/>
                    <Route path="/edit-conflict/:conflictId" Component={EditConflict}/>
                    <Route path="/users" Component={UsersPage}/>
                    <Route path="/users/:id/verify" Component={VerifyUserPage}/>
                    <Route path="/roles" Component={ViewRoles}/>
                    <Route path="/add-role" Component={AddRole}/>
                    <Route path="/edit-role/:roleId" Component={EditRole}/>
                    <Route path="/dates" Component={DatesPage}/>
                    <Route path="/pdf/non-standard" Component={NonStandardPdfPrinterPage}/>
                    <Route path="/schedule" Component={SchedulePage}/>
                    <Route path="/schedule/by-days" Component={SchedulePageByDays}/>
                    <Route path="/add-schedule/select-role" Component={AddScheduleRoleSelection}/>
                    <Route path="/add-schedule/weekly" Component={AddScheduleWeekly}/>
                    <Route path="/add-schedule/daily" Component={AddScheduleDaily}/>
                    <Route path="/add-schedule/weekly/by-all-days" Component={AddScheduleWeeklyByAllDays}/>
                    <Route path="/schedule-creator" Component={ScheduleCreatorRoleSelection}/>
                    <Route path="/schedule-creator/tasks" Component={ScheduleCreatorTaskSelection}/>
                    <Route path="/schedule-creator/task/chooseMethod" Component={ScheduleCreatorChooseMethod}/>
                    <Route path="/schedule-creator/task/assignWeekly" Component={ScheduleCreatorAssignToTaskWeekly}/>
                    <Route path="/schedule-creator/task/assignDaily" Component={ScheduleCreatorAssignToTaskDaily}/>
                    <Route path="/user-profile" Component={UserProfilePage}/>
                    <Route path="/other" Component={OtherEntities}/>
                    <Route path="/add-obstacle/myself" Component={AddMyObstacle}/>
                    <Route path="/users/:userId/viewer/details" Component={UserDetailsViewer}/>
                    <Route path="*" element={<Navigate replace to="/loginForm"/>}/>
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
