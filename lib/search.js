#!/usr/bin/env node
const fs = require('fs');
const puppeteer = require('puppeteer');
const { puppeteerOpts } = require('./utils');

// Default config values
const defaultTargetURL = 'https://www.nshealth.ca/covid19-news';
const defaultDocumentSelector = '.view-content h3 a';

// Post title keywords to find one of
const oneOf = [
  'exposure to',
  'potential exposure',
  'possible exposure',
  'covid-19 exposures',
  'covid exposures',
];

// Search the target URL for relevant hrefs
const search = ({ targetURL, documentSelector, limit }) => {
  targetURL = targetURL || defaultTargetURL
  documentSelector = documentSelector || defaultDocumentSelector

  const scrapePosts = (async () => {
    if (!targetURL) {
      throw new Error('Missing target url');
    }

    const browser = await puppeteer.launch(puppeteerOpts);
    const page = await browser.newPage();

    // Navigate to the target page and wait for idle
    await page.goto(targetURL, {waitUntil: 'networkidle2', timeout: 60000});

    // Find the content area to target, retrieve its text
    const elements = await page.$$(documentSelector);
    const results = [];
    for (const el of elements) {
      const href = await page.evaluate(el => el.href, el);
      const title = await page.evaluate(el => el.innerText, el);

      if (title) {
        const t = title.toLowerCase();
        const covid = t.indexOf('covid') > -1;
        if (covid && oneOf.filter(k => t.indexOf(k) > -1).length) {
          results.push(href);

          // If a limit is met, break now
          if (!isNaN(limit) && results.length === limit) {
            break;
          }
        }
      }
    }

    await browser.close();

    return results;
  })();

  return scrapePosts.then(result => {
    return {
      targetURL,
      result,
    };
  });
};

module.exports = {
  search,
};
