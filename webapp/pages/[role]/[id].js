import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from 'axios';

function roles(){
    const router = useRouter();
    const { role, id } = router.query;

    const [queryResult, setQueryResult] = useState();
    const [actionState, setActionState] = useState("+");
    const [grantType, setGrantType] = useState("program");
    const [fundOpen, setFundOpen] = useState(false)
    let table, table_id;

    useEffect(()=>{
        if(router.isReady){
            getData();
        }
    }, [router.isReady, grantType])

    function evaluateRole(){
        if(role=='funder'){table='fundedproject'; table_id='funded_project_id'}
        if(role=='applicant'){table='applicantorganisation'; table_id='organisation_id'}
        if(role=='reviewer'){table='review'; table_id='review_id'}
    }

    //get data based on role - 
    //applicant - grant proposal | grant programs + review rating + funding amount (use inner join on all for query)
    //
    const getData = async()=>{
        console.log(`gotten -> ${localStorage.getItem("token")}`)
        evaluateRole();
        let query;
        if(role=='applicant'){
            if(grantType==='proposal')
            {query=`select * from
            (select gp.* from applicantorganisation ao
            inner join grantproposal gp where gp.proposal_id=ao.proposal_id) derived
            where derived.proposal_id=${id};`}
            else{query=`select * from
            (select ao.organisation_id id, ao.organisation_name, ao.abstract, gp.program_name, gp.approval_date, gp.deadline, r.review_score, r.review_whom, r.review_date, r.feedback, fp.grant_amount, fp.funded_by_whom, fp.fund_duration from applicantorganisation ao
            inner join grantprogram gp on gp.program_id=ao.organisation_id
            inner join review r on gp.review_id=r.review_id
            inner join fundedproject fp on gp.funded_project_id=fp.funded_project_id) derived
            where derived.id=${id};`}
        }
        if(role=='reviewer'){query=`select * from
        (select ao.organisation_id id, ao.organisation_name, ao.team_lead_fname, ao.team_lead_lname, ao.abstract, gp.proposal_title, gp.required_budget, gp.project_description from applicantorganisation ao
        inner join grantproposal gp on gp.proposal_id=ao.proposal_id) derived;`}
        if(role=='funder'){query=`select * from
        (select ao.organisation_id id, ao.organisation_name, ao.team_lead_fname, ao.team_lead_lname, ao.abstract, gp.proposal_title, gp.required_budget, gp.project_description, gpo.program_name, gpo.approval_date, gpo.deadline, gpo.progress from applicantorganisation ao
        inner join grantproposal gp on gp.proposal_id=ao.proposal_id
        inner join grantprogram gpo on gpo.program_id=gp.proposal_id
        inner join fundedproject fp on fp.funded_project_id=gpo.funded_project_id and gpo.funded_status='not_funded') derived;`}
        // const query = `SELECT * FROM ${table} WHERE ${table_id}=${id}`;
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

    const toggleActionState = ()=>{
        if(actionState==="+"){
            setActionState("x")
        } else {
            setActionState("+")
        }
    }

    const toggleGrantType = ()=>{
        if(grantType==="proposal"){
            setGrantType("program")
        } else {
            setGrantType("proposal")
        }
    }

    return(<div>
        {role=='applicant'?<div>
            <div>
                <div>Hello {localStorage.getItem("loggedInUser")}</div>
                <button onClick={toggleActionState}>{actionState}</button>
            </div>
            <div>
                {actionState=="x"?<div>
                    <div>Create Grant Proposal</div>
                    <div>Proposal Name</div>
                    <div><input></input></div>
                    <div>Required Budget</div>
                    <div><input></input></div>
                    <div>Proposal Description</div>
                    <div><input></input></div>
                </div>:
                <div>
                    <div><button onClick={toggleGrantType}>Your existing {grantType}</button></div>
                    {grantType=="proposal"?<div>
                        <div>some sort a map function to render all PROPOSAL data. design the div by yourself</div>
                    </div>:
                    <div>
                        <div>some sort a map function to render all PROGRAM + REVIEW(rating) + FUNDER(fund amount) data. design the div by yourself</div>
                    </div>}
                </div>}
            </div>
        </div>:<div></div>}
        {role=='reviewer'?<div>
            <div>
                <div>Hello {localStorage.getItem("loggedInUser")}</div>
                {/* <button onClick={toggleActionState}>{actionState}</button> */}
            </div>
            <div>
                some sort a map function to render all GRANT PROPOSAL data(so reviewers can approve/reject). design the div by yourself
                <div>
                    <div>Enter Rating</div>
                    <div><input></input></div>
                    <button>Approve</button>
                    <button>Reject</button>
                </div>
            </div>
        </div>:<div></div>}
        {role=='funder'?<div>
            <div>
                <div>Hello {localStorage.getItem("loggedInUser")}</div>
                {/* <button onClick={toggleActionState}>{actionState}</button> */}
            </div>
            <div>
                some sort a map function to render all GRANT PROGRAM data(so funders can approve/reject + decide amount). design the div by yourself
                <div>
                    <button onClick={()=>{setFundOpen(!fundOpen)}}>Want to Fund?</button>
                    {fundOpen?<div>
                        <div>Set Amount</div>
                        <div><input></input></div>
                        <button>Approve</button>
                    </div>:
                    <button>Reject</button>}
                </div>
            </div>
        </div>:<div></div>}

    </div>)
}

export default roles;