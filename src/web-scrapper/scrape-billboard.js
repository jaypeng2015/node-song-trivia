const _ = require('lodash');
const cheerio = require('cheerio');
const request = require('request');
const url = require('url');

const host = 'http://www.billboard.com/';

const parseChart = (link) => {
  return new Promise((resolve, reject) => {
    request(link, (error, response, html) => {
      if (error) {
        reject(error);
        return;
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
        const track = _.trim(_.find(trackElement.children, {
          type: 'text',
        }).data);
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
      resolve(records);
    });
  });
};

const getCharts = () => {
  return new Promise((resolve, reject) => {
    request(url.resolve(host, '/charts'), (error, response, html) => {
      if (error) {
        reject(error);
        return;
      }

      const $ = cheerio.load(html);
      const hrefs = _.filter(_.values($('a')), (href) => {
        return href.attribs && _.startsWith(href.attribs.href, '/charts/');
      });

      const promises = _.reduce(hrefs, (result, href) => {
        const link = url.resolve(host, href.attribs.href);
        const promise = parseChart(link);
        result.push(promise);
        return result;
      }, []);

      Promise.all(promises)
       .then((results) => {
         const records = _.reduce(results, (array, result) => {
           return _.union(array, result);
         }, []);
         resolve(records);
       })
       .catch(reject);
    });
  });
};

module.exports = getCharts;
