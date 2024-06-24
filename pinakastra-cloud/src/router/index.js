import { createBrowserRouter } from "react-router-dom";
import Login from "../View/Login";
import Signup from "../View/Signup";
import DeploymentOptions from "../View/DeploymentOptions";
import ErrorPageContainer from "../View/ErrorPageContainer";
const isLogin=JSON.parse(localStorage.getItem('loginDetails'))&&JSON.parse(localStorage.getItem('loginDetails')).loginStatus    
export const router=createBrowserRouter([
    {
    path:'/',
    element:isLogin?<DeploymentOptions/>:<Login/>,
    errorElement:ErrorPageContainer,
    children:isLogin?[
    ]:[]
    },{
        path:'/signup',
        element:<Signup/>
    }
])