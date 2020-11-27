#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { convertArrayToCSV } = require('convert-array-to-csv');
const { slugify, puppeteerOpts } = require('./utils');

// RegExp used to extract key pieces of information from the target lines
const localeRegex = new RegExp(/([A-Za-zÀ-ÖØ-öø-ÿ\d\W\'\"\-\_\s]+)\s\(([A-Za-zÀ-ÖØ-öø-ÿ\'\"\-\_\s\W\d]+)\)\son/ig);
const durationRegex = new RegExp(/(?:and|on)\s([\w\d\s]+\.\s[\d]+)\sbetween\s(([\d]+(?:\:[\d]+)?)\s(?:a.m.|p.m.)|open)\s(?:and|to)\s(([\d]+(?:\:[\d]+)?)\s(?:a.m.|p.m.)|close)/ig);

// Default config values
const defaultDocumentSelector = '.l-content article ul li';
const defaultDateSelector = '.l-content article .news__post-date';

// Scrape the target URL and extract results
const scrape = ({targetURL, documentSelector, dateSelector, exportFilename}) => {
  dateSelector = dateSelector || defaultDateSelector
  documentSelector = documentSelector || defaultDocumentSelector

  // Scraping the targeted text entries of the page
  const scrapeExposures = (async () => {
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
      const text = await page.evaluate(el => el.innerText, el);
      results.push(text);
    }

    await browser.close();

    return results;
  })();

  // Scraping the targeted page for a post date
  const scrapeFilename = (async () => {
    if (exportFilename) {
      return exportFilename;
    }

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Navigate to the target page and wait for idle
    await page.goto(targetURL, {waitUntil: 'networkidle2'});

    // Find the date element and get its contents
    const element = await page.$(dateSelector);
    if (!element) throw new Error('Date element not found');
    const text = await page.evaluate(element => element.innerText, element);
    const slug = slugify(text);

    return `${slug}`;
  })();

  // Extract relevant metadata for each entry
  const extract = entries => {
    return entries.map(e => {
      // Find location name and address
      const localeMatches = [...e.matchAll(localeRegex)];
      const localeMatch = localeMatches[0] || [];
      const locale = {
        name: localeMatch[1]?.trim(),
        address: localeMatch[2]?.trim(),
      };

      // Find duration at location
      const durationMatches = [...e.matchAll(durationRegex)];
      const exposures = [];
      for (const duration of durationMatches) {
        exposures.push({
          date: parseMonthDay(duration[1]),
          locale_name: locale.name,
          locale_address: locale.address,
          start_time: duration[2],
          end_time: duration[4],
          source_url: targetURL,
          source_read_time: (new Date()).toUTCString(),
        });
      }

      return exposures;
    }).flat();
  };

  // Run the scraping and extraction process
  return Promise.all([
    scrapeExposures,
    scrapeFilename,
  ])
    .then(output => {
      // Run text extractions on the scraped result
      const result = extract(output[0]);

      return {
        filename: output[1],
        result,
      };
    });
};

// Dates of potential exposure don't include the year
// We need to make an assumption based on month
const parseMonthDay = (datestr) => {
  const ms = Date.parse(datestr);
  const d = new Date(ms);
  // TODO: this shouldn't be hard coded, but hopefully it won't matter next year
  d.setYear(d.getMonth() > 10 ? 2020 : 2021);
  return d.toDateString();
};

// Save the results to disk
const saveToDisk = (filename, result) => {
  const writeIfNotExists = (ext, slug, contents) => {
    return new Promise((resolve, reject) => {
      const fn = path.join(__dirname, `../data/${ext}/`, `${slug}.${ext}`);
      if (fs.existsSync(fn)) {
        return resolve();
      }
      fs.writeFile(fn, contents, err => {
        if (err) {
          return reject(err)
        }
        resolve();
      });
    });
  };

  const saveJSON = (slug, data) => {
    return writeIfNotExists('json', slug, JSON.stringify(data, null, 2));
  };

  const saveCSV = (slug, data) => {
    return writeIfNotExists('csv', slug, convertArrayToCSV(data));
  };

  return Promise.all([
    saveCSV(filename, result),
    saveJSON(filename, result),
  ]).then(() => {
    return filename
  });
};

module.exports = {
  scrape,
  saveToDisk,
};
