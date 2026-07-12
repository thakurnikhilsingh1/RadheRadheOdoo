/*
KPIs:

Active vehicles
Available vehicles
Active trips
Fleet utilization
Operational cost  
*/

const pool=require("../database/db");


exports.getDashboard=async(req,res)=>{


try{


const vehicles =
await pool.query(
"SELECT COUNT(*) FROM vehicles"
);



const available =
await pool.query(
`
SELECT COUNT(*)
FROM vehicles
WHERE status='Available'
`
);



const trips =
await pool.query(
`
SELECT COUNT(*)
FROM trips
WHERE status='Dispatched'
`
);



const cost =
await pool.query(

`
SELECT 
SUM(cost)
FROM fuel_logs

`

);



res.json({

totalVehicles:
vehicles.rows[0].count,

availableVehicles:
available.rows[0].count,

activeTrips:
trips.rows[0].count,

fuelCost:
cost.rows[0].sum || 0

});


}catch(error){

res.status(500).json({
error:error.message
});

}


};





exports.exportCSV=async(req,res)=>{

const result=
await pool.query(
"SELECT * FROM vehicles"
);


let csv="id,registration_number,status\n";


result.rows.forEach(v=>{

csv+=`${v.id},${v.registration_number},${v.status}\n`;

});



res.header(
"Content-Type",
"text/csv"
);


res.send(csv);

};