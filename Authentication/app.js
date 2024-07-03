import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import ejs from "ejs";
import { error } from "console";

//loads 
dotenv.config();

const port = 3000;

const app = express();

const saltrounds = 10;

app.set('view engine','ejs');

app.use(bodyParser.urlencoded({extended:true}));

let user_id;
let user_name;
let user_email;

app.use(express.static("public"));

console.log(process.env.DB_USER);

const db = new pg.Client(process.env.DB_URL);

db.connect();



function generateRoomID(){
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let newRoomID='';

    for(let i=0;i<10;i++)
    {
        newRoomID+=characters.charAt(Math.floor(Math.random()*characters.length));
    }
    return newRoomID;
}

async function insertRoomID(){
    let newRoomID;
    while(true)
    {
        newRoomID = generateRoomID();
        try{    
            await db.query("insert into rooms (roomid) values ($1)",[newRoomID]);
            console.log("RoomID inserted successfully: ",newRoomID);
            return newRoomID;
        }catch(error){
            if(error.code === '23505')
            {
                console.log("roomID already exists generating a new one..."); 
                
            }else{
                console.log("error inserting roomID",error);
                throw error;
            }
        }
    }
}

app.get("/",(req,res)=>{
    res.render("login");
});

app.get("/register",(req,res)=>{
    res.render("register");
});

app.get('/callhistory/:userId', async (req, res) => {
    const userId = req.params.userId;

    function formatDate(utcDate) {
        const date = new Date(utcDate);
        return `${date.getUTCDate()}/${date.getUTCMonth() + 1}/${date.getUTCFullYear()}`;
    }

    function formatTime(utcTime) {
        const time = new Date(utcTime);
        return time.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' });
    }

    try {
        const result = await db.query("SELECT call_date, call_time FROM user_history WHERE log_id = $1 order by call_date desc,call_time desc limit 13", [userId]);
        const items = result.rows.map(item => ({
            call_date: formatDate(item.call_date),
            call_time: formatTime(item.call_time)
        }));
        res.render('callhistory', { items });
    } catch (error) {
        console.error("Error fetching user history:", error.message);
        res.status(500).send("Error fetching user history");
    }
});

app.get('/redirectLanding',(req,res)=>{
    res.render('landing',{
        roomID:' ',
        userId: user_id,
        userName: user_name,
        email: user_email,
    });
});


// app.post('/historyData',async(req,res)=>{
//     const { user_id } = req.body;

//     try{
//         const result = await db.query("select call_date,call_time from user_history where log_id=$1",[user_id]);
//         const historyData = result.rows;
//         console.log(result.rows);
//         console.log(historyData);

//         res.render('callHistory',{
//             items: historyData,
//         });

//     }catch(error){
//         console.error("Error fetching user history:", error.message);
//         res.status(500).json({ error: "Error fetching user history" });
//     }

// });



app.get('/get-roomID',async (req,res)=>{
    try{
        let newRoomID = await insertRoomID();
        res.json({
        roomID: newRoomID,
        });
    }catch(error){
        console.log("Failed to generate roomID");
        res.status(500).json({
            error: "Failed to generate roomID",
        });
    }
})


app.post("/login",async(req,res)=>{
    const username = req.body.username;
    const password = req.body.password;
    try{
        const result = await db.query('select id,user_name,user_email,user_password from users where user_name = $1',[username]);
        const resultdata = result.rows[0];
        // user_id = resultdata.id;
        if(resultdata){
            bcrypt.compare(password,resultdata.user_password,async(error,match)=>{
                if(error){
                    console.log("Error while comparing password ",error.message);
                }
                else if(match){
                    const day = new Date();
                    const date = day.toISOString().slice(0, 10); 
                    const time = day.toISOString(); 

                    try{
                        await db.query("insert into user_history (log_id, call_date, call_time) values ($1, $2, $3)",[resultdata.id,date,time]);
                        console.log("call log added successfully");
                    }catch(error){
                        console.error("error while adding call-log",error.message);
                    }
                    
                    user_id = resultdata.id;
                    user_email = resultdata.user_email;
                    user_name = resultdata.user_name;

                    res.render("landing",{
                        roomID:'',
                        userId: resultdata.id,
                        userName: username,
                        email: resultdata.user_email,
                    });
                }
                else{
                    res.render("login",{"error":"Incorrect Password"})
                }
            });
        }
        else{
            res.render("login",{"error":"User Not Found"});
        }
    }catch(e){
        console.log("Error in loging user ",e);
    }
    
});

app.post("/register",async (req,res)=>{
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    try{

        //checking for existing user with the entered username
        const existingUser = await db.query("select user_name from users where user_name=$1",[username]);
        if(existingUser.rows.length)
        {
            res.render("register",{
                error: "username already exists, try a different one."
            });
        }

        //hashing the password, then entering into database
        bcrypt.hash(password,saltrounds,async(error,encrptpassrd)=>{
            if(error){
                console.log("Error in bcrptying password ",error.message);
            }
            else{
                try{
                    await db.query('insert into users (user_name,user_email,user_password) values ($1,$2,$3)',[username,email,encrptpassrd]);//adding new one
                    try{
                        const result = await db.query('select id,user_name,user_password,user_email from users where user_name = $1',[username]);//retriving new one id since its a fk to history table;
                        const resultdata = result.rows[0];
                        // user_id = resultdata.id;
                        const day = new Date();
                        const date = day.toISOString().slice(0, 10); // Format: YYYY-MM-DD
                        const time = day.toISOString(); // Full UTC timestamp
                        await db.query('Insert into user_history (log_id,call_date,call_time) values ($1,$2,$3)',[resultdata.id,date,time]);

                        res.redirect("/");
                    }catch(e){
                        console.log("Error while adding call-Log",e.message);
                    }
                    
                }catch(e){
                    console.log('Error in inserting Userdata');
                }

            }
        });
    }catch(error){
        console.log("Error checking existing username", e.message);
        res.render("register", { "error": "An error occurred. Please try again." });
    }
    

})


app.post('/join-call',async(req,res)=>{
    const { room } = req.body;
    console.log(req.body.room, "is the roomID the user wants to join");
    res.render('client',{
        joinRoomID: room,
    });
})


app.listen(port,()=>{
    console.log(`Listening on port ${port}...`);
})