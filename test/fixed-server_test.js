// Load in dependencies
var url = require('url');
var expect = require('chai').expect;
var extend = require('obj-extend');
var request = require('request');
var FixedServer = require('../');

// Set up server constants
var serverOptions = {
  protocol: 'http:',
  hostname: '127.0.0.1',
  port: 1337
};

// Create helper functions for making requests
function getUrl(pathname) {
  var _url = url.format(extend({
    pathname: pathname
  }, serverOptions));
  return _url;
}
function saveRequest(options) {
  before(function (done) {
    var that = this;
    request(options, function handleResult (err, res, body) {
      that.err = err;
      that.res = res;
      that.body = body;
      done();
    });
  });
}

describe('A FixedServer with a single fixture', function () {
  var fixedServer = new FixedServer(serverOptions);
  fixedServer.addFixture('GET 200 /hello', {
    method: 'get',
    route: '/hello',
    response: function (req, res) {
      res.send('world');
    }
  });
  fixedServer.run('GET 200 /hello');
  saveRequest(getUrl('/hello'));

  it('replies to the loaded route', function () {
    expect(this.err).to.equal(null);
    expect(this.res.statusCode).to.equal(200);
    expect(this.body).to.equal('world');
  });
});

describe('A FixedServer with multiple fixtures', function () {
  var fixedServer = new FixedServer(serverOptions);
  fixedServer.addFixtures({
    'GET 200 /waffle': {
      method: 'get',
      route: '/waffle',
      response: function (req, res) {
        res.send('fries');
      }
    },
    'POST 500 /auth': {
      method: 'post',
      route: '/auth',
      response: function (req, res) {
        res.send('Rejected!', 500);
      }
    }
  });
  fixedServer.run([
    'GET 200 /waffle',
    'POST 500 /auth'
  ]);
  saveRequest({
    method: 'POST',
    url: getUrl('/auth')
  });

  it('replies to the loaded routes', function () {
    expect(this.err).to.equal(null);
    expect(this.res.statusCode).to.equal(500);
    expect(this.body).to.equal('Rejected!');
  });
});

describe('A FixedServer loaded from a file', function () {
  var fixedServer = FixedServer.fromFile(__dirname + '/test-files/fixtures.js',
                                         serverOptions);
  fixedServer.run([
    'GET 200 /trips#full'
  ]);
  saveRequest({
    method: 'GET',
    url: getUrl('/trips')
  });

  it('replies to the loaded routes', function () {
    expect(this.err).to.equal(null);
    expect(this.res.statusCode).to.equal(200);
    expect(JSON.parse(this.body)).to.deep.equal([{data:true}]);
  });
});

// DEV: Regression test for https://github.com/uber/fixed-server/issues/2
describe('Multiple FixedServers run in the same test', function () {
  (new FixedServer(serverOptions)).run();
  (new FixedServer(extend({}, serverOptions, {port: 1338}))).run();

  it('do not conflict while shutting down', function () {
    // DEV: This is automatic since the regression was in the mocha helpers
  });
});
