let db = require("../sql/connection"); // imports connection from databse
let argon2 = require("argon2");
let jwt = require("jsonwebtoken");

let register = async (req, res) => {

    let username = req.body.username;
    let password = req.body.password;
    let fullName = req.body.fullName;

    let passwordHash;

    try {
        passwordHash = await argon2.hash(password);


    } catch(err) {
        console.log(err);
        res.sendStatus(500);
        return;
    }

    // DO NOT PASS PASSWORD
    let params = [username, passwordHash, fullName]
    let sql = "INSERT INTO regUser (username, password_hash, full_name) "
    sql += "VALUES (?, ?, ?)"

    try {
        let results = await db.queryPromise(sql, params)
        res.sendStatus(200)
    } catch(err) {
        console.log(err);
        if (err.code == "ER_DUP_ENTRY"){
            res.status(400).send("That username is taken. Please try again")
        } else {
        res.sendStatus(500);
        }
        
        return;
    }

    
}


// We have a registered user. Now they want to log in.
//If good, here's your token. Or no I have nothing for you
let login = (req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    let sql = "SELECT id, full_name, password_hash FROM regUser WHERE username = ?"
    // sql += "FROM regUser WHERE username = ?"

    // NEVER PASS PASSWORD
    let params = [username];

    db.query(sql, params, async (err, rows) => {
        if(err){
            console.log("Could not get user ", err)
            res.sendStatus(500)
        } else {
            //We found someone, but there are too many rows
            if(rows.length > 1){
                console.log("Returned too many rows for username ", username)
                res.sendStatus(500)
                //We found someone, but there isn't a username
            } else if (rows.length === 0) {
                console.log("Username doesn't exist.")
                res.status(400).send("That username doesn't exist. Please sign up for an account.")
            } else {
                // We found someone correctly. One row is returned.
                // It will be an array of objects. So you get the object by its index
                //[{"id": "1234", "username": "bob123", "password_hash": ".....", "full_name": "bob california"}]


                console.log(username)
                console.log(password)
                let pwHash = rows[0].password_hash;
                let fName = rows[0].full_name;
                let userId = rows[0].id;

                let token = ""
                let goodPass = false;

                try {
                    goodPass = await argon2.verify(pwHash, password); //returns boolean, so at this point goodPass = true
                } catch(err) {
                    console.log("Failed to verify password ", err);
                    res.status(400).send("Invalid password.");
                }

                if(goodPass){
                    token = {
                        "fullName": fName,
                        "userId": userId //usually want the bare minimum of key/value pairs
                    }
                    // res.json(token); //unsigned token
                    console.log(token)

                    // Now we to sign the token

                    let signedToken = jwt.sign(token, process.env.JWT_SECRET);

                    // res.json(signedToken); //crashes after you use this once
                    res.sendStatus(200);

                    // eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmdWxsTmFtZSI6Ik1hcnkgRG9lIiwidXNlcklkIjo0LCJpYXQiOjE2ODAxOTExMjh9.HDpiTwojieFJT-XqkSsDeSWD5G_BYAnQvpEEU6_yXbs
                    res.setHeader("Authorization", "Bearer", signedToken) //Since Postman is fake, we don't have a front-end(client) to send to. Header stuff is client-side.
                } else {
                    res.sendStatus(400);
                }

            } //end else

        } 
    })

} // end login function


// ...

const logout = (req, res) => {
let loggedOutTokens = [];
  let signedToken = req.get("Authorization").split(" ")[1];
  if (!signedToken) {
    res.sendStatus(400);
    return;
  }
  // Add the token to the array of revoked tokens
  loggedOutTokens.push(signedToken);
  res.clearCookie("jwt", { signed: true, httpOnly: true, expires: new Date(0) });
  res.sendStatus(200);
  console.log("You are logged out.");
};



module.exports = {register, login, logout}
