# nshealth to csv

The number of potential COVID-19 exposures is too long to process manually now. This script will take the URL of the Nova Scotia Health news entry and convert it to a CSV of locations and dates of potential exposure.

## Installation

```
git clone git@github.com:jeffandersen/nshealth-scrape.git
cd nshealth-scrape
```

## Usage

The default way is to pass the URL of exposures as the first argument:

```
node index.js [URL]
```

Alternatively these environment variables are available:

| Environment variable | Description |
| -- | -- |
| TARGET_URL | URL to inspect |
| EXPORT_FILENAME | Optionally define an export filename, defaults to date on page |
| DOCUMENT_CONTENT_SELECTOR | Targeted element in the page |
| DOCUMENT_DATE_SELECTOR | Optionally targeted date element in the page |
