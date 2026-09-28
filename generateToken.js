const jwt = require('json-web-token')

const generateToken = async(id)=>{
    await jwt.sign({id},process.env.JWT_SECRET,{
        expiresIn:'30d'
    })
}

module.exports = generateToken