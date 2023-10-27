const { checkUserExists, insertNewUser } = require("../connections/loginDb");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.requestToLogin = (req, res, next) => {
    // data
    const userName = req.body.userName;
    const password = req.body.password;

    console.log(userName,password, 'login data')
    // process request
    return exports.processLogin(userName, password)
        .then((response) => {
            console.log(response, 'response after login successfully')
            if (response.message == 'success') {
                // setting the auth token in the header
                res.set({
                    Authorization: response.authToken,
                    'Access-Control-Expose-Headers': 'Authorization',
                });
                res.status(200);
                const finalResponse = {
                    message: 'success',
                    email: response.data.email,
                    name: response.data.name,
                    authToken: response.authToken
                };
                res.json(finalResponse);
            } else {
                // invalidate the auth
                res.status(401);
                const finalResponse = {
                    message: 'error',
                    errorMessage:response.errorMessage,
                };
                res.json(finalResponse);
            }
        })
        .catch((err) => {
            console.log(err)
            res.status(400);
            res.json({
                message: 'error',
                errorMessage:'Something Went Wrong'
            });
        });
};

exports.processLogin = (userName, password) => {
    console.log(userName,password, 'processLogin')
    return checkUserExists(userName)
        .then(async ([ result ]) => {
            if (result.length) {
                console.log(result, 'login user data ')
                // fetching user data
                const data = result[0];
                // Check the password
                const passwordMatch = await bcrypt.compare(password, data.password);
                if (!passwordMatch) {
                    return Promise.reject('Invalid credentials')
                }
                console.log('password matched')
                const authToken = jwt.sign({ id: data.userId }, 'secret_key', { expiresIn: '1h' });
                console.log(authToken);
                return {
                    authToken,
                    data,
                    message:'success'
                };
            } else {
                return {
                    errorMessage:'Invalid Credentails',
                    message:'error'
                };
            }
        })
        .catch((err) => {
            console.error(err);
            throw err; // Rethrow the error to maintain consistency
        });
};

exports.requestToSignUpUser = (req, res) => {
    const userName = req.body.userName;
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;
    if(!userName || !email || !password || !name){
        return res.status(400).json({ message: 'Invalid Data!' });
    }
    console.log(userName, email, password, name, 'user signup data');
    return checkUserExists(userName)
        .then(async ([ result ]) => {
            if (result.length) {
                // fetching user data
                return res.status(400).json({ message: 'User name already exists' });
            }else{
                // Hash the password
                const hashedPassword = await bcrypt.hash(password, 10);
                await insertNewUser(userName, email, hashedPassword, name);
                return res.status(201).json({ message: 'User created successfully' });
            }
        })
        .catch((err) => {
            return Promise.reject(err);
        });
};