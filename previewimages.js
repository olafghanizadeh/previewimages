const axios = require("axios");
const puppeteer = require("puppeteer");
const fs = require("fs");
require("dotenv").config();

const settings = {
  source: "https://www.d-hagemeier.com/preview-images.json",
  domain: "https://www.d-hagemeier.com",
  imgwidth: 1200,
  imgheight: 628,
};

/**
 * Helper for file existence
 * @param {String} filePath - Path to check for existence
 */
function fileExist(filePath) {
  return new Promise((resolve, reject) => {
    fs.access(filePath, fs.F_OK, (err) => {
      if (err) {
        // File needs to be generated
        return resolve(err);
      }
      reject("File exists");
    });
  });
}
/**
 * Helper to create directory
 * @param {String} dirPath - Path to directory
 */
function createDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }
}

/**
 * Start Puppeteer, check for file existence and pass files
 * @param {Object} response - List of files to screenshot
 */
async function setupPuppeteer(response) {
  try {
    browser = await puppeteer.launch({ headless: true });
    distDir = await createDirectory("public/.cache");

    var i;
    for (i = 0; i < response.length; i++) {
      let filename = response[i].filename;
      let path = response[i].path;
      let distUrl = "public/.cache/" + filename + ".png";
      let existFlag = await fileExist(distUrl);
      if (existFlag) {
        await getScreenshot(path, filename, distUrl);
      }
    }
  } catch (err) {
    console.log(err);
  } finally {
    browser.close();
  }
}

/**
 *
 * @param {String} path - Path from source file
 * @param {String} filename - Filename for screenshot
 * @param {String} distUrl - Output URL
 */
async function getScreenshot(path, filename, distUrl) {
  try {
    page = await browser.newPage();
    let srcUrl = settings.domain + path;

    console.log("Getting: " + path);
    await page.setViewport({
      width: settings.imgwidth,
      height: settings.imgheight,
    });
    await page.goto(srcUrl, { waitUntil: "networkidle0" });
    await page.screenshot({ path: distUrl });
    console.log("Got: " + filename + ".png");
  } catch (err) {
    console.error("Error getscreen:", err);
  }
}

/**
 * Setup Dummy directory for netlify
 */
function dummydist() {
  createDirectory("public");
  fs.writeFile("public/index.html", "", function (err) {
    if (err) throw err;
    console.log("Dummy dist created");
  });
}

/**
 * Start Axios to get and pass source file
 */
axios
  .get(settings.source)
  .then((response) => {
    dummydist();
    setupPuppeteer(response.data);
  })
  .catch((err) => {
    console.error("Error Axios: ", err);
  });
