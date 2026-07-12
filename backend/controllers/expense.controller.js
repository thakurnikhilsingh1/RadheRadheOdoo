const pool=require("../database/db");



exports.getExpenses=async(req,res)=>{


const result=await pool.query(
"SELECT * FROM expenses"
);


res.json(result.rows);

};




exports.addExpense=async(req,res)=>{


const {
vehicle_id,
expense_type,
amount,
description,
date
}=req.body;



const result=await pool.query(

`
INSERT INTO expenses
(vehicle_id,expense_type,amount,description,date)

VALUES($1,$2,$3,$4,$5)

RETURNING *
`,

[
vehicle_id,
expense_type,
amount,
description,
date
]

);



res.status(201).json(result.rows[0]);

};