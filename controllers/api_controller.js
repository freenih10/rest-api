require("dotenv").config();

const IS_PRODUCTION = process.env.NODE_ENV === "production";
const puppeteer = require("puppeteer-core");
const token = process.env.KEY_SERVERLESS;
const browserWSEndpoint = `wss://production-sfo.browserless.io?token=${token}`;

// Cache untuk menyimpan data sementara
let cache = {};
const CACHE_DURATION = 300000; // 5 menit dalam milidetik

const getBrowser = async () => {
    return puppeteer.connect({ browserWSEndpoint });
};

const listApi = (req, res) => {
    res.json({
        status: "running",
        baseUrl: "https://example.com/api",
        listApi: {
            tiktok: {
                isActive: true,
                query: "tiktok?url=URL_VIDEO",
                example:
                    "https://example.com/api/tiktok?url=https://tiktok.com/193iadawda221"
            },
            youtube: {
                isActive: true,
                query: "youtube?url=URL_VIDEO&resolution=SUPPORT_360P-1080P",
                example:
                    "https://example.com/api/youtube?url=https://youtube.com/v/193iadawda221&resoultion=1080p"
            },
            facebook: {
                isActive: true,
                query: "facebook?url=URL_VIDEO",
                example:
                    "https://example.com/api/facebook?url=https://facebook.com/v/193iadawda221"
            }
        }
    });
};

const tiktokDownloader = async (req, res) => {
    const { url } = req.query;
    const cacheKey = `tiktok-${url}`;
    const tikUrl = "https://tikvid.io/en";
    let browser = null;

    // Cek cache
    if (
        cache[cacheKey] &&
        Date.now() - cache[cacheKey].timestamp < CACHE_DURATION
    ) {
        console.log("Returning cached data");
        return res.json(cache[cacheKey].data);
    }

    try {
        console.log("Fetching data from TikTok API");
        const startTime = Date.now();
        browser = await getBrowser();
        const page = await browser.newPage();
        await page.goto(tikUrl, { waitUntil: "networkidle2" });

        // Input URL
        await page.type("#s_input", url);

        // Click Download
        await page.click("#search-form > button");

        // Download Result
        await page.waitForSelector(
            "#search-result > div.video-data > div > div.tik-right > div > p:nth-child(3) > a"
        );
        const linkDownload = await page.$eval(
            "#search-result > div.video-data > div > div.tik-right > div > p:nth-child(3) > a",
            el => el.href
        );

        const duration = Date.now() - startTime;
        console.log(`Fetched data in ${duration}ms`);

        // Simpan data di cache
        const responseData = {
            status: true,
            pesan: "Download melalui link di bawah!",
            link: linkDownload
        };
        cache[cacheKey] = {
            data: responseData,
            timestamp: Date.now()
        };

        res.json(responseData);
    } catch (error) {
        console.error("Error fetching data from TikTok API:", error);
        res.status(500).json({
            status: false,
            pesan: "Server error, coba lagi nanti!"
        });
    } finally {
        if (browser) await browser.close();
    }
};

module.exports = { listApi, tiktokDownloader };
