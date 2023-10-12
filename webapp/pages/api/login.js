import axios from "axios";
import bcrpyt from "bcrypt";
import jwt from 'jsonwebtoken';
import mysql from 'mysql2'

const login = async(req, res)=>{
    let query = `SELECT * FROM USERS WHERE username='${req.body.username}'`;
    //construct query and send off to db for results

    const pool = mysql.createPool({
        connectionLimit: 1,
        host: "localhost",
        port: 3306,
        user: "root",
        password: process.env.DB_PASSWORD,
        database: "grant_test" 
    })

    pool.getConnection(function(err, connection){
        //if not connected
        if(err) throw err;

        //if exists, use it and make query
        connection.query(query, async function(error, results, fields){
            //after use, return to pool
            connection.release();
            //if error in query
            if(error) throw error;
            //send back results
            const userRes = results;
            if(userRes.length>0){
                // bcrpyt.hash(req.body.password, 10, (err, hash)=>{
                //     console.log(hash)
                // })
                bcrpyt.compare(req.body.password, userRes[0].pass, function(err, result) {
                    if(err) console.log("0");
                    const id = userRes[0].role_id;
                    const role = userRes[0].user_role
                    const token = jwt.sign({id: id, role: role}, process.env.JWT_SECRET, {
                        expiresIn: "1d",
                    });
                    if(result){
                        console.log("1");
                        return res.status(200).json({auth: true, token: token, result: userRes[0]})
                    }
                    else{
                        //wrong password
                        console.log("2");
                        return res.status(200).json({auth: false, message: 'wrong username or password'})                
                    }
                });
            } else {
                //username not exist
                console.log("3");
                return res.status(200).json({auth: false, message: 'wrong username or password'})
            }
        })
    })


}

export default login;