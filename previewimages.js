const axios = require('axios');
const puppeteer = require('puppeteer');
const fs = require('fs');
const source = "https://www.d-hagemeier.com/preview-images.json";
const dist = __dirname + "/dist/";

async function getscreen(filename, url) {
  try {
    console.log("Getting: " + url);
    await page.setViewport({ width: 1200, height: 628 });
    await page.goto(url, { waitUntil: 'networkidle2' });
    await page.screenshot({ 
      path: dist + filename + ".png",
      type: 'png'
    });
    console.log("Finished: " + dist + filename + ".png");
  }
  catch (err) {
    console.log('err :', err);
  }
}

async function setpuppeteer(response) {

  if (!fs.existsSync(dist)){
    fs.mkdirSync(dist);
  }

  try {
    browser = await puppeteer.launch({ headless: true });
    page = await browser.newPage();
  
    var i;
    for (i = 0; i < response.length; i++) {
  
      let filename = response[i].filename;
      let disturl = dist + filename + ".png";
  
      if (fs.existsSync(disturl)) {
        console.log("File exists");
      } else {
        await getscreen(filename, "https://www.d-hagemeier.com/assets/preview-images/" + filename + ".html");
      }
  
    }
  } catch(err) {
    console.error(err)
  }

  browser.close();
  console.log('Done!');

}

axios.get(source)
  .then((response) => {
    setpuppeteer(response.data);
  })
  .catch((error) => {
    console.log('error :', error)
  });