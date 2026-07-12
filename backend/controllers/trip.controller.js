/* Handles:

Create trip
Dispatch
Complete
Cancel
Status transitions */

const pool = require("../database/db");


// Get all trips
exports.getTrips = async(req,res)=>{

try{

const result = await pool.query(
`
SELECT 
trips.*,
vehicles.vehicle_name,
drivers.name AS driver_name

FROM trips

JOIN vehicles
ON trips.vehicle_id = vehicles.id

JOIN drivers
ON trips.driver_id = drivers.id

`
);

res.json(result.rows);


}catch(error){

res.status(500).json({error:error.message});

}

};



// Create Trip

exports.createTrip = async(req,res)=>{

try{

const {
source,
destination,
vehicle_id,
driver_id,
cargo_weight,
planned_distance
}=req.body;



// check vehicle

const vehicle = await pool.query(
"SELECT * FROM vehicles WHERE id=$1",
[vehicle_id]
);



if(vehicle.rows.length===0)
return res.status(404).json({
error:"Vehicle not found"
});



// capacity validation

if(cargo_weight > vehicle.rows[0].max_load_capacity){

return res.status(400).json({
error:"Cargo weight exceeds vehicle capacity"
});

}



// check vehicle status

if(vehicle.rows[0].status!=="Available"){

return res.status(400).json({
error:"Vehicle not available"
});

}



// check driver

const driver = await pool.query(

"SELECT * FROM drivers WHERE id=$1",
[driver_id]

);



if(driver.rows[0].status!=="Available"){

return res.status(400).json({
error:"Driver not available"
});

}



const result = await pool.query(

`
INSERT INTO trips
(source,destination,vehicle_id,driver_id,cargo_weight,planned_distance)

VALUES($1,$2,$3,$4,$5,$6)

RETURNING *
`,

[
source,
destination,
vehicle_id,
driver_id,
cargo_weight,
planned_distance
]

);


res.status(201).json(result.rows[0]);



}catch(error){

res.status(500).json({
error:error.message
});

}

};




// Dispatch Trip

exports.dispatchTrip=async(req,res)=>{

const client = await pool.connect();


try{

await client.query("BEGIN");



const trip = await client.query(

"SELECT * FROM trips WHERE id=$1",

[req.params.id]

);



if(trip.rows.length===0)
throw Error("Trip not found");



await client.query(

`
UPDATE trips
SET status='Dispatched'
WHERE id=$1
`,

[req.params.id]

);



await client.query(

`
UPDATE vehicles
SET status='On Trip'
WHERE id=$1
`,

[trip.rows[0].vehicle_id]

);



await client.query(

`
UPDATE drivers
SET status='On Trip'
WHERE id=$1
`,

[trip.rows[0].driver_id]

);



await client.query("COMMIT");


res.json({
message:"Trip dispatched"
});


}catch(error){

await client.query("ROLLBACK");

res.status(400).json({
error:error.message
});


}

finally{

client.release();

}


};




// Complete Trip

exports.completeTrip=async(req,res)=>{

try{


const trip=await pool.query(
"SELECT * FROM trips WHERE id=$1",
[req.params.id]
);


await pool.query(

`
UPDATE trips
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

[trip.rows[0].vehicle_id]

);



await pool.query(

`
UPDATE drivers
SET status='Available'
WHERE id=$1
`,

[trip.rows[0].driver_id]

);



res.json({
message:"Trip completed"
});


}catch(error){

res.status(500).json({
error:error.message
});

}

};




// Cancel Trip

exports.cancelTrip=async(req,res)=>{

try{


const trip=await pool.query(

"SELECT * FROM trips WHERE id=$1",

[req.params.id]

);



await pool.query(

`
UPDATE trips
SET status='Cancelled'
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
[trip.rows[0].vehicle_id]

);



await pool.query(

`
UPDATE drivers
SET status='Available'
WHERE id=$1
`,
[trip.rows[0].driver_id]

);



res.json({
message:"Trip cancelled"
});


}catch(error){

res.status(500).json({
error:error.message
});

}

};