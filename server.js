const express = require('express');

const app = express();
const port = 3000;
const searchGoogle = require('./searchGoogle');

app.get('/', (req, res)=> res.send('Hello world'));

app.get('/search', (req,res) =>{
   const searchQuery = req.query.searchquery;
   const number = req.query.page;
   let data = [];
   if(searchQuery != null){
    searchGoogle(searchQuery, '')
    .then(results => {
        if(!number){
            //Returns a 200 Status OK with Results JSON back to the client.

           res.status(200);
           res.json(results);
        }
        else{
            data = results;
            //console.log(data['data']);
            if(data['pages'] && number!= null){
                let next_page = data['pages'].filter(x=> x.number == number);
                let url_next = next_page.map(x => x.url).toString();
                searchGoogle(searchQuery, url_next)
                .then(results => {
                    //Returns a 200 Status OK with Results JSON back to the client.
                    res.status(200);
                    res.json(results);
                });
            }

        }
       
    });
  
       
   }else{
       res.send('it goes something wrong');
   }
});

app.listen(port, ()=> console.log(`Example app listening on port ${port}!`));