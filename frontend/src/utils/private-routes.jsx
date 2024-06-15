import { Outlet, Navigate } from 'react-router-dom'
import Cookies from 'js-cookie';

const PrivateRoutes = () => {
    return(
        Cookies.get('access_token') ? <Outlet/> : <Navigate to="/login"/>
    )
}

export default PrivateRoutes