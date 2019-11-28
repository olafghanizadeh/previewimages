const axios = require('axios');
const puppeteer = require('puppeteer');
const fs = require('fs');

const settings = {
  source: "https://www.d-hagemeier.com/preview-images.json",
  imgwidth: 1200,
  imgheight: 628,
  dist: __dirname + "/dist/"
}

async function getscreen(filename, url) {
  try {
    console.log("Getting: " + url);
    await page.setViewport({ width: settings.imgwidth, height: settings.imgheight });
    await page.goto(url, { waitUntil: 'networkidle2' });
    await page.screenshot({ 
      path: settings.dist + filename + ".png",
      type: 'png'
    });
    console.log("Finished: " + settings.dist + filename + ".png");
  }
  catch (err) {
    console.log('err :', err);
  }
}

async function setpuppeteer(response) {

  if (!fs.existsSync(settings.dist)){
    fs.mkdirSync(settings.dist);
  }

  try {
    browser = await puppeteer.launch({ headless: true });
    page = await browser.newPage();
  
    var i;
    for (i = 0; i < response.length; i++) {
  
      let filename = response[i].filename;
      let path = response[i].path;
      let disturl = settings.dist + filename + ".png";
  
      if (fs.existsSync(disturl)) {
        console.log("File exists");
      } else {
        await getscreen(filename, path);
      }
  
    }
  } catch(err) {
    console.error(err)
  }

  browser.close();
  console.log('Done!');

}

axios.get(settings.source)
  .then((response) => {
    setpuppeteer(response.data);
  })
  .catch((error) => {
    console.log('error :', error)
  });