import mysql from 'mysql2'
import jwt from 'jsonwebtoken'

const processQuery = async(req, res)=>{

    const pool = mysql.createPool({
        connectionLimit: 5,
        host: "localhost",
        port: 3306,
        user: "root",
        password: process.env.DB_PASSWORD,
        database: "grant_test" 
    })

    const token = req.body.headers['x-access-token']

    if(!token){
        return res.status(200).json({auth: false, message: "No JWT found, cannot give data"})
    } else {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded)=>{
            if(err){
                return res.status(200).json({auth: false, message: "1. failed to authenticate, no data for you"})
            } else {
                console.log(decoded.id, req.body.id)
                if(decoded.id==req.body.id && decoded.role==req.body.role){
                    pool.getConnection(function(err, connection){
                        //if not connected
                        if(err) throw err;
                
                        //if exists, use it and make query
                        connection.query(req.body.query, async function(error, results, fields){
                            //after use, return to pool
                            connection.release();
                            //if error in query
                            if(error) throw error;
                            //send back results
                            return res.status(200).json({auth: true, results: results});
                        })
                    })
                } else {
                    return res.status(200).json({auth: false, message: "2. failed to authenticate, no data for you"})
                }
                console.log("decoded: ", decoded)
            }
        })
    }
    

}
  
export default processQuery