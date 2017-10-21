const should = require('should');
const scrapeBillboard = require('../../src/web-scrapper/scrape-billboard');

describe('web-scrapper', () => {
  it('should get all the artists and their tracks', () => {
    return scrapeBillboard()
      .then((result) => {
        should.exist(result);
        result.should.be.an.Array();
        result.forEach((record) => {
          record.should.have.property('track');
          record.should.have.property('artist');
        });
      });
  });
});
