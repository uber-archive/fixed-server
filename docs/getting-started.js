// Create a server that we can setup/teardown during tests
var assert = require('assert');
var request = require('request');
var FixedServer = require('../');
var fixedServer = new FixedServer({port: 1337});

// Create a fixture that we can refer to during the test
// DEV: `method` and `route` are done via `express` which allows for complex methods/routing
fixedServer.addFixture('GET 200 /hello', {
  method: 'get',
  route: '/hello',
  response: function (req, res) {
    res.send('world');
  }
});

// Start our test
describe('A server', function () {
  // Automatically setup/teardown server with our fixture
  fixedServer.run('GET 200 /hello');

  it('responding to a request', function (done) {
    request('http://localhost:1337/hello', function (err, res, body) {
      assert.strictEqual(body, 'world');
      done();
    });
  });
});
