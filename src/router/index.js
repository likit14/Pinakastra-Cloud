import { createBrowserRouter } from "react-router-dom";
import App from '../App'
import Signup from "../View/Signup";
import ErrorPageContainer from "../View/ErrorPageContainer";
import DeploymentOptions from "../View/DeploymentOptions";
import NetworkScanner from "../View/NetworkScanner";
import DesignatedNode from "../View/DesignatedNode";
import Dashboard  from "../View/Dashboard";
import Scaleup from "../View/Scaleup";
export const router=createBrowserRouter([
    {
    path:'/',
    element:<App/>,
    errorElement:<ErrorPageContainer /> ,
    children:[
    {
        path: '/',
        element: <DeploymentOptions/>
    },
    {
        path: '/networkscanner',
        element: <NetworkScanner/>
    },
    {
        path: '/designatednode',
        element: <DesignatedNode/>
    },
    {
        path: '/designatednode',
        element: <DesignatedNode/>
    },
    {
        path: '/dashboard',
        element: <Dashboard/>
    },
    {
        path: '/scaleup',
        element: <Scaleup/>
    }
    ]
    },
    {
        path:'/signup',
        element:<Signup/>
    },
    {
        path: '/*',
        element: <ErrorPageContainer /> // Fallback for any undefined routes
    }
])