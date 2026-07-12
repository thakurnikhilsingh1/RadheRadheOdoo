const pool = require("../database/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


exports.register = async(req,res)=>{

try{

const {name,email,password,role_id}=req.body;


const hashedPassword = await bcrypt.hash(password,10);


const result = await pool.query(
`
INSERT INTO users(name,email,password,role_id)
VALUES($1,$2,$3,$4)
RETURNING id,name,email
`,
[name,email,hashedPassword,role_id]
);


res.status(201).json(result.rows[0]);


}catch(error){

res.status(500).json({error:error.message});

}

};



exports.login = async(req,res)=>{

try{

const {email,password}=req.body;


const user = await pool.query(
`
SELECT users.*,roles.role_name
FROM users
JOIN roles
ON users.role_id=roles.id
WHERE email=$1
`,
[email]
);



if(user.rows.length===0)
return res.status(401).json({
error:"Invalid credentials"
});



const valid = await bcrypt.compare(
password,
user.rows[0].password
);


if(!valid)
return res.status(401).json({
error:"Invalid credentials"
});



const token = jwt.sign(
{
userId:user.rows[0].id,
roleId:user.rows[0].role_id,
roleName:user.rows[0].role_name
},
process.env.JWT_SECRET,
{
expiresIn:"1d"
}
);



res.json({token});


}catch(error){

res.status(500).json({error:error.message});

}

};