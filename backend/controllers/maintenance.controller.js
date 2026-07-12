const pool=require("../database/db");


exports.getMaintenance=async(req,res)=>{

const result=await pool.query(
"SELECT * FROM maintenance_logs"
);

res.json(result.rows);

};




exports.createMaintenance=async(req,res)=>{

const client=await pool.connect();


try{

await client.query("BEGIN");


const {
vehicle_id,
maintenance_type,
description,
cost,
start_date
}=req.body;



const result=await client.query(

`
INSERT INTO maintenance_logs
(vehicle_id,maintenance_type,description,cost,start_date,status)

VALUES($1,$2,$3,$4,$5,'Active')

RETURNING *
`,

[
vehicle_id,
maintenance_type,
description,
cost,
start_date
]

);



await client.query(

`
UPDATE vehicles
SET status='In Shop'
WHERE id=$1
`,
[vehicle_id]

);



await client.query("COMMIT");


res.status(201).json(result.rows[0]);


}catch(error){

await client.query("ROLLBACK");

res.status(500).json({
error:error.message
});


}

finally{

client.release();

}

};




exports.closeMaintenance=async(req,res)=>{


const maintenance=await pool.query(

`
SELECT vehicle_id
FROM maintenance_logs
WHERE id=$1
`,
[req.params.id]

);



await pool.query(

`
UPDATE maintenance_logs
SET status='Completed'
WHERE id=$1
`,
[req.params.id]

);



await pool.query(

`
UPDATE vehicles
SET status='Available'
WHERE id=$1
`,
[maintenance.rows[0].vehicle_id]

);



res.json({
message:"Maintenance closed"
});

};