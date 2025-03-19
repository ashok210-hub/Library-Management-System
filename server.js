const app=require('./app');
const {notifyUsers}= require('./services/notifyUsers');
const removeUnverifiedAccounts= require('./services/removeUnverifiedAccounts');
const dotenv=require('dotenv');
dotenv.config();

const port=process.env.PORT || 8080
app.listen(port,()=>{
    console.log(`server is running on port ${port}`)
});
