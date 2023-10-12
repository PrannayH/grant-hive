import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from 'axios';

function funder(){
    const router = useRouter();
    const { role, id } = router.query;

    const [queryResult, setQueryResult] = useState();
    let table, table_id;

    useEffect(()=>{
        if(router.isReady){
            getData();
        }
    }, [router.isReady])

    function evaluateRole(){
        if(role=='funder'){table='fundedproject'; table_id='funded_project_id'}
        if(role=='applicant'){table='applicantorganisation'; table_id='organisation_id'}
        if(role=='reviewer'){table='review'; table_id='review_id'}
    }

    const getData = async()=>{
        console.log(`gotten -> ${localStorage.getItem("token")}`)
        evaluateRole();
        const query = `SELECT * FROM ${table} WHERE ${table_id}=${id}`;
        const result = await axios.post(`http://localhost:3000/api/processQuery`, {
            headers: {
                "x-access-token": `${localStorage.getItem("token")}`
            },
            query: query,
            id: id,
            role: role})
        if(result.data.auth){
            console.log("здравстуйте, братан!")
            console.log(result.data.results)
            setQueryResult(result.data.results)
        } else {
            console.log("get banished to homepage!")
            router.push(`http://localhost:3000`)
        }
    }

    return(<div>
        Hi, Mom! {id}
    </div>)
}

export default funder;