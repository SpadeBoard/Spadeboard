import { Outlet, Navigate } from 'react-router-dom'
import Cookies from 'js-cookie';

const PrivateRoutes = () => {
    if (Cookies.get('access_token') && Cookies.get('access_token') !== "undefined") {
        return <Outlet/>
    }
    else {
       return <Navigate to="/login"/>
    }
}

export default PrivateRoutes