// Load in depdendencies
var assert = require('assert');
var path = require('path');
var express = require('express');
function noop() {}

// Create FixedServer constructor
function FixedServer(options) {
  this.app = express();
  this.options = options || {};
}
FixedServer.prototype = {
  // Setup/teardown methods
  listen: function (port) {
    this._app = this.app.listen(port || this.options.port);
  },
  destroy: function (cb) {
    // Close the server
    this._app.close(cb || noop);
  },

  // Fixture additions
  installFixture: function (fixture) {
    // Add the route to the
    this.app[fixture.method](fixture.route, fixture.response);
  }
};

// Create FixedServerFactory constructor
function FixedServerFactory(options) {
  // Create a store for new fixtures
  this.fixtures = {};

  // Save options for later
  this.options = options || {};
}
FixedServerFactory.fromFile = function (filepath, options) {
  // Resolve the listed fixtures
  var fullpath = path.resolve(process.cwd(), filepath);
  var fixtures = require(fullpath);

  // Create a new factory
  var factory = new FixedServerFactory(options);
  factory.addFixtures(fixtures);

  // Return the factory
  return factory;
};
FixedServerFactory.prototype = {
  // Create class based storage mechanism for fixtures
  addFixture: function (name, params) {
    // Assert all of the parameters
    assert(params.method, 'FixedServer fixture "' + name + '" did not have a method');
    assert(params.route, 'FixedServer fixture "' + name + '" did not have a route');
    assert(params.response, 'FixedServer fixture "' + name + '" did not have a response');
    this.fixtures[name] = params;
    return this;
  },
  addFixtures: function (obj) {
    Object.getOwnPropertyNames(obj).forEach(function (key) {
        this.addFixture(key, obj[key]);
    }, this);
    return this;
  },

  createServer: function (fixtureNames) {
    // Upcast fixtureNames to an array
    if (!fixtureNames) {
      fixtureNames = [];
    } else if (!Array.isArray(fixtureNames)) {
      fixtureNames = [fixtureNames];
    }

    // Install each fixture
    var server = new FixedServer(this.options);
    fixtureNames.forEach(function (fixtureName) {
      // Get and assert the fixture exists
      var fixture = this.fixtures[fixtureName];
      assert(fixture, 'FixedServer fixture "' + fixtureName + '" could not be found.');

      server.installFixture(fixture);
    }, this);

    // Return the server
    return server;
  },

  // Create helper for mocha tests
  run: function (fixtureNames) {
    var server = this.createServer(fixtureNames);
    var that = this;
    before(function () {
      server.listen();
    });
    after(function (done) {
      server.destroy(done);
    });
    return server;
  }
};

// Expose FixedServer as part of FixedServerFactory
FixedServerFactory.FixedServer = FixedServer;

// Export the FixedServerFactory
module.exports = FixedServerFactory;
