const pool = require('./db');

exports.checkUserExists = (userName) => {
    const query = 'select id as userId , name, email, password from users where user_name = ?';
    return pool.query(query, [userName]);
};

exports.insertNewUser = (userName, email, password, name) => {
    const query =`INSERT INTO users (user_name, password, email, name)
    VALUES (?, ?, ?, ?);`;
    return pool.query(query, [userName, password, email, name]);
};