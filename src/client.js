var EventData = require('./eventData');
var results = require('./results');

const expectedVersion = {
  any: -2,
  noStream: -1,
  emptyStream: -1
};
const positions = {
  start: new results.Position(0, 0),
  end: new results.Position(-1, -1)
};

/**
 * @param {string} eventId
 * @param {object} event
 * @param {object} [metadata]
 * @param {string} [type]
 * @returns {EventData}
 */
function jsonEventDataFactory(eventId, event, metadata, type) {
  if (!event || typeof event !== 'object') throw new TypeError("data must be an object.");

  var eventBuf = new Buffer(JSON.stringify(event));
  var metaBuf = metadata ? new Buffer(JSON.stringify(metadata)) : null;
  return new EventData(eventId, type || event.constructor.name, true, eventBuf, metaBuf);
}

/**
 * @param {string} eventId
 * @param {string} type
 * @param {boolean} isJson
 * @param {Buffer} data
 * @param {Buffer} [metadata]
 * @returns {EventData}
 */
function eventDataFactory(eventId, type, isJson, data, metadata) {
  return new EventData(eventId, type, isJson, data, metadata);
}

// Exporting classes
module.exports.EventStoreConnection = require('./eventStoreConnection');
module.exports.UserCredentials = require('./systemData/userCredentials');
module.exports.EventData = EventData;
module.exports.PersistentSubscriptionSettings = require('./persistentSubscriptionSettings');
module.exports.SystemConsumerStrategies = require('./systemConsumerStrategies');
// Exporting errors
module.exports.WrongExpectedVersionError = require('./errors/wrongExpectedVersionError');
module.exports.StreamDeletedError = require('./errors/streamDeletedError');
module.exports.AccessDeniedError = require('./errors/accessDeniedError');
// Exporting enums/constants
module.exports.expectedVersion = expectedVersion;
module.exports.positions = positions;
module.exports.systemMetadata = require('./common/systemMetadata');
module.exports.eventReadStatus = results.EventReadStatus;
module.exports.sliceReadStatus = require('./sliceReadStatus');
// Helper functions
module.exports.createConnection = module.exports.EventStoreConnection.create;
module.exports.createEventData = eventDataFactory;
module.exports.createJsonEventData = jsonEventDataFactory;