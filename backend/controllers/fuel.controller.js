const pool=require("../database/db");



exports.getFuelLogs=async(req,res)=>{

const result=await pool.query(
"SELECT * FROM fuel_logs"
);

res.json(result.rows);

};



exports.addFuelLog=async(req,res)=>{


const {
vehicle_id,
liters,
cost,
distance,
date
}=req.body;


const result=await pool.query(

`
INSERT INTO fuel_logs
(vehicle_id,liters,cost,distance,date)

VALUES($1,$2,$3,$4,$5)

RETURNING *
`,

[
vehicle_id,
liters,
cost,
distance,
date
]

);


res.status(201).json(result.rows[0]);

};