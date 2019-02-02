import launchPuppeteer from './launchPuppeteer';
import * as dotenv from 'dotenv';

dotenv.config();
dotenv.config({path: '../.env'});

const {LAUNCH_URL} = process.env;

const about: string = 'a[href="/about/"]';
const contact: string = 'a[href="/contact/"]';
const projects: string = 'a[href="/projects/"]';

const defaultTimeout: {} = {timeout: 10000};
const waitUntilEvent: {} = {waitUntil: 'domcontentloaded'};

const generateScreenshotPath = (index: number): {path: string} => {
  return {path: `screenshots/${index}.png`};
};

async function iteration(index: number): Promise<void> {
  const browser = await launchPuppeteer();
  const [page] = await browser.pages();
  try {
    console.log(`starting iteration ${index}`);
    console.time();
    await page.goto(LAUNCH_URL, waitUntilEvent);
    await page.waitForSelector(about);
    await page.click(about);
    await page.waitForNavigation(defaultTimeout);
    await page.waitForSelector(contact);
    await page.click(contact);
    await page.waitForNavigation(defaultTimeout);
    await page.waitForSelector(projects);
    await page.click(projects);
    await page.close();
    console.timeEnd();
    console.log(`Finished iteration ${index}`);
  } catch (e) {
    await page.screenshot(generateScreenshotPath(index));
    Promise.reject(new Error(e));
  }
}

const total: number = 10000;

const promises: Array<(index: number) => Promise<any>> = [];

[...Array(total)].map((_, i) => (promises[i] = iteration));

(async () => {
  promises.reduce(async (chain, cmd, i) => {
    if (chain === null) {
      return await cmd(i);
    } else {
      return chain.then(async () => {
        return await cmd(i);
      });
    }
  }, Promise.resolve([]));
})();
