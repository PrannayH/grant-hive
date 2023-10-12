import { useRouter } from "next/router";
import axios from 'axios';
import { useState } from "react";

function loginPage(){
    const router = useRouter();
    const { id } = router.query;

    const [uname, setUname] = useState();
    const [pword, setPword] = useState();

    const submitLogin = async()=>{
        const result = await axios.post(`http://localhost:3000/api/login`, {'username': uname, 'password': pword});
        console.log("hmmm: "+result.data.auth);
        if(result.data.auth){
            localStorage.setItem("token", result.data.token);
            console.log(`after login - http://localhost:3000/${result.data.result.user_role}/${result.data.result.role_id}`);
            router.push(`http://localhost:3000/${result.data.result.user_role}/${result.data.result.role_id}`)
        }
    }

    return(<div className="main-login">
        <div className="login">
            <div className="login-uname">
                <div>Username:</div>
                <input onChange={e=>{setUname(e.target.value)}} value={uname}></input>
            </div>
            <div className="login-pword">
                <div>Password</div>
                <input onChange={e=>{setPword(e.target.value)}} value={pword}></input>
            </div>
            <div>
                <button onClick={submitLogin}>Login!</button>
            </div>
        </div>
    </div>)
}

export default loginPage;