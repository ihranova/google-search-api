const puppeteer = require('puppeteer');
const {performance} = require('perf_hooks');

const searchGoogle = async (searchQuery) => {
    const browser = await puppeteer.launch();

    const page = await browser.newPage();
    await page.goto('https://google.com');
    await page.type('input[name="q"]', searchQuery);

    await page.$eval('input[name=btnK]', button => button.click());
    await page.waitForSelector('div[id=search]');
    

    //Find all div elements with class 'bkWMgd'
    const searchResults = await page.$$eval('div[id=search]', results => {
        //Array to hold all our results
        let data = [];

        //Iterate over all the results
        results.forEach(parent => {

            //Check if parent has h2 with text 'Web Results'
            const ele = parent.querySelector('h2');

            //If element with 'Web Results' Title is not found  then continue to next element
            if (ele === null) {
                return;
            }

            //Check if parent contains 1 div with class 'g' or contains many but nested in div with class 'srg'
            let gCount = parent.querySelectorAll('div[class=g]');

            //If there is no div with class 'g' that means there must be a group of 'g's in class 'srg'
            if (gCount.length === 0) {
                //Targets all the divs with class 'g' stored in div with class 'srg'
                gCount = parent.querySelectorAll('div[id=rso] > div[class=g]');
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
        });

        //Return the search results
        return data;
    });


    await page.screenshot({path: 'example.png'});

    await browser.close();
    return searchResults;
};

const averageTime = async () => {
    const averageList = [];

    for (let i = 0; i < 20; i++) {
        const t0 = performance.now();

        //wait for our function to execute
        await searchGoogle(searchQuery);

        const t1 = performance.now();

        //push the difference in performance time instance
        averageList.push(t1 - t0);
    }

    //adds all the values in averageList and divides by length
    const average = averageList.reduce((a, b) => a + b) / averageList.length;

    console.log('Average Time: ' + average + 'ms');
};
//averageTime();

module.exports = searchGoogle;

//searchGoogle('cats');