# nshealth archive

**DISCLAIMER:** This script is intended for educational purposes. You may use it at your own risk and seek legal advice pursuant to its operation before use.

The number of potential COVID-19 exposures is too long to process manually now. This script will take the URL of the Nova Scotia Health news entry and convert it to a a flat file of locations and dates of potential COVID-19 exposure.

## Installation

```
git clone git@github.com:jeffandersen/nshealth-archive.git
cd nshealth-archive
```

## Usage

The default way is to pass the URL of exposures as the first argument:

```
./bin/scrape [URL]
```

This will create files in both CSV and JSON format for consumption.

#### Example

```
$ ./bin/scrape https://www.nshealth.ca/news/potential-covid-19-exposure-21-halifax-locations
$ cat ./data/csb/tuesday-november-24-2020-0822pm.csv
date,locale_name,locale_address,start_time,end_time,source_url,source_read_time
Nov. 14,The Pint Public House,"1575 Argyle St, Halifax",10:00 p.m.,close,https://www.nshealth.ca/news/potential-covid-19-exposure-21-halifax-locations,Fri, 27 Nov 2020 03:23:47 GMT
Nov. 14,The BOARD ROOM GAME CAFÉ,"1256 Barrington St, Halifax",9:30 p.m.,close,https://www.nshealth.ca/news/potential-covid-19-exposure-21-halifax-locations,Fri, 27 Nov 2020 03:23:47 GMT
...
```

## Environment variables

The following variables are supported for configuration:

| Environment variable | Description |
| -- | -- |
| TARGET_URL | URL to inspect |
| SCRAPE_CONTENT_SELECTOR | Targeted element in the page |
| SCRAPE_DATE_SELECTOR | Optionally targeted date element in the page, used for the output filename |
