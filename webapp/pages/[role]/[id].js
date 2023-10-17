import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from 'axios';

function roles(){
    const router = useRouter();
    const { role, id } = router.query;

    const [queryResult, setQueryResult] = useState([]);
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
        {role === 'applicant' ? (
            <div>
                <nav className="navbar-log">
                    <div className="logo2">
                        <h1>GrantHive</h1>
                    </div>
                </nav>
                <div>
                    <div className="user-greeting">Hello <span>{localStorage.getItem("loggedInUser")}</span>!</div>
                    <button className="toggle-button" onClick={toggleActionState}>
                        {actionState}
                    </button>
                </div>
                <div>
                    {actionState === "x" ? (
                        <div className="proposal-form">
                            <div style={{ fontSize: '20px', textAlign: 'center', margin: '1% auto', fontWeight: 'bold', color:'#703131' }}>Create Grant Proposal</div>
                            <div style={{ marginTop: '3%' }}>
                                <div className="input-pair">
                                    <div>Proposal Name :</div>
                                    <div>
                                        <input type="text" />
                                    </div>
                                </div>
                                <div className="input-pair">
                                    <div>Required Budget :</div>
                                    <div>
                                        <input type="text" />
                                    </div>
                                </div>
                                <div className="input-pair">
                                    <div>Proposal Description :</div>
                                    <div>
                                        <textarea rows="4" cols="30" style={{ border: '1px solid black' }}></textarea>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <button style={{
                                        padding: '10px 20px',
                                        background: '#582626',
                                        color: '#fff',
                                        border: 'none',
                                        cursor: 'pointer',
                                        borderRadius: '5px',
                                        fontSize: '12px',
                                        fontWeight: 'bold'
                                    }}>Submit</button>
                                </div>
                            </div>

                        </div>
                    ) : (
                        <div className="existing-data">
                            <div>
                                <button className="toggle-data-button" onClick={toggleGrantType}>
                                    Your existing {grantType}(s)
                                </button>
                            </div>
                            {grantType === "proposal" ? (
                                    <div>
                                        {queryResult.map((item, index) => (
                                            <div key={index} className="proposal-item">                                                
                                                {/* <div className="hmm">Program ID: {item.program_id}</div> */}
                                                <div className="hmm">Proposal ID: {item.proposal_id}</div>
                                                <div className="hmm">Proposal Title: {item.proposal_title}</div>
                                                <div className="hmm">Project Description: {item.project_description}</div>
                                                <div className="hmm">Required Budget: {item.required_budget}</div>
                                            </div>
                                        ))}
                                    </div>
                            ) : (
                                    <div>
                                        {queryResult.map((item, index) => (
                                            <div key={index} className="program-item1">
                                                <div className="hmm">ID: {item.id}</div>
                                                <div className="hmm">Abstract: {item.abstract}</div>
                                                <div className="hmm">Grant Amount: {item.grant_amount}</div> 
                                                <div className="hmm">Organisation Name: {item.organisation_name}</div>
                                                <div className="hmm">Program Name: {item.program_name}</div>
                                                <div className="hmm">Approval date: {item.approval_date}</div>
                                                <div className="hmm">Feedback: {item.feedback}</div>
                                                <div className="hmm">Deadline: {item.deadline}</div>
                                                <div className="hmm">Funded By: {item.funded_by_whom}</div>
                                                <div className="hmm">Fund Duration: {item.fund_duration}</div>
                                                <div className="hmm">Review Date: {item.review_date}</div>
                                                <div className="hmm">Reviewed By: {item.review_whom}</div>
                                                <div className="hmm">Review Score: {item.review_score}</div>

                                            </div>
                                        ))}
                                    </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        ) : (
            <div></div>
        )}

        {role=='reviewer'?<div>
            <nav className='navbar-log'>
                <div className="logo2">
                    <h1>
                        GrantHive
                    </h1>
                </div>
            </nav>
            <div>
                <div className="user-greeting">Hello {localStorage.getItem("loggedInUser")}!</div>
                {/* <button onClick={toggleActionState}>{actionState}</button> */}
            </div> 
            <div className="rev-container">
                {/* Display the program items with buttons on the right */}
                <div className="rev-info">
                    {queryResult.map((item, index) => (
                        <div key={index} className="rev-item">
                            <div className="aa">
                                <div className="hm">Proposal ID: {item.id}</div>
                                <div className="hm">Proposal Title: {item.proposal_title}</div>
                                <div className="hm">Organisation Name: {item.organisation_name}</div>
                                <div className="hm">Team Leader: {item.team_lead_fname} {item.team_lead_lname}</div>
                                {/* <div className="hm">Proposal ID: {item.id}</div> */}
                                <div className="hm">Project Description: {item.project_description}</div>
                                <div className="hm">Required Budget: {item.required_budget}</div>
                            </div>
                            <div className="rev-content">
                                <div className="rev-details">
                                    <div className="rev-detail">
                                        <label className="rev-lab" htmlFor="rating">Enter Rating</label>
                                        <input type="number" id="rating" min="1" max="5" step="0.1" />
                                    </div>
                                    <div className="rev-actions">
                                        <button className="approve-button">Approve</button>
                                        <button className="reject-button">Reject</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            

        </div>:<div></div>}
        {role === 'funder' ? (
            <div>
                <nav className='navbar-log'>
                    <div className="logo2">
                        <h1>GrantHive</h1>
                    </div>
                </nav>
                <div>
                    <div className="user-greeting">Hello {localStorage.getItem("loggedInUser")}!</div>
                </div>
                <div className="grant-program-container">
                    {/* Display the program items with buttons on the right */}
                    <div className="grant-program-info">
                        {queryResult.map((item, index) => (
                            <div key={index} className="program-item">
                                <div className = "aa">
                                <div className="hm">Program ID: {item.id}</div>
                                <div className="hm">Organisation Name: {item.organisation_name}</div>
                                <div className="hm">Team Leader: {item.team_lead_fname} {item.team_lead_lname}</div>
                                <div className="hm">Proposal Title: {item.proposal_title}</div>                                                             
                                <div className="hm">Program Name: {item.program_name}</div>
                                {/* <div className="hm">Abstract: {item.abstract}</div> */}
                                <div className="hm">Project Description: {item.project_description}</div>
                                <div className="hm">Required Budget: {item.required_budget}</div>
                                <div className="hm">Approval Date: {item.approval_date}</div>
                                <div className="hm">Deadline: {item.deadline}</div>
                                <div className="hm">Progress: {item.progress}</div>
                                </div>
                                <div className="grant-program-actions">
                                    <button className="fund-button" onClick={() => { setFundOpen(!fundOpen) }}>Want to Fund?</button>
                                    {fundOpen ? (
                                        <div className="fund-form">
                                            <div className="set-amount-label">Set Amount</div>
                                            <div className="set-amount-input">
                                                <input type="text" />
                                            </div>
                                            <button className="approve1-button">Approve</button>
                                        </div>
                                    ) : (
                                        <button className="reject1-button">Reject</button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        ) : (
            <div></div>
        )}


    </div>)
}

export default roles;