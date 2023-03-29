const crypt = require("../crypto");
const crypto = new crypt();
const puppeteer = require("puppeteer");
const pixelmatch = require("pixelmatch");
const fs = require("fs");

const {BigQuery} = require('@google-cloud/bigquery');
const cookieMan = require("../cookieMan");
const cookieManager = new cookieMan();
const bigqueryClient = new BigQuery();
const {Storage} = require('@google-cloud/storage');
const storage = new Storage();
const myBucket = storage.bucket('webscrapy');
const previousScreenshotPath = './temp/previous-screenshot.png';
const currentScreenshotPath = './temp/current-screenshot.png';
const diffScreenshotPath = './temp/diff-screenshot.png';
const bucketName = 'scraping1';





class webscrap {
    constructor(){
        this.geturl = checksource;
        this.geturl = geturl;
    }
}


const checksource = async (req,res,next)=>{
    
    var rows = {};
    try{
        rows = await bigqueryClient
        .dataset("makione")
        .table("keys")
        .query(`SELECT *               
        FROM \`ismizo.makione.keys\`
        WHERE name='allkey'
        ORDER BY name NULLS LAST;`).then(r=>{
        return r;

    }).then((r)=>{
        
        const allkey = r[0][0].value;
        const bodyPlain = crypto.decrypt(req.body,allkey);
        const r2 = JSON.parse(bodyPlain);
        const obj = {};
        if(r2.usnum==="ismaadmin"){
            obj["source"] = "ok";
        }else{
            obj["source"] = "notok";
        };
        return obj;
    })
    }catch(e){
        rows = {"err":"err","details":JSON.stringify(e, null, 2)};
    }

        
    res.send(rows);
}

const geturl = async (req,res,next)=>{
    const url = req.params.id;
    let domain = (new URL(url));
    domain = domain.hostname;
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const date = cookieManager.customDateFormater();
    const timestamp = date.year+"_"+date.month+"_"+date.day+"_"+date.hour+"_"+date.minute+"_"+date.second.replaceAll(".","_");
    const currentScreenshotName = `${timestamp}-${domain.replaceAll(".","_")}.png`;

    await page.goto(url,{waitUntil:"networkidle2"});
    await page.screenshot({path: currentScreenshotPath, fullPage:true});


    await Promise.all([
        myBucket.upload(currentScreenshotPath, { destination: currentScreenshotName }),
      ]);

    const currentScreenshotUrl = `https://storage.googleapis.com/${bucketName}/${currentScreenshotName}`;


    res.send({domain,url,currentScreenshotUrl})
}
module.exports = webscrap;