const {Sequelize}=require('sequelize');
const dotenv=require('dotenv');
dotenv.config();
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD,{
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT
});

sequelize.authenticate().then(()=>{
    console.log('Connected to database',process.env.DB_NAME);
}).catch((error)=>{
    console.log('Error connecting to database:', error);
});

module.exports=sequelize;