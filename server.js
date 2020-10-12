const express = require('express');
const app = express();
const port = 3000;
const searchGoogle = require('./searchGoogle');

app.get('/', (req, res)=> res.send('Hello world'));

app.get('/search', (req,res) =>{
   const searchQuery = req.query.searchquery;

   if(searchQuery != null){
    searchGoogle(searchQuery)
    .then(results => {
        //Returns a 200 Status OK with Results JSON back to the client.
        res.status(200);
        res.json(results);
    });
       
   }else{
       res.send('it goes something wrong');
   }
});

app.listen(port, ()=> console.log(`Example app listening on port ${port}!`));