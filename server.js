const express = require('express');

const app = express();

const ip = process.env.IP || 'ç';
const port = process.env.PORT || 8080;

const searchGoogle = require('./searchGoogle');

app.get('/', (req, res)=> res.send('Hello world'));

app.get('/search', (req,res) =>{
   var host = req.headers.host;
   var origin = req.headers.origin;
   
   console.log(origin,host);
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

app.listen(port, ip);