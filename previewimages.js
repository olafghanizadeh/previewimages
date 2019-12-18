const axios = require('axios');
const puppeteer = require('puppeteer');
const { Storage } = require('@google-cloud/storage');
require('dotenv').config()

const GOOGLE_CLOUD_PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID;
const BUCKET_NAME = process.env.GOOGLE_BUCKET_NAME;
const CLIENTEMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const PRIVATEKEY = process.env.GOOGLE_PRIVATE_KEY;
const credentials = {
  client_email : CLIENTEMAIL,
  private_key : PRIVATEKEY
}

const settings = {
  source: "https://www.d-hagemeier.com/preview-images.json",
  imgwidth: 1200,
  imgheight: 628
}

async function setupGoogleStorage(response) {

  try {
    const storage = new Storage({
      projectId: GOOGLE_CLOUD_PROJECT_ID,
      credentials: credentials
    });
    const bucket = storage.bucket(BUCKET_NAME);
  
    var i;
    for (i = 0; i < response.length; i++) {

      let filename = response[i].filename;
      let path = response[i].path;
      let file = bucket.file(filename + ".png");
      let exists = await file.exists().then(function(data) { return data[0]; });
      
      if(exists == true) {
        console.log("Image already exists: " + filename + ".png")
      } else {
        await get(path, file, filename)
      }

    }
  } catch (err) {
    console.log("Error setupGoogleStorage: ", err);
  }

}

async function get(path, file, filename) {
  browser = await puppeteer.launch({ headless: true });
  page = await browser.newPage();
  const buffer = await getscreen(path, filename);
  await uploadBuffer(file, buffer, filename)
  console.log("Uploaded: " + filename + ".png")
  await file.makePublic();
  browser.close();
}

async function getscreen(url, filename) {
  try {
    console.log("Getting: " + url);
    await page.setViewport({ width: settings.imgwidth, height: settings.imgheight });
    await page.goto(url, { waitUntil: 'networkidle0' });
    const buffer = await page.screenshot();
    console.log("Got: " + filename + ".png");
    return buffer;
  }
  catch (err) {
    console.log('Error getscreen:', err);
  }
}

async function uploadBuffer(file, buffer, filename) {
  return new Promise((resolve) => {
      file.save(buffer, { destination: filename }, () => {
          resolve();
      });
  })
}

axios.get(settings.source)
  .then((response) => {
    setupGoogleStorage(response.data);
  })
  .catch((err) => {
    console.log('Error Axios: ', err)
  });