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

    const [pfName, setPfName] = useState("");
    const [pfBudget, setPfBudget] = useState("");
    const [pfDesc, setPfDesc] = useState("");

    const [rating, setRating] = useState("");
    const [ratingChange, setRatingChange] = useState(false);
    const [feedback, setFeedback] = useState("");
    
    const [fundAmount, setFundAmount] = useState("");
    let table, table_id;

    useEffect(()=>{
        if(router.isReady){
            getData();
        }
    }, [router.isReady, grantType, ratingChange])

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
            {query=`select * from grantproposal where organisation_id=${id};`}
            else{query=`select * from
            (select ao.organisation_id id, ao.organisation_name, gp.program_description, gp.program_budget, gp.program_name, gp.approval_date, gp.deadline, r.review_score, r.review_whom, r.review_date, r.feedback from applicantorganisation ao
            inner join grantprogram gp on gp.organisation_id=ao.organisation_id
            inner join review r on gp.review_id=r.review_id) derived
            where derived.id=${id};`}
        }
        if(role=='reviewer'){query=`select * from
        (select gp.proposal_id id, ao.organisation_name, ao.team_lead_fname, ao.team_lead_lname, ao.abstract, gp.proposal_title, gp.required_budget, gp.project_description from applicantorganisation ao
        inner join grantproposal gp on ao.organisation_id=gp.organisation_id) derived;`}
        if(role=='funder'){query=`select * from
        (select ao.organisation_id id, ao.organisation_name, ao.team_lead_fname, ao.team_lead_lname, gpo.program_name, gpo.program_budget, gpo.program_description, gpo.approval_date, gpo.deadline, gpo.progress from applicantorganisation ao
        inner join grantprogram gpo on ao.organisation_id=gpo.organisation_id and gpo.funded_status='not_funded') derived;`}
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

    const setForeignKeyCheck = async(state)=>{
        const query = `set foreign_key_checks=${state}`;
        // const mergedquery = query.join(';')+";";
        const result = await axios.post("http://localhost:3000/api/processQuery", {
            headers: {
                "x-access-token": `${localStorage.getItem("token")}`
            },
            query: query,
            id: id,
            role: role
        })
        if(result.data.auth){
            console.log(`foreign key check set to ${state}`)
        } else {
            console.log("foreign key check wawawawa :(")
        }
    }

    const submitProposal = async()=>{
        const query = `insert into grantproposal(proposal_title, required_budget, project_description, organisation_id) values ('${pfName}', ${pfBudget}, '${pfDesc}', ${id})`;
        // const mergedquery = query.join(';')+";";
        await setForeignKeyCheck(0);
        const result = await axios.post("http://localhost:3000/api/processQuery", {
            headers: {
                "x-access-token": `${localStorage.getItem("token")}`
            },
            query: query,
            id: id,
            role: role
        })
        if(result.data.auth){
            console.log("inserted values!")
        } else {
            console.log("wawawawa :(")
        }
        await setForeignKeyCheck(1);
        setPfName("")
        setPfBudget("")
        setPfDesc("")
    }

    
    const rejectProposal = async(item_id)=>{
        const query = `delete from grantproposal where proposal_id=${item_id};`;
        console.log(item_id);
        // const mergedquery = query.join(';')+";";
        await setForeignKeyCheck(0);
        const result = await axios.post("http://localhost:3000/api/processQuery", {
            headers: {
                "x-access-token": `${localStorage.getItem("token")}`
            },
            query: query,
            id: id,
            role: role
        })
        if(result.data.auth){
            console.log("rejected proposal!")
            setRatingChange(!ratingChange);
        } else {
            console.log("reject proposal wawawawa :(")
        }
        await setForeignKeyCheck(1);
    }
    const approveProposal = async(item_id)=>{

        console.log(item_id);
        // const mergedquery = query.join(';')+";";
        let proposalInfo;
        let reviewInfo;
        let applicantInfo;
        await setForeignKeyCheck(0);

        const proposalInfoQuery = `select * from grantproposal where proposal_id=${item_id};`;
        const proposalInfoRes = await axios.post("http://localhost:3000/api/processQuery", {
            headers: {
                "x-access-token": `${localStorage.getItem("token")}`
            },
            query: proposalInfoQuery,
            id: id,
            role: role
        })
        if(proposalInfoRes.data.auth){
            proposalInfo = proposalInfoRes.data.results[0];
            console.log("got proposalInfoQuery!")
            console.log(proposalInfo)
        } else {
            console.log("proposalInfoQuery wawawawa :(")
        }

        const insertReviewInfo = `insert into review(review_id, review_score, review_whom, review_date, feedback) values (${proposalInfo['proposal_id']}, ${rating}, '${localStorage.getItem("loggedInUser")}', '2023-01-01', '${feedback}')`;
        // const mergedquery = query.join(';')+";";
        const reviewInfoRes = await axios.post("http://localhost:3000/api/processQuery", {
            headers: {
                "x-access-token": `${localStorage.getItem("token")}`
            },
            query: insertReviewInfo,
            id: id,
            role: role
        })
        if(reviewInfoRes.data.auth){
            applicantInfo = reviewInfoRes.data.results[0];
            console.log("got reviewInfoQuery!")
            console.log(reviewInfo)
        } else {
            console.log("reviewInfoQuery wawawawa :(")
        }
        
        const insertGrantProgram = `insert into grantprogram(program_name, approval_date, deadline, progress, funded_status, organisation_id, review_id, program_budget, program_description) values ('${proposalInfo['proposal_title']}', '2023-01-01', '2023-06-02','Pending','not_funded','${proposalInfo['organisation_id']}', ${proposalInfo['proposal_id']}, ${proposalInfo['required_budget']}, '${proposalInfo['project_description']}');`;
        console.log(item_id);
        // const mergedquery = query.join(';')+";";
        await setForeignKeyCheck(0);
        const result = await axios.post("http://localhost:3000/api/processQuery", {
            headers: {
                "x-access-token": `${localStorage.getItem("token")}`
            },
            query: insertGrantProgram,
            id: id,
            role: role
        })
        if(result.data.auth){
            console.log("inserted grant program")
        } else {
            console.log("insert grant program wawawawa :(")
        }

        //remove from grant proposal after approving, bad name because reusing function
        rejectProposal(item_id);
        await setForeignKeyCheck(1);
    }

    const approveFunding = async(program_id, currentBudget)=>{
        const newFundingQuery = `insert into fundedproject(grant_amount, funded_by_whom, fund_duration, program_id) values (${fundAmount}, '${localStorage.getItem("loggedInUser")}', ${6}, ${program_id})`;
        // const mergedquery = query.join(';')+";";
        await setForeignKeyCheck(0);
        const newFundingRes = await axios.post("http://localhost:3000/api/processQuery", {
            headers: {
                "x-access-token": `${localStorage.getItem("token")}`
            },
            query: newFundingQuery,
            id: id,
            role: role
        })
        if(newFundingRes.data.auth){
            console.log("inserted new funding instance!")
        } else {
            console.log("inserted new funding instance wawawawa :(")
        }

        let updatedBudget = currentBudget - fundAmount;
        if(updatedBudget<0){updatedBudget=0;}
        let funded = updatedBudget===0?'funded':'not_funded';
        console.log("updated budget: ", updatedBudget, "->", currentBudget, "-", fundAmount, "[] funded", funded);
        const decrementRequiredBudgetQuery = `update grantprogram set program_budget=${updatedBudget}, funded_status='${funded}' where program_id=${program_id}`;
        // const mergedquery = query.join(';')+";";
        await setForeignKeyCheck(0);
        const decrementRequiredBudgetRes = await axios.post("http://localhost:3000/api/processQuery", {
            headers: {
                "x-access-token": `${localStorage.getItem("token")}`
            },
            query: decrementRequiredBudgetQuery,
            id: id,
            role: role
        })
        if(decrementRequiredBudgetRes.data.auth){
            console.log("decremented required budget!")
        } else {
            console.log("decremented required budget wawawawa :(")
        }
        await setForeignKeyCheck(1);
        setFundAmount(0);
        setRatingChange(!ratingChange);
    }
    
    return(<div>
        {role === 'applicant' ? (
            <div>
                <nav className="navbar-log">
                    <div className="logo2">
                        <h1>GrantHive</h1>
                    </div>
                    <div className='login'>
                        <a href="/">
                            Logout
                        </a>
                    </div>
                </nav>
                <div>
                    <div className="user-greeting">Hello <span>{localStorage.getItem("loggedInUser")}</span>!</div>
                    <button className="toggle-button" onClick={toggleActionState}>
                        {actionState}
                    </button>
                    <img src="/app.svg" alt="Your SVG" className="app-svg" />
                </div>
                <div>
                    {actionState === "x" ? (
                        <div className="proposal-form">
                            <div style={{ fontSize: '20px', textAlign: 'center', margin: '1% auto', fontWeight: 'bold', color:'#703131' }}>Create Grant Proposal</div>
                            <div style={{ marginTop: '3%' }}>
                                <div className="input-pair">
                                    <div>Proposal Name :</div>
                                    <div>
                                        <input type="text" style={{padding:'3%'}}
                                        onChange={e => { setPfName(e.target.value) }}
                                        value={pfName}
                                        />
                                    </div>
                                </div>
                                <div className="input-pair">
                                    <div>Required Budget :</div>
                                    <div>
                                        <input type="text" style={{ padding: '3%' }}
                                        onChange={e => { setPfBudget(e.target.value) }}
                                        value={pfBudget}
                                        />
                                    </div>
                                </div>
                                <div className="input-pair">
                                    <div>Proposal Description :</div>
                                    <div>
                                        <textarea rows="4" cols="30" style={{ padding:'3%' , border: '1px solid black' }}
                                        onChange={e => { setPfDesc(e.target.value) }}
                                        value={pfDesc}
                                        ></textarea>
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
                                    }}
                                    onClick={submitProposal}>Submit</button>
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
                                                <div className="hmm"><span className="oh">Proposal ID:</span> {item.proposal_id}</div>
                                                <div className="hmm"><span className="oh">Proposal Title:</span> {item.proposal_title}</div>
                                                <div className="hmm"><span className="oh">Project Description:</span> {item.project_description}</div>
                                                <div className="hmm"><span className="oh">Required Budget:</span> {item.required_budget}</div>
                                            </div>
                                        ))}
                                    </div>
                            ) : (
                                    <div>
                                        {queryResult.map((item, index) => (
                                            <div key={index} className="program-item1">
                                            <div className="arrange">
                                                <div className="left">
                                                <div className="hmm"><span className="oh">ID:</span> {item.id}</div>
                                                <div className="hmm"><span className="oh">Required Budget:</span> {item.program_budget}</div> 
                                                <div className="hmm"><span className="oh">Organisation Name:</span> {item.organisation_name}</div>
                                                <div className="hmm"><span className="oh">Program Name:</span> {item.program_name}</div>
                                                <div className="hmm"><span className="oh">Program Desc:</span> {item.program_description}</div>                                                
                                                <div className="hmm"><span className="oh">Feedback:</span> {item.feedback}</div>
                                                </div>
                                                <div className="right">
                                                <div className="hmm"><span className="oh">Approval Date:</span> {item.approval_date ? new Date(item.approval_date).toISOString().split('T')[0] : ''}</div>
                                                <div className="hmm"><span className="oh">Deadline:</span> {item.deadline ? new Date(item.deadline).toISOString().split('T')[0] : ''}</div>
                                                <div className="hmm"><span className="oh">Review Date:</span> {item.review_date ? new Date(item.review_date).toISOString().split('T')[0] : ''}</div>
                                                <div className="hmm"><span className="oh">Reviewed By:</span> {item.review_whom}</div>
                                                <div className="hmm"><span className="oh">Review Score:</span> {item.review_score}</div>
                                                </div>
                                            </div>
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
                <div className='login'>
                    <a href="/">
                        Logout
                    </a>
                </div>
            </nav>
            <div>
                <div className="user-greeting-rev">Hello {localStorage.getItem("loggedInUser")}!</div>
                <img src="/rev.svg" alt="Your SVG" className="rev-svg" />
                {/* <button onClick={toggleActionState}>{actionState}</button> */}
            </div> 
            <div className="rev-container">
                {/* Display the program items with buttons on the right */}
                <div className="rev-info">
                    <div className="revtit">
                        PENDING PROGRAM(S) TO BE REVIEWED
                    </div>
                    {queryResult.map((item, index) => (
                        <div key={index} className="rev-item">
                            <div className="aa">
                                <div className="hm"><span className="oh">Proposal ID:</span> {item.id}</div>
                                <div className="hm"><span className="oh">Proposal Title:</span> {item.proposal_title}</div>
                                <div className="hm"><span className="oh">Organisation Name:</span> {item.organisation_name}</div>
                                <div className="hm"><span className="oh">Team Leader:</span> {item.team_lead_fname} {item.team_lead_lname}</div>
                                {/* <div className="hm">Proposal ID: {item.id}</div> */}
                                <div className="hm"><span className="oh">Project Description:</span> {item.project_description}</div>
                                <div className="hm"><span className="oh">Required Budget:</span> {item.required_budget}</div>
                            </div>
                            <div className="rev-content">
                                <div className="rev-details">
                                    <div className="rev-detail">
                                        <label className="rev-lab" htmlFor="rating">Enter Rating</label>
                                        <input type="number" id="rating" min="1" max="5" step="0.1"
                                        onChange={e => { setRating(e.target.value) }}
                                        value={rating}/>
                                    </div>
                                    <div>
                                        <label style={{margin:'0 0 0 0px'}}>Enter Feedback</label>
                                        <input type="text"
                                        onChange={e => { setFeedback(e.target.value); }}
                                        value={feedback}/>
                                    </div>
                                    <div className="rev-actions">
                                        <button className="approve-button" onClick={()=>{approveProposal(item.id)}}>Approve</button>
                                        <button className="reject-button" onClick={()=>{rejectProposal(item.id)}}>Reject</button>
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
                    <div className='login'>
                        <a href="/">
                            Logout
                        </a>
                    </div>
                </nav>
                
                <div>
                    <div className="user-greeting-fund">Hello {localStorage.getItem("loggedInUser")}!</div>
                    <img src="/fund.svg" alt="Your SVG" className="fund-svg" />
                </div>
                

                <div className="grant-program-container">
                    {/* Display the program items with buttons on the right */}
                    <div className="grant-program-info">
                        <div className="fundtit">
                            PENDING PROGRAM(S) TO BE FUNDED
                        </div>
                        {queryResult.map((item, index) => (
                            <div key={index} className="program-item">
                                <div className = "aa">
                                    <div className="hm"><span className="oh">Program ID:</span> {item.id}</div>
                                    <div className="hm"><span className="oh">Organisation Name:</span> {item.organisation_name}</div>
                                    <div className="hm"><span className="oh">Team Leader:</span> {item.team_lead_fname} {item.team_lead_lname}</div>
                                    <div className="hm"><span className="oh">Program Name:</span> {item.program_name}</div>                                                             
                                    <div className="hm"><span className="oh">Current Required Budget:</span> {item.program_budget}</div>
                                {/* <div className="hm">Abstract: {item.abstract}</div> */}
                                    <div className="hm"><span className="oh">Project Description:</span> {item.program_description}</div>
                                    <div className="hm"><span className="oh">Approval Date:</span> {item.approval_date}</div>
                                    <div className="hm"><span className="oh">Deadline:</span> {item.deadline}</div>
                                    <div className="hm"><span className="oh">Progress:</span> {item.progress}</div>
                                </div>
                                <div className="grant-program-actions">
                                    <button className="fund-button" onClick={() => { setFundOpen(!fundOpen) }}>Want to Fund?</button>
                                    {fundOpen ? (
                                        <div className="fund-form">
                                            <div className="set-amount-label">Set Amount</div>
                                            <div className="set-amount-input">
                                                <input type="number" onChange={e => { setFundAmount(e.target.value) }} value={fundAmount}/>
                                            </div>
                                            <button className="approve1-button" onClick={()=>{approveFunding(item.id, item.program_budget)}}>Approve</button>
                                            
                                        </div>
                                    ) : <div></div>}
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