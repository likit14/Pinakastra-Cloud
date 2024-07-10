import { createBrowserRouter } from "react-router-dom";
import App from '../App'
import Signup from "../View/Signup";
import ErrorPageContainer from "../View/ErrorPageContainer";
import DeploymentOptions from "../View/DeploymentOptions";
import DiscoveredMachines from "../View/DiscoveredMachines";
import DesignatedNodes from "../View/DesignatedNodes";
import DeploymentInfo from "../View/DeploymentInfo";
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
        path: '/discoveredmachines',
        element: <DiscoveredMachines/>
    },
    {
        path: '/designatednodes',
        element: <DesignatedNodes/>
    },
    {
        path: '/deploymentinfo',
        element: <DeploymentInfo/>
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