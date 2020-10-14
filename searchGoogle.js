const puppeteer = require('puppeteer');
const {performance} = require('perf_hooks');

// This is where we'll put the code to get around the tests.
const preparePageForTests = async (page) => {
  // Pass the User-Agent Test.
  const userAgent = 'Mozilla/5.0 (X11; Linux x86_64)' +
    'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.39 Safari/537.36';
  await page.setUserAgent(userAgent);

  // Pass the Webdriver Test.
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => false,
    });
  });

  // Pass the Chrome Test.
  await page.evaluateOnNewDocument(() => {
    // We can mock this in as much depth as we need for the test.
    window.navigator.chrome = {
      runtime: {},
      // etc.
    };
  });

  // Pass the Permissions Test.
  await page.evaluateOnNewDocument(() => {
    const originalQuery = window.navigator.permissions.query;
    return window.navigator.permissions.query = (parameters) => (
      parameters.name === 'notifications' ?
        Promise.resolve({ state: Notification.permission }) :
        originalQuery(parameters)
    );
  });

  // Pass the Plugins Length Test.
  await page.evaluateOnNewDocument(() => {
    // Overwrite the `plugins` property to use a custom getter.
    Object.defineProperty(navigator, 'plugins', {
      // This just needs to have `length > 0` for the current test,
      // but we could mock the plugins too if necessary.
      get: () => [1, 2, 3, 4, 5],
    });
  });

  // Pass the Languages Test.
  await page.evaluateOnNewDocument(() => {
    // Overwrite the `plugins` property to use a custom getter.
    Object.defineProperty(navigator, 'languages', {
      get: () => ['en-US', 'en'],
    });
  });
}


const searchGoogle = async (searchQuery, url) => {
    //const browser = await puppeteer.launch();
    const args = [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-infobars',
        '--window-position=0,0',
        '--ignore-certifcate-errors',
        '--ignore-certifcate-errors-spki-list',
        '--user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36"'
    ];
        
        
    const browser = await puppeteer.launch({args, headless: false}); // default is true
    //await preparePageForTests(page);

    const page = await browser.newPage();

     //turns request interceptor on
     await page.setRequestInterception(true);

     //if the page makes a  request to a resource type of image or stylesheet then abort that            request
     page.on('request', request => {
         if (request.resourceType() === 'image' || request.resourceType() === 'stylesheet')
             request.abort();
         else
             request.continue();
     });

     // Get the "viewport" of the page, as reported by the page.
    const dimensions = await page.evaluate(() => {
    return {
        width:1920,
        height: 1900,
        deviceScaleFactor: window.devicePixelRatio
        };
    });
    await page.setViewport( dimensions);
    if(url!= ''){
        await page.goto(url);
    }else{
        await page.goto('https://google.com');
        await page.type('input[name="q"]', searchQuery);
    
        await page.$eval('input[name=btnK]', button => button.click());
    }

   
    await page.waitForSelector('div[id=search]');
    

    //Find all div elements with class 'bkWMgd'
    const searchResults = await page.$$eval('div[id=rcnt]', results => {
        //Array to hold all our results
        let data = [];
        let pages = [];

        //Iterate over all the results
        results.forEach(parent => {

            //Check if parent has h2 with text 'Web Results'
            const ele = parent.querySelector('h2');

            //If element with 'Web Results' Title is not found  then continue to next element
            if (ele === null) {
                return;
            }

            //Check if parent contains 1 div with class 'g' or contains many but nested in div with class 'srg'
            let gCount = parent.querySelectorAll('div[id=search] div[class=g]');

            //If there is no div with class 'g' that means there must be a group of 'g's in class 'srg'
            if (gCount.length === 0) {
                //Targets all the divs with class 'g' stored in div with class 'srg'
                gCount = parent.querySelectorAll('div[id=search] div[id=rso] > div[class=g]');
            }

            //Iterate over all the divs with class 'g'
            gCount.forEach(result => {
                //Target the title
                const title = result.querySelector('div[class=rc] > div[class=yuRUbf] > a > h3').innerText;

                //Target the url
                const url = result.querySelector('div[class=rc] > div[class=yuRUbf] > a').href;

                //Target the description
                const desciption = result.querySelector('div[class=rc] span[class=aCOpRe]').innerText;

                //Add to the return Array
                data.push({title, desciption, url});
            });

            //tacking pagignations
            const pagination = parent.querySelectorAll('div[id=foot] table td a[class=fl]');
            pagination.forEach(result => {
                
                //Target the title
                const number = result.innerText;

                //Target the url
                const url = result.href;

                //Target the description
                //const desciption = result.querySelector('div[class=rc] span[class=aCOpRe]').innerText;

                //Add to the return Array
                pages.push({number, url});
            });
            
            

        });
       

        //Return the search results
        return {data, pages};
    });
   
    await page.screenshot({path: 'example.png'});

    await browser.close();
    //console.log(searchResults);
    return searchResults;
};


module.exports = searchGoogle;

//searchGoogle('cats');