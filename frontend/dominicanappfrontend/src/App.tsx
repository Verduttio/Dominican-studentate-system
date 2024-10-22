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
import SchedulePage from "./pages/schedule/pages/printings/SchedulePage";
import ViewRoles from "./pages/role/RolesPage";
import AddRole from "./pages/role/AddRole";
import AddScheduleRoleSelection from "./pages/schedule/pages/AddScheduleRoleSelection";
import VerifyUserPage from "./pages/user/VerifyUserPage";
import NavigationBar from "./components/NavigationBar";
import EditRole from "./pages/role/EditRole";
import EditConflict from "./pages/conflict/EditConflict";
import EditObstacle from "./pages/obstacle/EditObstacle";
import EditTask from "./pages/task/EditTask";
import OtherEntities from "./pages/other/OtherEntities";
import AddMyObstacle from "./pages/obstacle/add/AddMyObstacle";
import UserDetailsViewer from "./pages/user/UserDetailsViewer";
import HomeLogged from "./pages/HomeLogged";
import AddScheduleWeekly from "./pages/schedule/pages/AddScheduleWeekly";
import AddScheduleDaily from "./pages/schedule/pages/AddScheduleDaily";
import DatesPage from "./pages/specialDate/DatesPage";
import NonStandardPdfPrinterPage from "./pages/schedule/pages/printings/NonStandardPdfPrinterPage";
import AddScheduleWeeklyByAllDays from "./pages/schedule/pages/AddScheduleWeeklyByAllDays";
import SchedulePageByDays from "./pages/schedule/pages/printings/SchedulePageByDays";
import MyObstacleDetails from "./pages/obstacle/MyObstacleDetails";
import TaskDetails from "./pages/task/TaskDetails";
import EditTasksOrder from "./pages/task/editTaskOrder/EditTasksOrder";
import ObstaclesSettingsPage from "./pages/obstacle/settings/ObstaclesSettingsPage";
import UsersRolesByCategory from "./pages/role/UsersRolesByCategory";
import LinksPage from "./pages/links/LinksPage";
import LinksSettingsPage from "./pages/links/LinksSettingsPage";
import AddLinkPage from "./pages/links/add/AddLinkPage";
import EditLinkPage from "./pages/links/edit/EditLinkPage";
import EditRolesOrderPage from "./pages/role/editRoleOrder/EditRolesOrderPage";
import TasksVisibilitySettingsPage from "./pages/task/TasksVisibilitySettingsPage";

const AppContent = () => {
    const location = useLocation();
    const hideBarPaths = ['/loginForm', '/register'];
    const fluidContainerPaths = ['/add-schedule/weekly', '/add-schedule/weekly/by-all-days', '/add-schedule/daily'];

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
                    <Route path="/tasks/visibility" Component={TasksVisibilitySettingsPage}/>
                    <Route path="/tasks/order/edit" Component={EditTasksOrder}/>
                    <Route path="/tasks/details/:taskId" Component={TaskDetails}/>
                    <Route path="/add-task" Component={AddTask}/>
                    <Route path="/edit-task/:taskId" Component={EditTask}/>
                    <Route path="/obstacles" Component={ObstaclesPage}/>
                    <Route path="/obstacles/settings" Component={ObstaclesSettingsPage}/>
                    <Route path="/obstacles/my/:obstacleId" Component={MyObstacleDetails}/>
                    <Route path="/add-obstacle" Component={AddObstacle}/>
                    <Route path="/edit-obstacle/:obstacleId" Component={EditObstacle} />
                    <Route path="/conflicts" Component={ConflictsPage}/>
                    <Route path="/add-conflict" Component={AddConflict}/>
                    <Route path="/edit-conflict/:conflictId" Component={EditConflict}/>
                    <Route path="/users" Component={UsersPage}/>
                    <Route path="/users/:id/verify" Component={VerifyUserPage}/>
                    <Route path="/roles" Component={ViewRoles}/>
                    <Route path="/roles/users" Component={UsersRolesByCategory}/>
                    <Route path="/roles/edit-order" Component={EditRolesOrderPage}/>
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
                    <Route path="/user-profile" Component={UserProfilePage}/>
                    <Route path="/other" Component={OtherEntities}/>
                    <Route path="/links" Component={LinksPage}/>
                    <Route path="/links/settings" Component={LinksSettingsPage}/>
                    <Route path="/links/settings/edit/:id" Component={EditLinkPage}/>
                    <Route path="/links/settings/add" Component={AddLinkPage}/>
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
