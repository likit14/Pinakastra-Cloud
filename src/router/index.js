import { createBrowserRouter } from "react-router-dom";
import App from '../App'
import Signup from "../View/Signup";
import ErrorPageContainer from "../View/ErrorPageContainer";
import DeploymentOptions from "../View/DeploymentOptions";
import NetworkScanner from "../View/NetworkScanner"
import DesignatedNode from "../View/DesignatedNode";
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