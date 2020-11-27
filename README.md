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

$ cat data/csv/friday-november-20-2020-0735pm.csv
date,locale_name,locale_address,start_time,end_time,source_url,source_read_time
Sat Nov 13 2021,The Pint Public House,"1575 Argyle St., Halifax",10 p.m.,12 a.m.,https://www.nshealth.ca/news/potential-exposure-covid-19-various-halifax-locations,"Fri, 27 Nov 2020 04:00:15 GMT"
Sat Nov 13 2021,Julep Kitchen & Cocktails,"1684 Barrington St., Halifax",5:45 p.m.,10:30 p.m.,https://www.nshealth.ca/news/potential-exposure-covid-19-various-halifax-locations,"Fri, 27 Nov 2020 04:00:15 GMT"
...

$ cat data/json/friday-november-20-2020-0735pm.json
[
  {
    "date": "Sat Nov 13 2021",
    "locale_name": "The Pint Public House",
    "locale_address": "1575 Argyle St., Halifax",
    "start_time": "10 p.m.",
    "end_time": "12 a.m.",
    "source_url": "https://www.nshealth.ca/news/potential-exposure-covid-19-various-halifax-locations",
    "source_read_time": "Fri, 27 Nov 2020 04:00:15 GMT"
  },
  ...
]
```

## Environment variables

The following variables are supported for configuration:

| Environment variable | Description |
| -- | -- |
| TARGET_URL | URL to inspect |
| SCRAPE_CONTENT_SELECTOR | Targeted element in the page |
| SCRAPE_DATE_SELECTOR | Optionally targeted date element in the page, used for the output filename |
