const pool=require("../database/db");


exports.getDrivers=async(req,res)=>{

const result=await pool.query(
"SELECT * FROM drivers"
);

res.json(result.rows);

};



exports.createDriver=async(req,res)=>{

const result=await pool.query(

`
INSERT INTO drivers
(name,license_number,license_category,license_expiry_date,contact_number,safety_score)

VALUES($1,$2,$3,$4,$5,$6)

RETURNING *
`,

[
req.body.name,
req.body.license_number,
req.body.license_category,
req.body.license_expiry_date,
req.body.contact_number,
req.body.safety_score
]

);


res.status(201).json(result.rows[0]);

};



exports.updateDriver=async(req,res)=>{


const result=await pool.query(

`
UPDATE drivers
SET status=$1,safety_score=$2
WHERE id=$3
RETURNING *
`,

[
req.body.status,
req.body.safety_score,
req.params.id
]

);


res.json(result.rows[0]);

};



exports.deleteDriver=async(req,res)=>{


await pool.query(

`
UPDATE drivers
SET status='Suspended'
WHERE id=$1
`,
[req.params.id]

);


res.json({
message:"Driver suspended"
});

};