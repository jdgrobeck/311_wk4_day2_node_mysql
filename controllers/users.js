const mysql = require('mysql')
const db = require('../sql/connection')
const { handleSQLError } = require('../sql/error')

const getAllUsers = (req, res) => {
  // SELECT ALL USERS


   // long form
  // let sql = 'SELECT * FROM users u JOIN usersAddress ua ON u.id = ua.user_id JOIN usersContact uc ON u.id = uc.user_id';

  let sql = 'SELECT * FROM users u ' 
  sql += 'JOIN usersAddress ua ON u.id = ua.user_id ' 
  sql += 'JOIN usersContact uc ON u.id = uc.user_id';

  db.query(sql, (err, rows) => {
    if (err) {
      console.log('getAllUsers query failed ', err)
      res.sendStatus(500)
    } else {
      res.json(rows);
    }
  })
}

const getUserById = (req, res) => {
  // SELECT USERS WHERE ID = <REQ PARAMS ID>
  let id = req.params.id;
  //params will always be an array
  let params = [id];


  let sql = 'SELECT * FROM users u ' 
  sql += 'JOIN usersAddress ua ON u.id = ua.user_id ' 
  sql += 'JOIN usersContact uc ON u.id = uc.user_id '
  sql += ' AND u.id = ?'; // works but BAD! Because they can enter any route. Called a sql injection
                          // question mark calls params. Called paramatized statement
                          // Don't bring variables directly into queries from the outside

  db.query(sql, params, (err, rows) => {
    if (err) {
      console.log('getUserById query failed ', err)
      res.sendStatus(500)
    } else {
      res.json(rows);
    }
  })
}

const createUser = async (req, res) => {
// sync use promises (async/await)
// FIRST QUERY
let first = req.body.first_name;
let last = req.body.last_name;

let params = [first, last];
let sql = "INSERT INTO users (first_name, last_name) "
sql += "VALUES (?, ?)";

let results;

try {
  results = await db.querySync(sql, params);
} catch (err) {
  console.log("INSERT users query failed", err);
  res.sendStatus(500);
  return; // if this query didn't work, stop
}


let id = results.insertId;
// SECOND QUERY
// UsersAddress
let address = req.body.address;
let city = req.body.city;
let county = req.body.county;
let state = req.body.state;
let zip = req.body.zip;

params = [id, address, city, county, state, zip];
sql = "INSERT INTO usersAddress (user_id, address, city, county, state, zip) "
sql += "VALUES (?, ?, ?, ?, ?, ?)";

try {
  results = await db.querySync(sql, params);
} catch (err) {
  console.log("INSERT usersAddress query failed", err);
  res.sendStatus(500);
  return; // if this query didn't work, stop
}

// THIRD QUERY
// usersContact
let phone1 = req.body.phone1;
let phone2 = req.body.phone2;
let email = req.body.email;

params = [id, phone1, phone2, email];
sql = "INSERT INTO usersContact (user_id, phone1, phone2, email) "
sql += "VALUES (?, ?, ?, ?)";

try {
  results = await db.querySync(sql, params);
} catch (err) {
  console.log("INSERT usersContact query failed", err);
  res.sendStatus(500);
  return; // if this query didn't work, stop
}

}

const createUserCallBackHell = (req, res) => {
  // POST
  // Async nested callbacks
  // INSERT INTO USERS FIRST AND LAST NAME. Will be a callback function
  // Insert in usersAddress all fields. So we'll need the users.id // callback
  // Insert in usersAddress all fields. So we'll need the users.id // callback
  // ^This is called callback hell

  let sql = "INSERT INTO users (first_name, last_name) "
  sql += "VALUES (?, ?)";
  
  let first = req.body.first_name;
  let last = req.body.last_name;

  let params = [first, last];

  // FIRST QUERY
  db.query(sql, params, (err, rows) => {
    if (err) {
      console.log('createUser query failed ', err)
      res.sendStatus(500) // or whatever is appropriate
    } else {
      //SECOND QUERY
      sql = 'SELECT MAX(id) as id FROM users WHERE first_name = ? and last_name = ?'
      db.query(sql, params, (err, rows) => {
        if (err){
          console.log('Get Id query failed ', err)
          res.sendStatus(500) // or whatever is appropriate
        } else {
          // res.json(rows)
          let id = rows[0].id; // NOW we have the id from users table
          let address = req.body.address;
          let city = req.body.city;
          let county = req.body.county;
          let state = req.body.state;
          let zip = req.body.zip;

          params = [id, address, city, county, state, zip];

          sql = "INSERT INTO usersAddress (user_id, address, city, county, state, zip) "
          sql += "VALUES (?, ?, ?, ?, ?, ?)";

          db.query(sql, params, (err, rows) => {
            if (err){
              console.log('Insert Address query failed ', err)
              res.sendStatus(500) // or whatever is appropriate
          // THIRD QUERY
            } else {
              // res.json(rows)
              // Looking for 200 status
              // FOURTH QUERY
              let phone1 = req.body.phone1;
              let phone2 = req.body.phone2;
              let email = req.body.email;

              params = [id, phone1, phone2, email];

              sql = "INSERT INTO usersContact (user_id, phone1, phone2, email) "
              sql += "VALUES (?, ?, ?, ?)";

              db.query(sql, params, (err, rows) => {
                if (err){
                  console.log('Insert Contact query failed', err)
                  res.sendStatus(500)
                } else {
                  res.sendStatus(200)
                }
              })
            }
          })
        }
      })
    }
  });
}

const updateUserById = (req, res) => {
  // UPDATE USERS AND SET FIRST AND LAST NAME WHERE ID = <REQ PARAMS ID>
  let id = req.params.id;
  let first = req.body.first_name;
  let last = req.body.last_name;
  let params = [first, last, id];

  //Have to send request in order
  let sql = 'UPDATE users '
  sql += 'SET first_name = ?, last_name = ? where id = ?'

  if(!id){
    res.sendStatus(400);
    return;
  }


  db.query(sql, params, (err, rows) => {
    if (err) {
      console.log('updateUserById query failed ', err);
      res.sendStatus(400)
    } else {
      res.json(rows);
    }
  })
}

const deleteUserByFirstName = (req, res) => {
  // DELETE FROM USERS WHERE FIRST NAME = <REQ PARAMS FIRST_NAME>
  let first = req.params.first_name; // path would be /users/bob
  let params = [first];

  if(!first){
    res.sendStatus(400);
    return;
  }

  let sql = 'DELETE FROM users WHERE first_name = ?'
  // WHAT GOES IN THE BRACKETS
  

  db.query(sql, params, (err, rows) => {
    if (err) {
      console.log('deleteUserByFirstName query failed', err)
    } else {
      return res.json({ message: `Deleted ${rows.affectedRows} user(s)` });
    }
  })
}



module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUserById,
  deleteUserByFirstName
}