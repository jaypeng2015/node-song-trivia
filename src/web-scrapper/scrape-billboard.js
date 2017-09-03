const _ = require('lodash');
const cheerio = require('cheerio');
const request = require('request-promise-native');
const url = require('url');
const logger = require('../lib/logger');

const host = 'http://www.billboard.com/';

const parseChart = async (link) => {
  let html;
  try {
    html = await request.get(link, { timeout: 5000 });
  } catch (res) {
    logger.warn('Error fetching link', {
      link,
      err: res.statusCode,
    });
    return [];
  }

  const $ = cheerio.load(html);
  const rows = $('div[class="chart-row__container"]');
  const records = _.reduce(rows, (result, row) => {
    const data = _.find(row.children, {
      name: 'div',
      attribs: { class: 'chart-row__title' },
    });
    const trackElement = _.find(data.children, {
      name: 'h2',
    });
    const track = _.trim(_.get(_.find(trackElement.children, {
      type: 'text',
    }), 'data', null));
    const artistElement = _.find(data.children, {
      attribs: {
        class: 'chart-row__artist',
      },
    });

    let artist = null;
    if (artistElement) {
      artist = _.trim(_.find(artistElement.children, {
        type: 'text',
      }).data);
    }

    result.push({
      artist,
      track,
    });
    return result;
  }, []);
  return records;
};

const getCharts = async () => {
  const html = await request.get(url.resolve(host, '/charts'));
  const $ = cheerio.load(html);
  const hrefs = _.filter(_.values($('a')), (href) => {
    return href.attribs
      && _.startsWith(href.attribs.href, '/charts/')
      && !_.includes(href.attribs.href, '#')
      && !_.includes(href.attribs.href, 'year-end'); // Ignore for now
  });

  const promises = _.reduce(hrefs, (result, href) => {
    const link = url.resolve(host, href.attribs.href);
    const promise = parseChart(link);
    result.push(promise);
    return result;
  }, []);

  const results = await Promise.all(promises);
  const records = _.reduce(results, (array, result) => {
    return _.union(array, result);
  }, []);

  _.remove(records, (record) => {
    return !(record.artist || record.track);
  });
  logger.info(`Scraped ${records.length} records from billboard.`);
  return records;
};

module.exports = getCharts;
