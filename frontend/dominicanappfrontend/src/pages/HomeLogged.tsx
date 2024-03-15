import Home from "./Home";
import useCreateCurrentUserCookie from "../services/UseCreateCurrentUser";
import LoadingSpinner from "../components/LoadingScreen";
import AlertBox from "../components/AlertBox";

function HomeLogged() {
    const { currentUser, initializedCurrent, loadingCurrent, errorCurrent } = useCreateCurrentUserCookie();

    if(initializedCurrent) return <LoadingSpinner/>;
    if(errorCurrent) return <AlertBox text={errorCurrent} type={'danger'} width={'500px'}/>;
    return (
        <Home/>
    );
}

export default HomeLogged;