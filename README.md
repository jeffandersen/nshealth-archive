# nshealth to csv

The number of potential COVID-19 exposures is too long to process manually now. This script will take the URL of the Nova Scotia Health news entry and convert it to a CSV of locations and dates of potential exposure.

*DISCLAIMER:* This script is intended for educational purposes; seek legal advice for the legality of its operation.

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

Which results in output in the following format:

```
date,locale_name,locale_address,start_time,end_time
```

#### Example

```
$ node index.js http://www.nshealth.ca/news/potential-covid-19-exposure-21-halifax-locations
$ cat tuesday-november-24-2020-0822pm.csv
date,locale_name,locale_address,start_time,end_time
Nov. 14,The Pint Public House,"1575 Argyle St, Halifax",10:00 p.m.,close
Nov. 14,The BOARD ROOM GAME CAFÉ,"1256 Barrington St, Halifax",9:30 p.m.,close
...
```

## Environment variables

The following variables are supported for configuration:

| Environment variable | Description |
| -- | -- |
| TARGET_URL | URL to inspect |
| EXPORT_FILENAME | Optionally define an export filename, defaults to date on page |
| DOCUMENT_CONTENT_SELECTOR | Targeted element in the page |
| DOCUMENT_DATE_SELECTOR | Optionally targeted date element in the page |
