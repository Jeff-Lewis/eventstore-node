var util = require('util');
var uuid = require('uuid');
var client = require('../src/client');


module.exports = {
  setUp: function(cb) {
    this.expectedEvent = {a: uuid.v4(), b: Math.random()};
    this.expectedEventType = 'anEvent';
    this.expectedEventId = uuid.v4();
    var event = client.createJsonEventData(this.expectedEventId, this.expectedEvent, null, this.expectedEventType);
    this.conn.appendToStream(this.testStreamName, client.expectedVersion.noStream, event)
        .then(function() {
          cb();
        })
        .catch(cb);
  },
  'Read Event Happy Path': function(test) {
    var self = this;
    this.conn.readEvent(this.testStreamName, 0)
        .then(function(result) {
          test.areEqual('status', result.status, client.eventReadStatus.Success);
          test.areEqual('stream', result.stream, self.testStreamName);
          test.areEqual('eventNumber', result.eventNumber, 0);
          test.ok(result.event !== null, "event is null.");
          test.ok(result.event.originalEvent !== null, "event.originalEvent is null.");
          var event = JSON.parse(result.event.originalEvent.data.toString());
          test.areEqual('event.eventId', result.event.originalEvent.eventId, self.expectedEventId);
          test.areEqual('event.eventType', result.event.originalEvent.eventType, self.expectedEventType);
          test.areEqual('decoded event.data', event, self.expectedEvent);
          test.done();
        })
        .catch(function(err) {
          test.done(err);
        })
  },
  'Read Event From Non-Existing Stream': function(test) {
    var anotherStream = 'test' + uuid.v4();
    this.conn.readEvent(anotherStream, 0)
        .then(function(result) {
          test.areEqual('status', result.status, client.eventReadStatus.NoStream);
          test.areEqual('stream', result.stream, anotherStream);
          test.areEqual('eventNumber', result.eventNumber, 0);
          test.areEqual('event', result.event, null);
          test.done();
        })
        .catch(function(err) {
          test.done(err);
        });
  },
  'Read Event From Deleted Stream': function(test) {
    var self = this;
    this.conn.deleteStream(this.testStreamName, 0, true)
        .then(function() {
          return self.conn.readEvent(self.testStreamName, 0)
        })
        .then(function(result) {
          test.areEqual('status', result.status, client.eventReadStatus.StreamDeleted);
          test.areEqual('stream', result.stream, self.testStreamName);
          test.areEqual('eventNumber', result.eventNumber, 0);
          test.areEqual('event', result.event, null);
          test.done();
        })
        .catch(function(err) {
          test.done(err);
        });
  },
  'Read Event With Inexisting Version': function(test) {
    var self = this;
    return self.conn.readEvent(self.testStreamName, 1)
        .then(function(result) {
          test.areEqual('status', result.status, client.eventReadStatus.NotFound);
          test.areEqual('stream', result.stream, self.testStreamName);
          test.areEqual('eventNumber', result.eventNumber, 1);
          test.areEqual('event', result.event, null);
          test.done();
        })
        .catch(function(err) {
          test.done(err);
        });
  },
  'Read Event With No Access': function(test) {
    var self = this;
    var metadata = {$acl: {$r: '$admins'}};
    this.conn.setStreamMetadataRaw(self.testStreamName, client.expectedVersion.noStream, metadata)
        .then(function(){
          return self.conn.readEvent(self.testStreamName, 0);
        })
        .then(function(result) {
          test.fail("readEvent succeeded but should have failed.");
          test.done();
        })
        .catch(function(err) {
          var isAccessDenied = err instanceof client.AccessDeniedError;
          test.ok(isAccessDenied, "readEvent should have failed with AccessDeniedError, got " + err.constructor.name);
          if (isAccessDenied) return test.done();
          test.done(err);
        });
  }
};

require('./common/base_test').init(module.exports);