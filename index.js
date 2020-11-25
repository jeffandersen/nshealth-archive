#!/usr/bin/env node
const fs = require('fs');
const puppeteer = require('puppeteer');
const { convertArrayToCSV } = require('convert-array-to-csv');


// URL and document selector used to narrow down results
const targetURL = process.env.TARGET_URL || process.argv[2] || 'http://www.nshealth.ca/news/potential-covid-19-exposure-21-halifax-locations';
const documentSelector = process.env.DOCUMENT_CONTENT_SELECTOR || '.l-content article ul li';
const dateSelector = process.env.DOCUMENT_DATE_SELECTOR || '.l-content article .news__post-date';

// Where to save the CSV file
const exportFilename = process.env.EXPORT_FILENAME;

// RegExp used to extract key pieces of information from the target lines
const localeRegex = new RegExp(/([A-Za-zÀ-ÖØ-öø-ÿ\d\W\'\"\-\_\s]+)\s\(([A-Za-zÀ-ÖØ-öø-ÿ\'\"\-\_\s\W\d]+)\)\son/g);
const durationRegex = new RegExp(/(?:and|on)\s([\w\d\s]+\.\s[\d]+)\sbetween\s(([\d]+\:[\d]+)\s(?:a.m.|p.m.)|open)\sand\s(([\d]+\:[\d]+)\s(?:a.m.|p.m.)|close)/g);

// Scraping the targeted text entries of the page
const scrapeExposures = (async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Navigate to the target page and wait for idle
  await page.goto(targetURL, {waitUntil: 'networkidle2'});

  // Find the content area to target, retrieve its text
  const elements = await page.$$(documentSelector);
  const results = [];
  for (const el of elements) {
    const text = await page.evaluate(el => el.innerText, el);
    results.push(text);
  }

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

  return `${slug}.csv`;
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
        date: duration[1],
        locale_name: locale.name,
        locale_address: locale.address,
        start_time: duration[2],
        end_time: duration[4],
      });
    }

    return exposures;
  }).flat();
};

const slugify = text => {
  // https://gist.github.com/mathewbyrne/1280286
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

// Run the scraping and extraction process
Promise.all([
  scrapeExposures,
  scrapeFilename,
])
  .then(output => {
    // Run text extractions on the scraped result
    const result = extract(output[0]);

    // Convert the data array to csv
    const data = convertArrayToCSV(result);

    // Write the CSV to disk
    const filename = output[1];
    fs.writeFileSync(filename, data);

    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
