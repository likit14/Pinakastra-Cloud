import { useEffect, useState } from 'react'
import DeploymentOptions from './View/DeploymentOptions'
import Login from './View/Login'

const App=()=>{
    const [isLogin,setIsLogin]=useState(false)

    useEffect(()=>{
        const loginData=JSON.parse(localStorage.getItem('loginDetails'))
        if(!loginData){
            const loginDetails={
                loginStatus:false
              }
              localStorage.setItem('loginDetails',JSON.stringify(loginDetails))
        }
    },[isLogin])

    function checkLogin(status){
        setIsLogin(status)
    }

    return(
        <>{
            isLogin?<DeploymentOptions/>:<Login checkLogin={checkLogin}/>
        }
        </>
    )
}

export default App