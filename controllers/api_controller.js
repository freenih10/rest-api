const getBrowser = require("../config/puppeteer");

const listApi = (req, res) => {
  res.json({
    status: "running",
    baseUrl: "https://example.com/api",
    listApi: {
      tiktok: {
        isActive: true,
        query: "tiktok?url=URL_VIDEO",
        example:
          "https://example.com/api/tiktok?url=https://tiktok.com/193iadawda221",
      },
      youtube: {
        isActive: true,
        query: "youtube?url=URL_VIDEO&resolution=SUPPORT_360P-1080P",
        example:
          "https://example.com/api/youtube?url=https://youtube.com/v/193iadawda221&resoultion=1080p",
      },
      facebook: {
        isActive: true,
        query: "facebook?url=URL_VIDEO",
        example:
          "https://example.com/api/facebook?url=https://facebook.com/v/193iadawda221",
      },
    },
  });
};

const tiktokDownloader = async (req, res) => {
  const tikUrl = "https://tikvid.io/en";
  const { url } = await req.query;
  let browser = null;
  try {
    browser = await getBrowser();
    const page = await browser.newPage();
    await page.goto(tikUrl);

    // Input Url
    const urlInput = await page.waitForSelector(
      '::-p-xpath(//*[@id="s_input"])'
    );
    await urlInput.type(url);

    // Click Download
    const btnSubmit = await page.waitForSelector(
      '::-p-xpath(//*[@id="search-form"]/button)'
    );
    btnSubmit.click();

    // Download Result
    const linkElement = await page.waitForSelector(
      "#search-result > div.video-data > div > div.tik-right > div > p:nth-child(3) > a"
    );
    if (linkElement) {
      const linkAttribute = await linkElement.getProperty("href");
      const linkDownload = await linkAttribute.jsonValue();
      if (linkDownload) {
        res
          .json({
            status: true,
            pesan: "Download melalui link dibawah!",
            link: linkDownload,
          })
          .status(200);
      } else {
        res
          .json({
            status: false,
            pesan: "Link download tidak ditemukan!",
          })
          .status(404);
      }
    } else {
      res
        .json({
          status: false,
          pesan: "Elemen link tidak ditemukan!",
        })
        .status(404);
    }
  } catch (error) {
    console.log(error.message);
    res
      .json({
        status: false,
        pesan: "Server error, coba lagi nanti!",
      })
      .status(500);
  } finally {
    if (browser) await browser.close();
  }
};

module.exports = { listApi, tiktokDownloader };
