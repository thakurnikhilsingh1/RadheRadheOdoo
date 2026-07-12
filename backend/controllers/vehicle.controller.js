const pool=require("../database/db");


exports.getVehicles=async(req,res)=>{

const result=await pool.query(
"SELECT * FROM vehicles"
);

res.json(result.rows);

};



exports.createVehicle=async(req,res)=>{

const {
registration_number,
vehicle_name,
vehicle_type,
max_load_capacity,
odometer,
acquisition_cost
}=req.body;


const result=await pool.query(

`
INSERT INTO vehicles
(registration_number,vehicle_name,vehicle_type,max_load_capacity,odometer,acquisition_cost)

VALUES($1,$2,$3,$4,$5,$6)

RETURNING *
`,
[
registration_number,
vehicle_name,
vehicle_type,
max_load_capacity,
odometer,
acquisition_cost
]

);


res.status(201).json(result.rows[0]);

};



exports.getVehicleById=async(req,res)=>{

const result=await pool.query(
"SELECT * FROM vehicles WHERE id=$1",
[req.params.id]
);

res.json(result.rows[0]);

};



exports.updateVehicle=async(req,res)=>{

const result=await pool.query(

`
UPDATE vehicles
SET vehicle_name=$1,status=$2
WHERE id=$3
RETURNING *
`,

[
req.body.vehicle_name,
req.body.status,
req.params.id
]

);


res.json(result.rows[0]);

};



exports.deleteVehicle=async(req,res)=>{

await pool.query(

`
UPDATE vehicles
SET status='Retired'
WHERE id=$1
`,
[req.params.id]

);


res.json({
message:"Vehicle retired"
});

};