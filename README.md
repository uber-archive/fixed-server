# fixed-server [![Build status](https://travis-ci.org/uber/fixed-server.png?branch=master)](https://travis-ci.org/uber/fixed-server)

Server for HTTP fixtures

This was built to make common responses from an API consistent across tests.

For convenience, there are methods which setup/teardown a server for `mocha` (see [`factory.run`][]).

[`factory.run`]: #factoryrunfixturenames

## Getting Started
Install the module with: `npm install fixed-server`

```javascript
// Create a server that we can setup/teardown during tests
var assert = require('assert');
var request = require('request');
var FixedServer = require('fixed-server');
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
```

## Documentation
`fixed-server` exposes `FixedServerFactory` via its `module.exports`. Under the hood, `FixedServer` runs via [`express`][].

[`express`]: http://expressjs.com/

### `new FixedServerFactory(options)`
Constructor for creating new `FixedServer's`

- options `Object` - Container for options
    - port `Number` - Port to run created `FixedServer's` from

### `FixedServerFactory.fromFile(filepath, options)`
Helper to quickly generate a server with fixtures from a file

- filepath `String` - Path to fixtures to load in
    - This will be loaded via `require` and passed in to `factory.addFixtures`
- option `Object` - Options to pass to `FixedServerFactory` constructor

### `factory.addFixture(name, params)`
Add a new fixture to the list of potential fixture to load into child servers.

- name `String` - Key to store fixture under
- params `Object` - Container for fixture info
    - method `String` - Lowercase HTTP method to run `params.response` under (e.g. `get`, `post`, `put`)
        - Any valid [`express` method][] is accepted
    - route `String|RegExp` - Route to run `params.response` under (e.g. `/hello`)
    - response `Function` - `express` middleware that will handle request and generate response
        - Function signature must be `(req, res)` as is expected in `express`

[`express` method]: http://expressjs.com/api.html#app.VERB

### `factory.addFixtures(obj)`
Add multiple fixtures to our list of fixtures

- obj `Object` - Container for multiple fixtures
    - Each key-value pair will be used as `name` and `params` respectively for `FixedServer.addFixtures`

### `factory.createServer(fixtureNames)`
Create a `FixedServer` with `fixtureNames` running on it

- fixtureNames `String|String[]` - Single fixture name or array of fixture names to load into server
    - Each of these will be loaded via `server.installFixture`

### `factory.run(fixtureNames)`
Helper method for running server inside of `mocha` tests

- fixtureNames `String|String[]` - Information to pass onto `factory.createServer`

### `FixedServer()`
Create a server to host fixtures on

### `server.listen(port)`
Start listening for requests

- port `Number` - Port to start listening against

### `server.destroy(cb)`
Tear down the server

- cb `Function` - Optional error-first callback to run when the server teardown is completed

### `server.installFixture(fixture)`
Add a new route to the server

- fixture `Object` - Container for route parameters
    - method `String` - Lowercase HTTP method to run `params.response` under (e.g. `get`, `post`, `put`)
        - Any valid [`express` method][] is accepted
    - route `String|RegExp` - Route to run `fixture.response` under (e.g. `/hello`)
    - response `Function` - `express` middleware that will handle request and generate response
        - Function signature must be `(req, res)` as is expected in `express`

```js
server.installFixture({
  method: 'get',
  route: '/hello',
  response: function (req, res) {
    res.send('world');
  }
});
// converts to
express().get('/hello', function (req, res) {
  res.send('world');
});
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint via [grunt](https://github.com/gruntjs/grunt) and test via `npm test`.

## License
Copyright (c) 2014 Uber

Licensed under the MIT license.
