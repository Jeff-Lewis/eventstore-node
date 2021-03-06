module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var EventData = __webpack_require__(1);
	var results = __webpack_require__(3);

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
	module.exports.EventStoreConnection = __webpack_require__(7);
	module.exports.UserCredentials = __webpack_require__(66);
	module.exports.EventData = EventData;
	module.exports.PersistentSubscriptionSettings = __webpack_require__(67);
	module.exports.SystemConsumerStrategies = __webpack_require__(53);
	// Exporting errors
	module.exports.WrongExpectedVersionError = __webpack_require__(35);
	module.exports.StreamDeletedError = __webpack_require__(36);
	module.exports.AccessDeniedError = __webpack_require__(37);
	// Exporting enums/constants
	module.exports.expectedVersion = expectedVersion;
	module.exports.positions = positions;
	module.exports.systemMetadata = __webpack_require__(68);
	module.exports.eventReadStatus = results.EventReadStatus;
	module.exports.sliceReadStatus = __webpack_require__(48);
	// Helper functions
	module.exports.createConnection = module.exports.EventStoreConnection.create;
	module.exports.createEventData = eventDataFactory;
	module.exports.createJsonEventData = jsonEventDataFactory;

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var uuid = __webpack_require__(2);

	function isValidId(id) {
	  if (typeof id !== 'string') return false;
	  var buf = uuid.parse(id);
	  var valid = false;
	  for(var i=0;i<buf.length;i++)
	    if (buf[i] !== 0)
	      valid = true;
	  return valid;
	}

	/**
	 * Create an EventData
	 * @param {string} eventId
	 * @param {string} type
	 * @param {boolean} [isJson]
	 * @param {Buffer} [data]
	 * @param {Buffer} [metadata]
	 * @constructor
	 */
	function EventData(eventId, type, isJson, data, metadata) {
	  if (!isValidId(eventId)) throw new TypeError("eventId must be a string containing a UUID.");
	  if (typeof type !== 'string' || type === '') throw new  TypeError("type must be a non-empty string.");
	  if (isJson && typeof isJson !== 'boolean') throw new TypeError("isJson must be a boolean.");
	  if (data && !Buffer.isBuffer(data)) throw new TypeError("data must be a Buffer.");
	  if (metadata && !Buffer.isBuffer(metadata)) throw new TypeError("metadata must be a Buffer.");

	  this.eventId = eventId;
	  this.type = type;
	  this.isJson = isJson || false;
	  this.data = data || new Buffer(0);
	  this.metadata = metadata || new Buffer(0);
	}

	module.exports = EventData;


/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = require("uuid");

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(4);
	var uuid = __webpack_require__(2);
	var Long = __webpack_require__(5);
	var ensure = __webpack_require__(6);

	/**
	 * @param {!number|!Long} commitPosition
	 * @param {!number|!Long} preparePosition
	 * @constructor
	 * @property {!Long} commitPosition
	 * @property {!Long} preparePosition
	 */
	function Position(commitPosition, preparePosition) {
	  ensure.notNull(commitPosition, "commitPosition");
	  ensure.notNull(preparePosition, "preparePosition");
	  commitPosition = Long.fromValue(commitPosition);
	  preparePosition = Long.fromValue(preparePosition);

	  Object.defineProperties(this, {
	    commitPosition: {
	      enumerable: true, value: commitPosition
	    },
	    preparePosition: {
	      enumerable: true, value: preparePosition
	    }
	  });
	}

	Position.prototype.compareTo = function(other) {
	  if (this.commitPosition.lt(other.commitPosition) || (this.commitPosition.eq(other.commitPosition)&& this.preparePosition.lt(other.preparePosition)))
	    return -1;
	  if (this.commitPosition.gt(other.commitPosition) || (this.commitPosition.eq(other.commitPosition) && this.preparePosition.gt(other.preparePosition)))
	    return 1;
	  return 0;
	};

	Position.prototype.toString = function() {
	  return [this.commitPosition.toString(), this.preparePosition.toString()].join("/");
	};


	const EventReadStatus = {
	  Success: 'success',
	  NotFound: 'notFound',
	  NoStream: 'noStream',
	  StreamDeleted: 'streamDeleted'
	};

	/**
	 * @param {object} ev
	 * @constructor
	 * @property {string} eventStreamId
	 * @property {string} eventId
	 * @property {number} eventNumber
	 * @property {string} eventType
	 * @property {number} createdEpoch
	 * @property {?Buffer} data
	 * @property {?Buffer} metadata
	 * @property {boolean} isJson
	 */
	function RecordedEvent(ev) {
	  Object.defineProperties(this, {
	    eventStreamId: {enumerable: true, value: ev.event_stream_id},
	    eventId: {enumerable: true, value: uuid.unparse(ev.event_id.buffer, ev.event_id.offset)},
	    eventNumber: {enumerable: true, value: ev.event_number},
	    eventType: {enumerable: true, value: ev.event_type},
	    //Javascript doesn't have .Net precision for time, so we use created_epoch for created
	    created: {enumerable: true, value: new Date(ev.created_epoch ? ev.created_epoch.toInt() : 0)},
	    createdEpoch: {enumerable: true, value: ev.created_epoch ? ev.created_epoch.toInt() : 0},
	    data: {enumerable: true, value: ev.data ? ev.data.toBuffer() : new Buffer(0)},
	    metadata: {enumerable: true, value: ev.metadata ? ev.metadata.toBuffer() : new Buffer(0)},
	    isJson: {enumerable: true, value: ev.data_content_type == 1}
	  });
	}

	/**
	 * @param {object} ev
	 * @constructor
	 * @property {?RecordedEvent} event
	 * @property {?RecordedEvent} link
	 * @property {?RecordedEvent} originalEvent
	 * @property {boolean} isResolved
	 * @property {?Position} originalPosition
	 * @property {string} originalStreamId
	 * @property {number} originalEventNumber
	 */
	function ResolvedEvent(ev) {
	  Object.defineProperties(this, {
	    event: {
	      enumerable: true,
	      value: ev.event === null ? null : new RecordedEvent(ev.event)
	    },
	    link: {
	      enumerable: true,
	      value: ev.link === null ? null : new RecordedEvent(ev.link)
	    },
	    originalEvent: {
	      enumerable: true,
	      get: function() {
	        return this.link || this.event;
	      }
	    },
	    isResolved: {
	      enumerable: true,
	      get: function() {
	        return this.link !== null && this.event !== null;
	      }
	    },
	    originalPosition: {
	      enumerable: true,
	      value: (ev.commit_position && ev.prepare_position) ? new Position(ev.commit_position, ev.prepare_position) : null
	    },
	    originalStreamId: {
	      enumerable: true,
	      get: function() {
	        return this.originalEvent.eventStreamId;
	      }
	    },
	    originalEventNumber: {
	      enumerable: true,
	      get: function() {
	        return this.originalEvent.eventNumber;
	      }
	    }
	  });
	}

	/**
	 *
	 * @param {string} status
	 * @param {string} stream
	 * @param {number} eventNumber
	 * @param {object} event
	 * @constructor
	 * @property {string} status
	 * @property {string} stream
	 * @property {number} eventNumber
	 * @property {ResolvedEvent} event
	 */
	function EventReadResult(status, stream, eventNumber, event) {
	  Object.defineProperties(this, {
	    status: {enumerable: true, value: status},
	    stream: {enumerable: true, value: stream},
	    eventNumber: {enumerable: true, value: eventNumber},
	    event: {
	      enumerable: true, value: status === EventReadStatus.Success ? new ResolvedEvent(event) : null
	    }
	  });
	}

	/**
	 * @param {number} nextExpectedVersion
	 * @param {Position} logPosition
	 * @constructor
	 * @property {number} nextExpectedVersion
	 * @property {Position} logPosition
	 */
	function WriteResult(nextExpectedVersion, logPosition) {
	  Object.defineProperties(this, {
	    nextExpectedVersion: {
	      enumerable: true, value: nextExpectedVersion
	    },
	    logPosition: {
	      enumerable: true, value: logPosition
	    }
	  });
	}

	/**
	 * @param {string} status
	 * @param {string} stream
	 * @param {number} fromEventNumber
	 * @param {string} readDirection
	 * @param {object[]} events
	 * @param {number} nextEventNumber
	 * @param {number} lastEventNumber
	 * @param {boolean} isEndOfStream
	 * @constructor
	 * @property {string} status
	 * @property {string} stream
	 * @property {number} fromEventNumber
	 * @property {string} readDirection
	 * @property {ResolvedEvent[]} events
	 * @property {number} nextEventNumber
	 * @property {number} lastEventNumber
	 * @property {boolean} isEndOfStream
	 */
	function StreamEventsSlice(
	    status, stream, fromEventNumber, readDirection, events, nextEventNumber, lastEventNumber, isEndOfStream
	) {
	  Object.defineProperties(this, {
	    status: {
	      enumerable: true, value: status
	    },
	    stream: {
	      enumerable: true, value: stream
	    },
	    fromEventNumber: {
	      enumerable: true, value: fromEventNumber
	    },
	    readDirection: {
	      enumerable: true, value: readDirection
	    },
	    events: {
	      enumerable: true, value: events ? events.map(function(ev) { return new ResolvedEvent(ev); }) : []
	    },
	    nextEventNumber: {
	      enumerable: true, value: nextEventNumber
	    },
	    lastEventNumber: {
	      enumerable: true, value: lastEventNumber
	    },
	    isEndOfStream: {
	      enumerable: true, value: isEndOfStream
	    }
	  })
	}

	/**
	 * @param {string} readDirection
	 * @param {Position} fromPosition
	 * @param {Position} nextPosition
	 * @param {ResolvedEvent[]} events
	 * @constructor
	 * @property {string} readDirection
	 * @property {Position} fromPosition
	 * @property {Position} nextPosition
	 * @property {ResolvedEvent[]} events
	 */
	function AllEventsSlice(readDirection, fromPosition, nextPosition, events) {
	  Object.defineProperties(this, {
	    readDirection: {
	      enumerable: true, value: readDirection
	    },
	    fromPosition: {
	      enumerable: true, value: fromPosition
	    },
	    nextPosition: {
	      enumerable: true, value: nextPosition
	    },
	    events: {
	      enumerable: true, value: events ? events.map(function(ev){ return new ResolvedEvent(ev); }) : []
	    },
	    isEndOfStream: {
	      enumerable: true, value: events === null || events.length === 0
	    }
	  });
	}

	/**
	 * @param {Position} logPosition
	 * @constructor
	 * @property {Position} logPosition
	 */
	function DeleteResult(logPosition) {
	  Object.defineProperties(this, {
	    logPosition: {
	      enumerable: true, value: logPosition
	    }
	  });
	}

	/**
	 * @param {string} stream
	 * @param {boolean} isStreamDeleted
	 * @param {number} metastreamVersion
	 * @param {object} streamMetadata
	 * @constructor
	 * @property {string} stream
	 * @property {boolean} isStreamDeleted
	 * @property {number} metastreamVersion
	 * @property {object} streamMetadata
	 */
	function RawStreamMetadataResult(stream, isStreamDeleted, metastreamVersion, streamMetadata) {
	  ensure.notNullOrEmpty(stream);
	  Object.defineProperties(this, {
	    stream: {enumerable: true, value: stream},
	    isStreamDeleted: {enumerable: true, value: isStreamDeleted},
	    metastreamVersion: {enumerable: true, value: metastreamVersion},
	    streamMetadata: {enumerable: true, value: streamMetadata}
	  });
	}

	const PersistentSubscriptionCreateStatus = {
	  Success: 'success',
	  NotFound: 'notFound',
	  Failure: 'failure'
	};

	/**
	 * @param {string} status
	 * @constructor
	 * @property {string} status
	 */
	function PersistentSubscriptionCreateResult(status) {
	  Object.defineProperties(this, {
	    status: {enumerable: true, value: status}
	  });
	}

	const PersistentSubscriptionUpdateStatus = {
	  Success: 'success',
	  NotFound: 'notFound',
	  Failure: 'failure',
	  AccessDenied: 'accessDenied'
	};

	/**
	 * @param {string} status
	 * @constructor
	 * @property {string} status
	 */
	function PersistentSubscriptionUpdateResult(status) {
	  Object.defineProperties(this, {
	    status: {enumerable: true, value: status}
	  });
	}

	const PersistentSubscriptionDeleteStatus = {
	  Success: 'success',
	  Failure: 'failure'
	};

	/**
	 * @param {string} status
	 * @constructor
	 * @property {string} status
	 */
	function PersistentSubscriptionDeleteResult(status) {
	  Object.defineProperties(this, {
	    status: {enumerable: true, value: status}
	  });
	}

	// Exports Constructors
	module.exports.Position = Position;
	module.exports.ResolvedEvent = ResolvedEvent;
	module.exports.EventReadStatus = EventReadStatus;
	module.exports.EventReadResult = EventReadResult;
	module.exports.WriteResult = WriteResult;
	module.exports.StreamEventsSlice = StreamEventsSlice;
	module.exports.AllEventsSlice = AllEventsSlice;
	module.exports.DeleteResult = DeleteResult;
	module.exports.RawStreamMetadataResult = RawStreamMetadataResult;
	module.exports.PersistentSubscriptionCreateResult = PersistentSubscriptionCreateResult;
	module.exports.PersistentSubscriptionCreateStatus = PersistentSubscriptionCreateStatus;
	module.exports.PersistentSubscriptionUpdateResult = PersistentSubscriptionUpdateResult;
	module.exports.PersistentSubscriptionUpdateStatus = PersistentSubscriptionUpdateStatus;
	module.exports.PersistentSubscriptionDeleteResult = PersistentSubscriptionDeleteResult;
	module.exports.PersistentSubscriptionDeleteStatus = PersistentSubscriptionDeleteStatus;


/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = require("util");

/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = require("long");

/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports.notNullOrEmpty = function(value, name) {
	  if (value === null)
	    throw new TypeError(name + " should not be null.");
	  if (value === '')
	    throw new Error(name + " should not be empty.");
	};

	module.exports.notNull = function(value, name) {
	  if (value === null)
	    throw new TypeError(name + " should not be null.");
	};

	module.exports.isInteger = function(value, name) {
	  if (typeof value !== 'number' || value % 1 !== 0)
	    throw new TypeError(name + " should be an integer.");
	};

	module.exports.isArrayOf = function(expectedType, value, name) {
	  if (!Array.isArray(value))
	    throw new TypeError(name + " should be an array.");
	  if (!value.every(function(x) { return x instanceof expectedType; }))
	    throw new TypeError([name, " should be an array of ", expectedType.name, "."].join(""));
	};

	module.exports.isTypeOf = function(expectedType, value, name) {
	  if (!(value instanceof expectedType))
	    throw new TypeError([name, " should be of type '", expectedType.name, "'."].join(""));
	};

	module.exports.positive = function(value, name) {
	  if (value <= 0)
	    throw new Error(name + " should be positive.");
	};

	module.exports.nonNegative = function(value, name) {
	  if (value < 0)
	    throw new Error(name + " should be non-negative.");
	};

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var EventStoreNodeConnection = __webpack_require__(8);
	var StaticEndpointDiscoverer = __webpack_require__(64);
	var NoopLogger = __webpack_require__(65);

	var defaultConnectionSettings = {
	  log: new NoopLogger(),
	  verboseLogging: false,

	  maxQueueSize: 5000,
	  maxConcurrentItems: 5000,
	  maxRetries: 10,
	  maxReconnections: 10,

	  requireMaster: true,

	  reconnectionDelay: 100,
	  operationTimeout: 7*1000,
	  operationTimeoutCheckPeriod: 1000,

	  defaultUserCredentials: null,
	  useSslConnection: false,
	  targetHost: null,
	  validateServer: false,

	  failOnNoServerResponse: false,
	  heartbeatInterval: 750,
	  heartbeatTimeout: 1500,
	  clientConnectionTimeout: 1000
	};


	function merge(a,b) {
	  var c = {};
	  Object.getOwnPropertyNames(a).forEach(function(k) {
	    c[k] = a[k];
	  });
	  Object.getOwnPropertyNames(b).forEach(function(k) {
	    c[k] = b[k];
	  });
	  return c;
	}

	/**
	 * Create an EventStore connection
	 * @param {object} settings
	 * @param {object} tcpEndPoint
	 * @param {string} [connectionName]
	 * @returns {EventStoreNodeConnection}
	 */
	module.exports.create = function(settings, tcpEndPoint, connectionName) {
	  //TODO: cluster connection
	  var mergedSettings = merge(defaultConnectionSettings, settings || {});
	  var endpointDiscoverer = new StaticEndpointDiscoverer(tcpEndPoint, settings.useSslConnection);
	  return new EventStoreNodeConnection(mergedSettings, endpointDiscoverer, connectionName || null);
	};

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(4);
	var uuid = __webpack_require__(2);
	var EventEmitter = __webpack_require__(9).EventEmitter;
	var ensure = __webpack_require__(6);

	var messages = __webpack_require__(10);
	var EventStoreConnectionLogicHandler = __webpack_require__(11);

	var DeleteStreamOperation = __webpack_require__(34);
	var AppendToStreamOperation = __webpack_require__(39);
	var StartTransactionOperation = __webpack_require__(40);
	var TransactionalWriteOperation = __webpack_require__(42);
	var CommitTransactionOperation = __webpack_require__(43);
	var ReadEventOperation = __webpack_require__(44);
	var ReadStreamEventsForwardOperation = __webpack_require__(45);
	var ReadStreamEventsBackwardOperation = __webpack_require__(49);
	var ReadAllEventsForwardOperation = __webpack_require__(50);
	var ReadAllEventsBackwardOperation = __webpack_require__(51);
	var CreatePersistentSubscriptionOperation = __webpack_require__(52);
	var UpdatePersistentSubscriptionOperation = __webpack_require__(54);
	var DeletePersistentSubscriptionOperation = __webpack_require__(55);

	var EventStoreTransaction = __webpack_require__(41);
	var EventStoreStreamCatchUpSubscription = __webpack_require__(56);
	var EventStoreAllCatchUpSubscription = __webpack_require__(58);
	var EventStorePersistentSubscription = __webpack_require__(59);

	var results = __webpack_require__(3);
	var systemStreams = __webpack_require__(62);
	var systemEventTypes = __webpack_require__(63);
	var EventData = __webpack_require__(1);

	const MaxReadSize = 4096;

	/**
	 * @param settings
	 * @param endpointDiscoverer
	 * @param connectionName
	 * @constructor
	 * @property {string} connectionName
	 */
	function EventStoreNodeConnection(settings, endpointDiscoverer, connectionName) {
	  this._connectionName = connectionName || ['ES-', uuid.v4()].join('');
	  this._settings = settings;
	  this._endpointDiscoverer = endpointDiscoverer;
	  this._handler = new EventStoreConnectionLogicHandler(this, settings);

	  var self = this;
	  this._handler.on('connected', function(e) {
	    self.emit('connected', e);
	  });
	  this._handler.on('disconnected', function(e) {
	    self.emit('disconnected', e);
	  });
	  this._handler.on('reconnecting', function(e) {
	    self.emit('reconnecting', e);
	  });
	  this._handler.on('closed', function(e) {
	    self.emit('closed', e);
	  });
	  this._handler.on('error', function(e) {
	    self.emit('error', e);
	  });
	}
	util.inherits(EventStoreNodeConnection, EventEmitter);

	Object.defineProperty(EventStoreNodeConnection.prototype, 'connectionName', {
	  get: function() {
	    return this._connectionName;
	  }
	});

	/**
	 * @returns {Promise}
	 */
	EventStoreNodeConnection.prototype.connect = function() {
	  var self = this;
	  return new Promise(function(resolve, reject) {
	    function cb(err) {
	      if (err) return reject(err);
	      resolve();
	    }
	    var startConnectionMessage = new messages.StartConnectionMessage(cb, self._endpointDiscoverer);
	    self._handler.enqueueMessage(startConnectionMessage);
	  });
	};

	EventStoreNodeConnection.prototype.close = function() {
	  this._handler.enqueueMessage(new messages.CloseConnectionMessage("Connection close requested by client.", null));
	};

	/**
	 * Delete a stream (async)
	 * @param {string} stream
	 * @param {number} expectedVersion
	 * @param {boolean} [hardDelete]
	 * @param {UserCredentials} [userCredentials]
	 * @returns {Promise.<DeleteResult>}
	 */
	EventStoreNodeConnection.prototype.deleteStream = function(stream, expectedVersion, hardDelete, userCredentials) {
	  ensure.notNullOrEmpty(stream, "stream");
	  ensure.isInteger(expectedVersion, "expectedVersion");
	  hardDelete = !!hardDelete;
	  userCredentials = userCredentials || null;

	  var self = this;
	  return new Promise(function(resolve, reject) {
	    function cb(err, result) {
	      if (err) return reject(err);
	      resolve(result);
	    }

	    var deleteStreamOperation = new DeleteStreamOperation(
	        self._settings.log, cb, self._settings.requireMaster, stream, expectedVersion, hardDelete, userCredentials);
	    self._enqueueOperation(deleteStreamOperation);
	  });
	};

	/**
	 * Append events to a stream (async)
	 * @param {string} stream The name of the stream to which to append.
	 * @param {number} expectedVersion The version at which we currently expect the stream to be in order that an optimistic concurrency check can be performed.
	 * @param {EventData[]|EventData} events The event(s) to append.
	 * @param {UserCredentials} [userCredentials] User credentials
	 * @returns {Promise.<WriteResult>}
	 */
	EventStoreNodeConnection.prototype.appendToStream = function(stream, expectedVersion, events, userCredentials) {
	  ensure.notNullOrEmpty(stream, "stream");
	  ensure.isInteger(expectedVersion, "expectedVersion");
	  if (!Array.isArray(events))
	    events = [events];
	  ensure.isArrayOf(EventData, events, "events");
	  userCredentials = userCredentials || null;

	  var self = this;
	  return new Promise(function(resolve, reject) {
	    function cb(err, result) {
	      if (err) return reject(err);
	      resolve(result);
	    }
	    var operation = new AppendToStreamOperation(self._settings.log, cb, self._settings.requireMaster, stream,
	        expectedVersion, events, userCredentials);
	    self._enqueueOperation(operation);
	  });
	};

	/**
	 * Start a transaction (async)
	 * @param {string} stream
	 * @param {number} expectedVersion
	 * @param {UserCredentials} [userCredentials]
	 * @returns {Promise.<EventStoreTransaction>}
	 */
	EventStoreNodeConnection.prototype.startTransaction = function(stream, expectedVersion, userCredentials) {
	  ensure.notNullOrEmpty(stream, "stream");
	  ensure.isInteger(expectedVersion, "expectedVersion");
	  userCredentials = userCredentials || null;

	  var self = this;
	  return new Promise(function(resolve, reject) {
	    function cb(err, result) {
	      if (err) return reject(err);
	      resolve(result);
	    }
	    var operation = new StartTransactionOperation(self._settings.log, cb, self._settings.requireMaster, stream,
	        expectedVersion, self, userCredentials);
	    self._enqueueOperation(operation);
	  });
	};

	/**
	 * Continue a transaction
	 * @param {number} transactionId
	 * @param {UserCredentials} userCredentials
	 * @returns {EventStoreTransaction}
	 */
	EventStoreNodeConnection.prototype.continueTransaction = function(transactionId, userCredentials) {
	  ensure.nonNegative(transactionId, "transactionId");

	  return new EventStoreTransaction(transactionId, userCredentials, this);
	};

	EventStoreNodeConnection.prototype.transactionalWrite = function(transaction, events, userCredentials) {
	  ensure.isTypeOf(EventStoreTransaction, transaction, "transaction");
	  ensure.isArrayOf(EventData, events, "events");
	  userCredentials = userCredentials || null;

	  var self = this;
	  return new Promise(function(resolve, reject) {
	    function cb(err) {
	      if (err) return reject(err);
	      resolve();
	    }
	    var operation = new TransactionalWriteOperation(self._settings.log, cb, self._settings.requireMaster,
	        transaction.transactionId, events, userCredentials);
	    self._enqueueOperation(operation);
	  });
	};

	EventStoreNodeConnection.prototype.commitTransaction = function(transaction, userCredentials) {
	  ensure.isTypeOf(EventStoreTransaction, transaction, "transaction");

	  var self = this;
	  return new Promise(function(resolve, reject) {
	    function cb(err, result) {
	      if (err) return reject(err);
	      resolve(result);
	    }
	    var operation = new CommitTransactionOperation(self._settings.log, cb, self._settings.requireMaster,
	        transaction.transactionId, userCredentials);
	    self._enqueueOperation(operation);
	  });
	};

	/**
	 * Read a single event (async)
	 * @param {string} stream
	 * @param {number} eventNumber
	 * @param {boolean} [resolveLinkTos]
	 * @param {UserCredentials} [userCredentials]
	 * @returns {Promise.<EventReadResult>}
	 */
	EventStoreNodeConnection.prototype.readEvent = function(stream, eventNumber, resolveLinkTos, userCredentials) {
	  ensure.notNullOrEmpty(stream, "stream");
	  ensure.isInteger(eventNumber, "eventNumber");
	  if (eventNumber < -1) throw new Error("eventNumber out of range.");
	  resolveLinkTos = !!resolveLinkTos;
	  userCredentials = userCredentials || null;

	  if (typeof stream !== 'string' || stream === '') throw new TypeError("stream must be an non-empty string.");
	  if (typeof eventNumber !== 'number' || eventNumber % 1 !== 0) throw new TypeError("eventNumber must be an integer.");
	  if (eventNumber < -1) throw new Error("eventNumber out of range.");
	  if (resolveLinkTos && typeof resolveLinkTos !== 'boolean') throw new TypeError("resolveLinkTos must be a boolean.");

	  var self = this;
	  return new Promise(function(resolve, reject){
	    function cb(err, result) {
	      if (err) return reject(err);
	      resolve(result);
	    }
	    var operation = new ReadEventOperation(self._settings.log, cb, stream, eventNumber, resolveLinkTos,
	        self._settings.requireMaster, userCredentials);
	    self._enqueueOperation(operation);
	  });
	};

	/**
	 * Reading a specific stream forwards (async)
	 * @param {string} stream
	 * @param {number} start
	 * @param {number} count
	 * @param {boolean} [resolveLinkTos]
	 * @param {UserCredentials} [userCredentials]
	 * @returns {Promise.<StreamEventsSlice>}
	 */
	EventStoreNodeConnection.prototype.readStreamEventsForward = function(
	    stream, start, count, resolveLinkTos, userCredentials
	) {
	  ensure.notNullOrEmpty(stream, "stream");
	  ensure.isInteger(start, "start");
	  ensure.nonNegative(start, "start");
	  ensure.isInteger(count, "count");
	  ensure.positive(count, "count");
	  if (count > MaxReadSize) throw new Error(util.format("Count should be less than %d. For larger reads you should page.", MaxReadSize));
	  resolveLinkTos = !!resolveLinkTos;
	  userCredentials = userCredentials || null;

	  var self = this;
	  return new Promise(function(resolve, reject) {
	    function cb(err, result) {
	      if (err) return reject(err);
	      resolve(result);
	    }
	    var operation = new ReadStreamEventsForwardOperation(self._settings.log, cb, stream, start, count,
	        resolveLinkTos, self._settings.requireMaster, userCredentials);
	    self._enqueueOperation(operation);
	  });
	};

	/**
	 * Reading a specific stream backwards (async)
	 * @param {string} stream
	 * @param {number} start
	 * @param {number} count
	 * @param {boolean} [resolveLinkTos]
	 * @param {UserCredentials} [userCredentials]
	 * @returns {Promise.<StreamEventsSlice>}
	 */
	EventStoreNodeConnection.prototype.readStreamEventsBackward = function(
	    stream, start, count, resolveLinkTos, userCredentials
	) {
	  ensure.notNullOrEmpty(stream, "stream");
	  ensure.isInteger(start, "start");
	  ensure.isInteger(count, "count");
	  ensure.positive(count, "count");
	  if (count > MaxReadSize) throw new Error(util.format("Count should be less than %d. For larger reads you should page.", MaxReadSize));
	  resolveLinkTos = !!resolveLinkTos;
	  userCredentials = userCredentials || null;

	  var self = this;
	  return new Promise(function(resolve, reject) {
	    function cb(err, result) {
	      if (err) return reject(err);
	      resolve(result);
	    }
	    var operation = new ReadStreamEventsBackwardOperation(self._settings.log, cb, stream, start, count,
	        resolveLinkTos, self._settings.requireMaster, userCredentials);
	    self._enqueueOperation(operation);
	  });
	};

	/**
	 * Reading all events forwards (async)
	 * @param {Position} position
	 * @param {number} maxCount
	 * @param {boolean} [resolveLinkTos]
	 * @param {UserCredentials} [userCredentials]
	 * @returns {Promise.<AllEventsSlice>}
	 */
	EventStoreNodeConnection.prototype.readAllEventsForward = function(
	    position, maxCount, resolveLinkTos, userCredentials
	) {
	  ensure.isTypeOf(results.Position, position, "position");
	  ensure.isInteger(maxCount, "maxCount");
	  ensure.positive(maxCount, "maxCount");
	  if (maxCount > MaxReadSize) throw new Error(util.format("Count should be less than %d. For larger reads you should page.", MaxReadSize));
	  resolveLinkTos = !!resolveLinkTos;
	  userCredentials = userCredentials || null;

	  var self = this;
	  return new Promise(function(resolve, reject) {
	    function cb(err, result) {
	      if (err) return reject(err);
	      resolve(result);
	    }
	    var operation = new ReadAllEventsForwardOperation(self._settings.log, cb, position, maxCount,
	        resolveLinkTos, self._settings.requireMaster, userCredentials);
	    self._enqueueOperation(operation);
	  });
	};

	/**
	 * Reading all events backwards (async)
	 * @param {Position} position
	 * @param {number} maxCount
	 * @param {boolean} [resolveLinkTos]
	 * @param {UserCredentials} [userCredentials]
	 * @returns {Promise.<AllEventsSlice>}
	 */
	EventStoreNodeConnection.prototype.readAllEventsBackward = function(
	    position, maxCount, resolveLinkTos, userCredentials
	) {
	  ensure.isTypeOf(results.Position, position, "position");
	  ensure.isInteger(maxCount, "maxCount");
	  ensure.positive(maxCount, "maxCount");
	  if (maxCount > MaxReadSize) throw new Error(util.format("Count should be less than %d. For larger reads you should page.", MaxReadSize));
	  resolveLinkTos = !!resolveLinkTos;
	  userCredentials = userCredentials || null;

	  var self = this;
	  return new Promise(function(resolve, reject) {
	    function cb(err, result) {
	      if (err) return reject(err);
	      resolve(result);
	    }
	    var operation = new ReadAllEventsBackwardOperation(self._settings.log, cb, position, maxCount,
	        resolveLinkTos || false, self._settings.requireMaster, userCredentials || null);
	    self._enqueueOperation(operation);
	  });
	};

	/**
	 * Subscribe to a stream (async)
	 * @param {!string} stream
	 * @param {!boolean} resolveLinkTos
	 * @param {function} eventAppeared
	 * @param {function} [subscriptionDropped]
	 * @param {UserCredentials} [userCredentials]
	 * @returns {Promise.<EventStoreSubscription>}
	 */
	EventStoreNodeConnection.prototype.subscribeToStream = function(
	    stream, resolveLinkTos, eventAppeared, subscriptionDropped, userCredentials
	) {
	  if (typeof stream !== 'string' || stream === '') throw new TypeError("stream must be a non-empty string.");
	  if (typeof eventAppeared !== 'function') throw new TypeError("eventAppeared must be a function.");

	  var self = this;
	  return new Promise(function(resolve,reject) {
	    function cb(err, result) {
	      if (err) return reject(err);
	      resolve(result);
	    }
	    self._handler.enqueueMessage(
	        new messages.StartSubscriptionMessage(
	            cb, stream, !!resolveLinkTos, userCredentials || null, eventAppeared, subscriptionDropped || null,
	            self._settings.maxRetries, self._settings.operationTimeout));
	  });
	};

	/**
	 * @param {!string} stream
	 * @param {?number} lastCheckpoint
	 * @param {!boolean} resolveLinkTos
	 * @param {!function} eventAppeared
	 * @param {function} [liveProcessingStarted]
	 * @param {function} [subscriptionDropped]
	 * @param {UserCredentials} [userCredentials]
	 * @param {!number} [readBatchSize]
	 * @returns {EventStoreStreamCatchUpSubscription}
	 */
	EventStoreNodeConnection.prototype.subscribeToStreamFrom = function(
	    stream, lastCheckpoint, resolveLinkTos, eventAppeared, liveProcessingStarted, subscriptionDropped,
	    userCredentials, readBatchSize
	) {
	  if (typeof stream !== 'string' || stream === '') throw new TypeError("stream must be a non-empty string.");
	  if (typeof eventAppeared !== 'function') throw new TypeError("eventAppeared must be a function.");

	  var catchUpSubscription =
	      new EventStoreStreamCatchUpSubscription(this, this._settings.log, stream, lastCheckpoint,
	          resolveLinkTos, userCredentials || null, eventAppeared,
	          liveProcessingStarted || null, subscriptionDropped || null, this._settings.verboseLogging,
	          readBatchSize);
	  catchUpSubscription.start();
	  return catchUpSubscription;
	};

	/**
	 * Subscribe to all (async)
	 * @param {!boolean} resolveLinkTos
	 * @param {!function} eventAppeared
	 * @param {function} [subscriptionDropped]
	 * @param {UserCredentials} [userCredentials]
	 * @returns {Promise.<EventStoreSubscription>}
	 */
	EventStoreNodeConnection.prototype.subscribeToAll = function(
	    resolveLinkTos, eventAppeared, subscriptionDropped, userCredentials
	) {
	  if (typeof eventAppeared !== 'function') throw new TypeError("eventAppeared must be a function.");

	  var self = this;
	  return new Promise(function(resolve, reject) {
	    function cb(err, result) {
	      if (err) return reject(err);
	      resolve(result);
	    }
	    self._handler.enqueueMessage(
	        new messages.StartSubscriptionMessage(
	            cb, '', resolveLinkTos, userCredentials || null, eventAppeared, subscriptionDropped || null,
	            self._settings.maxRetries, self._settings.operationTimeout));
	  });
	};

	/**
	 * Subscribe to all from
	 * @param {?Position} lastCheckpoint
	 * @param {!boolean} resolveLinkTos
	 * @param {!function} eventAppeared
	 * @param {function} [liveProcessingStarted]
	 * @param {function} [subscriptionDropped]
	 * @param {UserCredentials} [userCredentials]
	 * @param {!number} [readBatchSize]
	 * @returns {EventStoreAllCatchUpSubscription}
	 */
	EventStoreNodeConnection.prototype.subscribeToAllFrom = function(
	    lastCheckpoint, resolveLinkTos, eventAppeared, liveProcessingStarted, subscriptionDropped,
	    userCredentials, readBatchSize
	) {
	  if (typeof eventAppeared !== 'function') throw new TypeError("eventAppeared must be a function.");

	  var catchUpSubscription =
	      new EventStoreAllCatchUpSubscription(this, this._settings.log, lastCheckpoint, resolveLinkTos,
	          userCredentials || null, eventAppeared, liveProcessingStarted || null,
	          subscriptionDropped || null, this._settings.verboseLogging, readBatchSize || 500);
	  catchUpSubscription.start();
	  return catchUpSubscription;
	};

	/**
	 * Subscribe to a persistent subscription
	 * @param {string} stream
	 * @param {string} groupName
	 * @param {function} eventAppeared
	 * @param {function} [subscriptionDropped]
	 * @param {UserCredentials} [userCredentials]
	 * @param {number} [bufferSize]
	 * @param {boolean} [autoAck]
	 */
	EventStoreNodeConnection.prototype.connectToPersistentSubscription = function(
	    stream, groupName, eventAppeared, subscriptionDropped, userCredentials, bufferSize, autoAck
	) {
	  ensure.notNullOrEmpty(groupName, "groupName");
	  ensure.notNullOrEmpty(stream, "stream");
	  ensure.notNull(eventAppeared, "eventAppeared");

	  subscriptionDropped = subscriptionDropped || null;
	  userCredentials = userCredentials || null;
	  bufferSize = bufferSize === undefined ? 10 : bufferSize;
	  autoAck = autoAck === undefined ? true : !!autoAck;

	  var subscription = new EventStorePersistentSubscription(
	      groupName, stream, eventAppeared, subscriptionDropped, userCredentials, this._settings.log,
	      this._settings.verboseLogging, this._settings, this._handler, bufferSize, autoAck);
	  subscription.start();

	  return subscription;
	};

	/**
	 * @param {string} stream
	 * @param {string} groupName
	 * @param {PersistentSubscriptionSettings} settings
	 * @param {UserCredentials} [userCredentials]
	 * @returns {Promise.<PersistentSubscriptionCreateResult>}
	 */
	EventStoreNodeConnection.prototype.createPersistentSubscription = function(stream, groupName, settings, userCredentials) {
	  ensure.notNullOrEmpty(stream, "stream");
	  ensure.notNullOrEmpty(groupName, "groupName");
	  ensure.notNull(settings, "settings");

	  var self = this;
	  return new Promise(function(resolve, reject){
	    function cb(err, result) {
	      if (err) return reject(err);
	      resolve(result);
	    }
	    self._enqueueOperation(
	        new CreatePersistentSubscriptionOperation(self._settings.log, cb, stream, groupName, settings, userCredentials || null));
	  });
	};

	/**
	 * @param {string} stream
	 * @param {string} groupName
	 * @param {string} settings
	 * @param {UserCredentials} [userCredentials]
	 * @returns {Promise.<PersistentSubscriptionUpdateResult>}
	 */
	EventStoreNodeConnection.prototype.updatePersistentSubscription = function(stream, groupName, settings, userCredentials) {
	  ensure.notNullOrEmpty(stream, "stream");
	  ensure.notNullOrEmpty(groupName, "groupName");
	  ensure.notNull(settings, "settings");
	  var self = this;
	  return new Promise(function(resolve, reject) {
	    function cb(err, result) {
	      if (err) return reject(err);
	      resolve(result);
	    }
	    self._enqueueOperation(
	        new UpdatePersistentSubscriptionOperation(self._settings.log, cb, stream, groupName, settings, userCredentials || null));
	  });
	};

	/**
	 * @param {string} stream
	 * @param {string} groupName
	 * @param {UserCredentials} [userCredentials]
	 * @returns {Promise.<PersistentSubscriptionDeleteResult>}
	 */
	EventStoreNodeConnection.prototype.deletePersistentSubscription = function(stream, groupName, userCredentials) {
	  ensure.notNullOrEmpty(stream, "stream");
	  ensure.notNullOrEmpty(groupName, "groupName");
	  var self = this;
	  return new Promise(function(resolve, reject) {
	    function cb(err, result) {
	      if (err) return reject(err);
	      resolve(result);
	    }
	    self._enqueueOperation(
	        new DeletePersistentSubscriptionOperation(self._settings.log, cb, stream, groupName, userCredentials || null));
	  });
	};

	EventStoreNodeConnection.prototype.setStreamMetadata = function() {
	  //TODO: set stream metadata (non-raw)
	  throw new Error("Not implemented.");
	};

	/**
	 * Set stream metadata with raw object (async)
	 * @param {string} stream
	 * @param {number} expectedMetastreamVersion
	 * @param {object} metadata
	 * @param {UserCredentials} [userCredentials]
	 * @returns {Promise.<WriteResult>}
	 */
	EventStoreNodeConnection.prototype.setStreamMetadataRaw = function(
	    stream, expectedMetastreamVersion, metadata, userCredentials
	) {
	  ensure.notNullOrEmpty(stream, "stream");
	  if (systemStreams.isMetastream(stream))
	    throw new Error(util.format("Setting metadata for metastream '%s' is not supported.", stream));
	  var self = this;
	  return new Promise(function(resolve, reject) {
	    function cb(err, result) {
	      if (err) return reject(err);
	      resolve(result);
	    }
	    var data = metadata ? new Buffer(JSON.stringify(metadata)) : null;
	    var metaevent = new EventData(uuid.v4(), systemEventTypes.StreamMetadata, true, data, null);
	    self._enqueueOperation(
	        new AppendToStreamOperation(self._settings.log, cb, self._settings.requireMaster,
	                                    systemStreams.metastreamOf(stream), expectedMetastreamVersion,
	                                    [metaevent], userCredentials));
	  });
	};

	EventStoreNodeConnection.prototype.getStreamMetadata = function(stream, userCredentials) {
	  //TODO: get stream metadata (non-raw)
	  throw new Error("Not implemented.");
	};

	/**
	 * Get stream metadata as raw object (async)
	 * @param {string} stream
	 * @param {UserCredentials} [userCredentials]
	 * @returns {Promise.<RawStreamMetadataResult>}
	 */
	EventStoreNodeConnection.prototype.getStreamMetadataRaw = function(stream, userCredentials) {
	  return this.readEvent(systemStreams.metastreamOf(stream), -1, false, userCredentials)
	      .then(function(res) {
	        switch(res.status) {
	          case results.EventReadStatus.Success:
	            if (res.event === null) throw new Error("Event is null while operation result is Success.");
	            var evnt = res.event.originalEvent;
	            var version = evnt ? evnt.eventNumber : -1;
	            var data = evnt ? JSON.parse(evnt.data.toString()) : null;
	            return new results.RawStreamMetadataResult(stream, false, version, data);
	          case results.EventReadStatus.NotFound:
	          case results.EventReadStatus.NoStream:
	            return new results.RawStreamMetadataResult(stream, false, -1, null);
	          case results.EventReadStatus.StreamDeleted:
	            return new results.RawStreamMetadataResult(stream, true, 0x7fffffff, null);
	          default:
	            throw new Error(util.format("Unexpected ReadEventResult: %s.", res.status));
	        }
	      });
	};

	EventStoreNodeConnection.prototype.setSystemSettings = function() {
	  //TODO: set system settings
	  throw new Error("Not implemented.");
	};

	EventStoreNodeConnection.prototype._enqueueOperation = function(operation) {
	  var self = this;
	  var message = new messages.StartOperationMessage(operation, self._settings.maxRetries, self._settings.operationTimeout);
	  function tryEnqueue() {
	    if (self._handler.totalOperationCount >= self._settings.maxQueueSize) {
	      setImmediate(tryEnqueue);
	      return;
	    }
	    self._handler.enqueueMessage(message);
	  }
	  setImmediate(tryEnqueue)
	};

	module.exports = EventStoreNodeConnection;


/***/ },
/* 9 */
/***/ function(module, exports) {

	module.exports = require("events");

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(4);
	var ensure = __webpack_require__(6);

	function Message() {
	}
	Message.prototype.toString = function() {
	  return this.constructor.name;
	};

	function StartConnectionMessage(cb, endpointDiscoverer) {
	  this.cb = cb;
	  this.endpointDiscoverer = endpointDiscoverer;
	}
	util.inherits(StartConnectionMessage, Message);

	function CloseConnectionMessage(reason, error) {
	  this.reason = reason;
	  this.error = error;
	}
	util.inherits(CloseConnectionMessage, Message);

	function StartOperationMessage(operation, maxRetries, timeout) {
	  this.operation = operation;
	  this.maxRetries = maxRetries;
	  this.timeout = timeout;
	}
	util.inherits(StartOperationMessage, Message);

	function StartSubscriptionMessage(
	    cb, streamId, resolveLinkTos, userCredentials, eventAppeared, subscriptionDropped, maxRetries, timeout
	) {
	  this.cb = cb;
	  this.streamId = streamId;
	  this.resolveLinkTos = resolveLinkTos;
	  this.userCredentials = userCredentials;
	  this.eventAppeared = eventAppeared;
	  this.subscriptionDropped = subscriptionDropped;
	  this.maxRetries = maxRetries;
	  this.timeout = timeout;
	}
	util.inherits(StartSubscriptionMessage, Message);

	/**
	 * @constructor
	 * @property {object} endPoints
	 * @property {object} endPoints.secureTcpEndPoint
	 * @property {object} endPoints.tcpEndPoint
	 */
	function EstablishTcpConnectionMessage(endPoints) {
	  this.endPoints = endPoints;
	}
	util.inherits(EstablishTcpConnectionMessage, Message);

	function HandleTcpPackageMessage(connection, pkg) {
	  this.connection = connection;
	  this.package = pkg;
	}
	util.inherits(HandleTcpPackageMessage, Message);

	function TcpConnectionErrorMessage(connection, error) {
	  this.connection = connection;
	  this.error = error;
	}
	util.inherits(TcpConnectionErrorMessage, Message);

	function TcpConnectionEstablishedMessage(connection) {
	  this.connection = connection;
	}
	util.inherits(TcpConnectionEstablishedMessage, Message);

	function TcpConnectionClosedMessage(connection, error) {
	  this.connection = connection;
	  this.error = error;
	}
	util.inherits(TcpConnectionClosedMessage, Message);

	function TimerTickMessage() {}
	util.inherits(TimerTickMessage, Message);

	function StartPersistentSubscriptionMessage(
	    cb, subscriptionId, streamId, bufferSize, userCredentials, eventAppeared, subscriptionDropped,
	    maxRetries, operationTimeout
	) {
	  this.cb = cb;
	  this.subscriptionId = subscriptionId;
	  this.streamId = streamId;
	  this.bufferSize = bufferSize;
	  this.userCredentials = userCredentials;
	  this.eventAppeared = eventAppeared;
	  this.subscriptionDropped = subscriptionDropped;
	  this.maxRetries = maxRetries;
	  this.timeout = operationTimeout;
	}
	util.inherits(StartPersistentSubscriptionMessage, Message);

	module.exports = {
	  StartConnectionMessage: StartConnectionMessage,
	  CloseConnectionMessage: CloseConnectionMessage,
	  StartOperationMessage: StartOperationMessage,
	  StartSubscriptionMessage: StartSubscriptionMessage,
	  EstablishTcpConnectionMessage: EstablishTcpConnectionMessage,
	  HandleTcpPackageMessage: HandleTcpPackageMessage,
	  TcpConnectionErrorMessage: TcpConnectionErrorMessage,
	  TcpConnectionEstablishedMessage: TcpConnectionEstablishedMessage,
	  TcpConnectionClosedMessage: TcpConnectionClosedMessage,
	  TimerTickMessage: TimerTickMessage,
	  StartPersistentSubscriptionMessage: StartPersistentSubscriptionMessage
	};


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(4);
	var uuid = __webpack_require__(2);
	var EventEmitter = __webpack_require__(9).EventEmitter;

	var SimpleQueuedHandler = __webpack_require__(12);
	var TcpPackageConnection = __webpack_require__(13);
	var OperationsManager = __webpack_require__(21);
	var SubscriptionsManager = __webpack_require__(23);
	var VolatileSubscriptionOperation = __webpack_require__(25);
	var ConnectToPersistentSubscriptionOperation = __webpack_require__(32);
	var messages = __webpack_require__(10);

	var TcpPackage = __webpack_require__(18);
	var TcpCommand = __webpack_require__(20);
	var TcpFlags = __webpack_require__(19);
	var InspectionDecision = __webpack_require__(27);

	const ConnectionState = {
	  Init: 'init',
	  Connecting: 'connecting',
	  Connected: 'connected',
	  Closed: 'closed'
	};

	const ConnectingPhase = {
	  Invalid: 'invalid',
	  Reconnecting: 'reconnecting',
	  EndPointDiscovery: 'endpointDiscovery',
	  ConnectionEstablishing: 'connectionEstablishing',
	  Authentication: 'authentication',
	  Connected: 'connected'
	};

	const TimerPeriod = 200;
	const TimerTickMessage = new messages.TimerTickMessage();
	const EmptyGuid = '00000000-0000-0000-0000-000000000000';

	/**
	 * @param {EventStoreNodeConnection} esConnection
	 * @param {Object} settings
	 * @constructor
	 * @property {Number} totalOperationCount
	 */
	function EventStoreConnectionLogicHandler(esConnection, settings) {
	  this._esConnection = esConnection;
	  this._settings = settings;
	  this._queue = new SimpleQueuedHandler();
	  this._state = ConnectionState.Init;
	  this._connectingPhase = ConnectingPhase.Invalid;
	  this._endpointDiscoverer = null;
	  this._connection = null;
	  this._wasConnected = false;
	  this._packageNumber = 0;
	  this._authInfo = null;
	  this._lastTimeoutsTimeStamp = 0;

	  this._operations = new OperationsManager(esConnection.connectionName, settings);
	  this._subscriptions = new SubscriptionsManager(esConnection.connectionName, settings);

	  var self = this;
	  this._queue.registerHandler(messages.StartConnectionMessage, function(msg) {
	    self._startConnection(msg.cb, msg.endpointDiscoverer);
	  });
	  this._queue.registerHandler(messages.CloseConnectionMessage, function(msg) {
	    self._closeConnection(msg.reason, msg.error);
	  });

	  this._queue.registerHandler(messages.StartOperationMessage, function(msg) {
	    self._startOperation(msg.operation, msg.maxRetries, msg.timeout);
	  });
	  this._queue.registerHandler(messages.StartSubscriptionMessage, function(msg) {
	    self._startSubscription(msg);
	  });
	  this._queue.registerHandler(messages.StartPersistentSubscriptionMessage, function(msg) {
	    self._startPersistentSubscription(msg);
	  });

	  this._queue.registerHandler(messages.EstablishTcpConnectionMessage, function(msg) {
	    self._establishTcpConnection(msg.endPoints);
	  });
	  this._queue.registerHandler(messages.TcpConnectionEstablishedMessage, function(msg) {
	    self._tcpConnectionEstablished(msg.connection);
	  });
	  this._queue.registerHandler(messages.TcpConnectionErrorMessage, function(msg) {
	    self._tcpConnectionError(msg.connection, msg.error);
	  });
	  this._queue.registerHandler(messages.TcpConnectionClosedMessage, function(msg) {
	    self._tcpConnectionClosed(msg.connection, msg.error);
	  });
	  this._queue.registerHandler(messages.HandleTcpPackageMessage, function(msg) {
	    self._handleTcpPackage(msg.connection, msg.package);
	  });

	  this._queue.registerHandler(messages.TimerTickMessage, function(msg) {
	    self._timerTick();
	  });

	  this._timer = setInterval(function() {
	    self.enqueueMessage(TimerTickMessage);
	  }, TimerPeriod);
	}
	util.inherits(EventStoreConnectionLogicHandler, EventEmitter);

	Object.defineProperty(EventStoreConnectionLogicHandler.prototype, 'totalOperationCount', {
	  get: function() {
	    return this._operations.totalOperationCount;
	  }
	});

	EventStoreConnectionLogicHandler.prototype.enqueueMessage = function(msg) {
	  if (this._settings.verboseLogging && msg !== TimerTickMessage) this._logDebug("enqueuing message %s.", msg);
	  this._queue.enqueueMessage(msg);
	};

	EventStoreConnectionLogicHandler.prototype._discoverEndpoint = function(cb) {
	  this._logDebug('DiscoverEndpoint');

	  if (this._state !== ConnectionState.Connecting) return;
	  if (this._connectingPhase !== ConnectingPhase.Reconnecting) return;

	  this._connectingPhase = ConnectingPhase.EndPointDiscovery;

	  cb = cb || function() {};

	  var self = this;
	  this._endpointDiscoverer.discover(this._connection !== null ? this._connection.remoteEndPoint : null)
	      .then(function(nodeEndpoints){
	        self.enqueueMessage(new messages.EstablishTcpConnectionMessage(nodeEndpoints));
	        cb();
	      })
	      .catch(function(err) {
	        self.enqueueMessage(new messages.CloseConnectionMessage("Failed to resolve TCP end point to which to connect.", err));
	        cb(new Error("Couldn't resolve target end point: " + err.message));
	      });
	};

	/**
	 * @param {Function} cb
	 * @param {StaticEndpointDiscoverer} endpointDiscoverer
	 * @private
	 */
	EventStoreConnectionLogicHandler.prototype._startConnection = function(cb, endpointDiscoverer) {
	  this._logDebug('StartConnection');

	  switch(this._state) {
	    case ConnectionState.Init:
	      this._endpointDiscoverer = endpointDiscoverer;
	      this._state = ConnectionState.Connecting;
	      this._connectingPhase = ConnectingPhase.Reconnecting;
	      this._discoverEndpoint(cb);
	      break;
	    case ConnectionState.Connecting:
	    case ConnectionState.Connected:
	      return cb(new Error(['EventStoreConnection', this._esConnection.connectionName, 'is already active.'].join(' ')));
	    case ConnectionState.Closed:
	      return cb(new Error(['EventStoreConnection', this._esConnection.connectionName, 'is closed.'].join(' ')));
	    default:
	      return cb(new Error(['Unknown state:', this._state].join(' ')));
	  }
	};

	/**
	 * @param {string} reason
	 * @param {Error} [error]
	 * @private
	 */
	EventStoreConnectionLogicHandler.prototype._closeConnection = function(reason, error) {
	  if (this._state == ConnectionState.Closed) {
	    this._logDebug("CloseConnection IGNORED because is ESConnection is CLOSED, reason %s, error %s.", reason, error ? error.stack : '');
	    return;
	  }

	  this._logDebug("CloseConnection, reason %s, error %s.", reason, error ? error.stack : '');

	  this._state = ConnectionState.Closed;

	  clearInterval(this._timer);
	  this._operations.cleanUp();
	  this._subscriptions.cleanUp();
	  this._closeTcpConnection(reason);

	  this._logInfo("Closed. Reason: %s", reason);

	  if (error)
	      this.emit('error', error);

	  this.emit('closed', reason);
	};

	EventStoreConnectionLogicHandler.prototype._closeTcpConnection = function(reason) {
	  if (!this._connection) {
	    this._logDebug("CloseTcpConnection IGNORED because _connection == null");
	    return;
	  }

	  this._logDebug("CloseTcpConnection");
	  this._connection.close(reason);
	  this._tcpConnectionClosed(this._connection);
	  this._connection = null;
	};

	var _nextSeqNo = -1;
	function createOperationItem(operation, maxRetries, timeout) {
	  var operationItem = {
	    seqNo: _nextSeqNo++,
	    operation: operation,
	    maxRetries: maxRetries,
	    timeout: timeout,
	    createdTime: Date.now(),
	    correlationId: uuid.v4(),
	    retryCount: 0,
	    lastUpdated: Date.now()
	  };
	  operationItem.toString = (function() {
	    return util.format("Operation %s (%s): %s, retry count: %d, created: %s, last updated: %s",
	                       this.operation.constructor.name, this.correlationId, this.operation, this.retryCount,
	                       new Date(this.createdTime).toISOString().substr(11,12),
	                       new Date(this.lastUpdated).toISOString().substr(11,12));
	  }).bind(operationItem);
	  return operationItem;
	}

	EventStoreConnectionLogicHandler.prototype._startOperation = function(operation, maxRetries, timeout) {
	  switch(this._state) {
	    case ConnectionState.Init:
	      operation.fail(new Error("EventStoreConnection '" + this._esConnection.connectionName + "' is not active."));
	      break;
	    case ConnectionState.Connecting:
	      this._logDebug("StartOperation enqueue %s, %s, %d, %d.", operation.constructor.name, operation, maxRetries, timeout);
	      this._operations.enqueueOperation(createOperationItem(operation, maxRetries, timeout));
	      break;
	    case ConnectionState.Connected:
	      this._logDebug("StartOperation schedule %s, %s, %d, %d.", operation.constructor.name, operation, maxRetries, timeout);
	      this._operations.scheduleOperation(createOperationItem(operation, maxRetries, timeout), this._connection);
	      break;
	    case ConnectionState.Closed:
	      operation.fail(new Error("EventStoreConnection '" + this._esConnection.connectionName + "' is closed."));
	      break;
	    default:
	      throw new Error("Unknown state: " + this._state + '.');
	  }
	};

	function createSubscriptionItem(operation, maxRetries, timeout) {
	  var subscriptionItem = {
	    operation: operation,
	    maxRetries: maxRetries,
	    timeout: timeout,
	    createdTime: Date.now(),
	    correlationId: uuid.v4(),
	    retryCount: 0,
	    lastUpdated: Date.now(),
	    isSubscribed: false
	  };
	  subscriptionItem.toString = (function(){
	    return util.format("Subscription %s (%s): %s, is subscribed: %s, retry count: %d, created: %s, last updated: %s",
	        this.operation.constructor.name, this.correlationId, this.operation, this.isSubscribed, this.retryCount,
	        new Date(this.createdTime).toISOString().substr(11,12),
	        new Date(this.lastUpdated).toISOString().substr(11,12));
	  }).bind(subscriptionItem);
	  return subscriptionItem;
	}

	EventStoreConnectionLogicHandler.prototype._startSubscription = function(msg) {
	  switch (this._state)
	  {
	    case ConnectionState.Init:
	      msg.cb(new Error(util.format("EventStoreConnection '%s' is not active.", this._esConnection.connectionName)));
	      break;
	    case ConnectionState.Connecting:
	    case ConnectionState.Connected:
	      var self = this;
	      var operation = new VolatileSubscriptionOperation(this._settings.log, msg.cb, msg.streamId, msg.resolveLinkTos,
	              msg.userCredentials, msg.eventAppeared, msg.subscriptionDropped,
	              this._settings.verboseLogging, function() { return self._connection });
	      this._logDebug("StartSubscription %s %s, %s, %d, %d.",
	          this._state === ConnectionState.Connected ? "fire" : "enqueue",
	          operation.constructor.name, operation, msg.maxRetries, msg.timeout);
	      var subscription = createSubscriptionItem(operation, msg.maxRetries, msg.timeout);
	      if (this._state === ConnectionState.Connecting)
	        this._subscriptions.enqueueSubscription(subscription);
	      else
	        this._subscriptions.startSubscription(subscription, this._connection);
	      break;
	    case ConnectionState.Closed:
	      msg.cb(new Error("Connection closed. Connection: " + this._esConnection.connectionName));
	      break;
	    default:
	      throw new Error(util.format("Unknown state: %s.", this._state));
	  }
	};

	EventStoreConnectionLogicHandler.prototype._startPersistentSubscription = function(msg) {
	  var self = this;
	  switch (this._state)
	  {
	    case ConnectionState.Init:
	      msg.cb(new Error(util.format("EventStoreConnection '%s' is not active.", this._esConnection.connectionName)));
	      break;
	    case ConnectionState.Connecting:
	    case ConnectionState.Connected:
	      var operation = new ConnectToPersistentSubscriptionOperation(this._settings.log, msg.cb, msg.subscriptionId,
	              msg.bufferSize, msg.streamId, msg.userCredentials, msg.eventAppeared, msg.subscriptionDropped,
	              this._settings.verboseLogging, function() { return self._connection });
	      this._logDebug("StartSubscription %s %s, %s, %d, %d.",
	          this._state === ConnectionState.Connected ? "fire" : "enqueue",
	          operation.constructor.name, operation, msg.maxRetries, msg.timeout);
	      var subscription = createSubscriptionItem(operation, msg.maxRetries, msg.timeout);
	      if (this._state === ConnectionState.Connecting)
	        this._subscriptions.enqueueSubscription(subscription);
	      else
	        this._subscriptions.startSubscription(subscription, this._connection);
	      break;
	    case ConnectionState.Closed:
	      msg.cb(new Error("Connection closed. " + this._esConnection.connectionName));
	      break;
	    default: throw new Error(util.format("Unknown state: %s.", this._state));
	  }
	};

	EventStoreConnectionLogicHandler.prototype._establishTcpConnection = function(endPoints) {
	  var endPoint = this._settings.useSslConnection ? endPoints.secureTcpEndPoint : endPoints.tcpEndPoint;
	  if (endPoint == null)
	  {
	    this._closeConnection("No end point to node specified.");
	    return;
	  }

	  this._logDebug("EstablishTcpConnection to [%j]", endPoint);

	  if (this._state != ConnectionState.Connecting) return;
	  if (this._connectingPhase != ConnectingPhase.EndPointDiscovery) return;

	  var self = this;
	  this._connectingPhase = ConnectingPhase.ConnectionEstablishing;
	  this._connection = new TcpPackageConnection(
	          this._settings.log,
	          endPoint,
	          uuid.v4(),
	          this._settings.useSslConnection,
	          this._settings.targetHost,
	          this._settings.validateServer,
	          this._settings.clientConnectionTimeout,
	          function(connection, pkg) {
	            self.enqueueMessage(new messages.HandleTcpPackageMessage(connection, pkg));
	          },
	          function(connection, error) {
	            self.enqueueMessage(new messages.TcpConnectionErrorMessage(connection, error));
	          },
	          function(connection) {
	            connection.startReceiving();
	            self.enqueueMessage(new messages.TcpConnectionEstablishedMessage(connection));
	          },
	          function(connection, error) {
	            self.enqueueMessage(new messages.TcpConnectionClosedMessage(connection, error));
	          }
	      );
	};

	EventStoreConnectionLogicHandler.prototype._tcpConnectionEstablished = function(connection) {
	  if (this._state != ConnectionState.Connecting || !this._connection.equals(connection) || connection.isClosed)
	  {
	    this._logDebug("IGNORED (_state %s, _conn.Id %s, conn.Id %s, conn.closed %s): TCP connection to [%j, L%j] established.",
	        this._state, this._connection == null ? EmptyGuid : this._connection.connectionId, connection.connectionId,
	        connection.isClosed, connection.remoteEndPoint, connection.localEndPoint);
	    return;
	  }

	  this._logDebug("TCP connection to [%j, L%j, %s] established.", connection.remoteEndPoint, connection.localEndPoint, connection.connectionId);
	  this._heartbeatInfo = {
	    lastPackageNumber: this._packageNumber,
	    isIntervalStage: true,
	    timeStamp: Date.now()
	  };

	  if (this._settings.defaultUserCredentials != null)
	  {
	    this._connectingPhase = ConnectingPhase.Authentication;

	    this._authInfo = {
	      correlationId: uuid.v4(),
	      timeStamp: Date.now()
	    };
	    this._connection.enqueueSend(new TcpPackage(
	      TcpCommand.Authenticate,
	      TcpFlags.Authenticated,
	      this._authInfo.correlationId,
	      this._settings.defaultUserCredentials.username,
	      this._settings.defaultUserCredentials.password));
	  }
	  else
	  {
	    this._goToConnectedState();
	  }
	};

	EventStoreConnectionLogicHandler.prototype._goToConnectedState = function() {
	  this._state = ConnectionState.Connected;
	  this._connectingPhase = ConnectingPhase.Connected;

	  this._wasConnected = true;

	  this.emit('connected', this._connection.remoteEndPoint);

	  if (Date.now() - this._lastTimeoutsTimeStamp >= this._settings.operationTimeoutCheckPeriod)
	  {
	    this._operations.checkTimeoutsAndRetry(this._connection);
	    this._subscriptions.checkTimeoutsAndRetry(this._connection);
	    this._lastTimeoutsTimeStamp = Date.now();
	  }
	};

	EventStoreConnectionLogicHandler.prototype._tcpConnectionError = function(connection, error) {
	  if (this._connection != connection) return;
	  if (this._state == ConnectionState.Closed) return;

	  this._logDebug("TcpConnectionError connId %s, exc %s.", connection.connectionId, error);
	  this._closeConnection("TCP connection error occurred.", error);
	};

	EventStoreConnectionLogicHandler.prototype._tcpConnectionClosed = function(connection, error) {
	  if (this._state == ConnectionState.Init) throw new Error();
	  if (this._state == ConnectionState.Closed || !this._connection.equals(connection))
	  {
	    this._logDebug("IGNORED (_state: %s, _conn.ID: %s, conn.ID: %s): TCP connection to [%j, L%j] closed.",
	        this._state, this._connection == null ? EmptyGuid : this._connection.connectionId,  connection.connectionId,
	        connection.remoteEndPoint, connection.localEndPoint);
	    return;
	  }

	  this._state = ConnectionState.Connecting;
	  this._connectingPhase = ConnectingPhase.Reconnecting;

	  this._logDebug("TCP connection to [%j, L%j, %s] closed. %s", connection.remoteEndPoint, connection.localEndPoint, connection.connectionId, error);

	  this._subscriptions.purgeSubscribedAndDroppedSubscriptions(this._connection.connectionId);
	  this._reconnInfo = {
	    reconnectionAttempt: this._reconnInfo ? this._reconnInfo.reconnectionAttempt : 0,
	    timeStamp: Date.now()
	  };

	  if (this._wasConnected)
	  {
	    this._wasConnected = false;
	    this.emit('disconnected', connection.remoteEndPoint);
	  }
	};

	EventStoreConnectionLogicHandler.prototype._handleTcpPackage = function(connection, pkg) {
	  if (!connection.equals(this._connection) || this._state == ConnectionState.Closed || this._state == ConnectionState.Init)
	  {
	    this._logDebug("IGNORED: HandleTcpPackage connId %s, package %s, %s.",
	                   connection.connectionId, TcpCommand.getName(pkg.command), pkg.correlationId);
	    return;
	  }

	  this._logDebug("HandleTcpPackage connId %s, package %s, %s.",
	                 this._connection.connectionId, TcpCommand.getName(pkg.command), pkg.correlationId);
	  this._packageNumber += 1;

	  if (pkg.command == TcpCommand.HeartbeatResponseCommand)
	    return;
	  if (pkg.command == TcpCommand.HeartbeatRequestCommand)
	  {
	    this._connection.enqueueSend(new TcpPackage(
	      TcpCommand.HeartbeatResponseCommand,
	      TcpFlags.None,
	      pkg.correlationId));
	    return;
	  }

	  if (pkg.command == TcpCommand.Authenticated || pkg.command == TcpCommand.NotAuthenticated)
	  {
	    if (this._state == ConnectionState.Connecting
	        && this._connectingPhase == ConnectingPhase.Authentication
	        && this._authInfo.correlationId == pkg.correlationId)
	    {
	      if (pkg.command == TcpCommand.NotAuthenticated)
	        this.emit('authenticationFailed', "Not authenticated");

	      this._goToConnectedState();
	      return;
	    }
	  }

	  if (pkg.command == TcpCommand.BadRequest && pkg.correlationId == EmptyGuid)
	  {
	    var message = "<no message>";
	    try {
	      message = pkg.data.toString();
	    } catch(e) {}
	    var err = new Error("Bad request received from server. Error: " + message);
	    this._closeConnection("Connection-wide BadRequest received. Too dangerous to continue.", err);
	    return;
	  }

	  var operation = this._operations.getActiveOperation(pkg.correlationId);
	  if (operation)
	  {
	    var result = operation.operation.inspectPackage(pkg);
	    this._logDebug("HandleTcpPackage OPERATION DECISION %s (%s), %s", result.decision, result.description, operation.operation);
	    switch (result.decision)
	    {
	      case InspectionDecision.DoNothing: break;
	      case InspectionDecision.EndOperation:
	        this._operations.removeOperation(operation);
	        break;
	      case InspectionDecision.Retry:
	        this._operations.scheduleOperationRetry(operation);
	        break;
	      case InspectionDecision.Reconnect:
	        this._reconnectTo({tcpEndPoint: result.tcpEndPoint, secureTcpEndPoint: result.secureTcpEndPoint});
	        this._operations.scheduleOperationRetry(operation);
	        break;
	      default:
	        throw new Error("Unknown InspectionDecision: " + result.decision);
	    }
	    if (this._state == ConnectionState.Connected)
	      this._operations.scheduleWaitingOperations(connection);

	    return;
	  }

	  var subscription = this._subscriptions.getActiveSubscription(pkg.correlationId);
	  if (subscription)
	  {
	    var result = subscription.operation.inspectPackage(pkg);
	    this._logDebug("HandleTcpPackage SUBSCRIPTION DECISION %s (%s), %s", result.decision, result.description, subscription);
	    switch (result.decision)
	    {
	      case InspectionDecision.DoNothing: break;
	      case InspectionDecision.EndOperation:
	        this._subscriptions.removeSubscription(subscription);
	        break;
	      case InspectionDecision.Retry:
	        this._subscriptions.scheduleSubscriptionRetry(subscription);
	        break;
	      case InspectionDecision.Reconnect:
	        this._reconnectTo({tcpEndPoint: result.tcpEndPoint, secureTcpEndPoint: result.secureTcpEndPoint});
	        this._subscriptions.scheduleSubscriptionRetry(subscription);
	        break;
	      case InspectionDecision.Subscribed:
	        subscription.isSubscribed = true;
	        break;
	      default:
	        throw new Error("Unknown InspectionDecision: " + result.decision);
	    }

	    return;
	  }

	  this._logDebug("HandleTcpPackage UNMAPPED PACKAGE with CorrelationId %s, Command: %s",
	                 pkg.correlationId, TcpCommand.getName(pkg.command));
	};

	EventStoreConnectionLogicHandler.prototype._reconnectTo = function(endPoints) {
	  var endPoint = this._settings.useSslConnection
	      ? endPoints.secureTcpEndPoint
	      : endPoints.tcpEndPoint;
	  if (endPoint == null)
	  {
	    this._closeConnection("No end point is specified while trying to reconnect.");
	    return;
	  }

	  if (this._state != ConnectionState.Connected || this._connection.remoteEndPoint == endPoint)
	    return;

	  var msg = util.format("EventStoreConnection '%s': going to reconnect to [%j]. Current endpoint: [%j, L%j].",
	      this._esConnection.connectionName, endPoint, this._connection.remoteEndPoint, this._connection.localEndPoint);
	  if (this._settings.verboseLogging) this._settings.log.info(msg);
	  this._closeTcpConnection(msg);

	  this._state = ConnectionState.Connecting;
	  this._connectingPhase = ConnectingPhase.EndPointDiscovery;
	  this._establishTcpConnection(endPoints);
	};

	EventStoreConnectionLogicHandler.prototype._timerTick = function() {
	  switch (this._state)
	  {
	    case ConnectionState.Init: break;
	    case ConnectionState.Connecting:
	      if (this._connectingPhase == ConnectingPhase.Reconnecting && Date.now() - this._reconnInfo.timeStamp >= this._settings.reconnectionDelay)
	      {
	        this._logDebug("TimerTick checking reconnection...");

	        this._reconnInfo = {reconnectionAttempt: this._reconnInfo.reconnectionAttempt + 1, timeStamp: Date.now()};
	        if (this._settings.maxReconnections >= 0 && this._reconnInfo.reconnectionAttempt > this._settings.maxReconnections)
	          this._closeConnection("Reconnection limit reached.");
	        else
	        {
	          this.emit('reconnecting', {});
	          this._discoverEndpoint(null);
	        }
	      }
	      else if (this._connectingPhase == ConnectingPhase.Authentication && Date.now() - this._authInfo.timeStamp >= this._settings.operationTimeout)
	      {
	        this.emit('authenticationFailed', "Authentication timed out.");
	        this._goToConnectedState();
	      }
	      else if (this._connectingPhase > ConnectingPhase.ConnectionEstablishing)
	        this._manageHeartbeats();
	      break;
	    case ConnectionState.Connected:
	      // operations timeouts are checked only if connection is established and check period time passed
	      if (Date.now() - this._lastTimeoutsTimeStamp >= this._settings.operationTimeoutCheckPeriod)
	      {
	        // On mono even impossible connection first says that it is established
	        // so clearing of reconnection count on ConnectionEstablished event causes infinite reconnections.
	        // So we reset reconnection count to zero on each timeout check period when connection is established
	        this._reconnInfo = {reconnectionAttempt: 0, timeStamp: Date.now()};
	        this._operations.checkTimeoutsAndRetry(this._connection);
	        this._subscriptions.checkTimeoutsAndRetry(this._connection);
	        this._lastTimeoutsTimeStamp = Date.now();
	      }
	      this._manageHeartbeats();
	      break;
	    case ConnectionState.Closed:
	      break;
	    default:
	      throw new Error("Unknown state: " + this._state + ".");
	  }
	};

	EventStoreConnectionLogicHandler.prototype._manageHeartbeats = function() {
		if (this._connection == null) {
	      return;
	  }

	  var timeout = this._heartbeatInfo.isIntervalStage ? this._settings.heartbeatInterval : this._settings.heartbeatTimeout;
	  if (Date.now() - this._heartbeatInfo.timeStamp < timeout)
	    return;

	  var packageNumber = this._packageNumber;
	  if (this._heartbeatInfo.lastPackageNumber != packageNumber)
	  {
	    this._heartbeatInfo = {lastPackageNumber: packageNumber, isIntervalStage: true, timeStamp: Date.now()};
	    return;
	  }

	  if (this._heartbeatInfo.isIntervalStage)
	  {
	    // TcpMessage.Heartbeat analog
	    this._connection.enqueueSend(new TcpPackage(
	      TcpCommand.HeartbeatRequestCommand,
	      TcpFlags.None,
	      uuid.v4()));
	    this._heartbeatInfo = {lastPackageNumber: this._heartbeatInfo.lastPackageNumber, isIntervalStage: false, timeStamp: Date.now()};
	  }
	  else
	  {
	    // TcpMessage.HeartbeatTimeout analog
	    var msg = util.format("EventStoreConnection '%s': closing TCP connection [%j, L%j, %s] due to HEARTBEAT TIMEOUT at pkgNum %d.",
	        this._esConnection.connectionName, this._connection.remoteEndPoint, this._connection.localEndPoint,
	        this._connection.connectionId, packageNumber);
	    this._settings.log.info(msg);
	    this._closeTcpConnection(msg);
	  }
	};

	EventStoreConnectionLogicHandler.prototype._logDebug = function(message) {
	  if (!this._settings.verboseLogging) return;

	  if (arguments.length > 1)
	      message = util.format.apply(util, Array.prototype.slice.call(arguments));

	  this._settings.log.debug("EventStoreConnection '%s': %s", this._esConnection.connectionName, message);
	};

	EventStoreConnectionLogicHandler.prototype._logInfo = function(message){
	  if (arguments.length > 1)
	    message = util.format.apply(util, Array.prototype.slice.call(arguments));

	  this._settings.log.info("EventStoreConnection '%s': %s", this._esConnection.connectionName, message);
	};

	module.exports = EventStoreConnectionLogicHandler;

/***/ },
/* 12 */
/***/ function(module, exports) {

	function typeName(t) {
	  if (typeof t === 'function')
	    return t.name;
	  if (typeof t === 'object')
	    return t.constructor.name;
	  throw new TypeError('type must be a function or object, not ' + typeof t);
	}

	function SimpleQueuedHandler() {
	  this._handlers = {};
	  this._messages = [];
	  this._isProcessing = false;
	}

	SimpleQueuedHandler.prototype.registerHandler = function(type, handler) {
	  type = typeName(type);
	  this._handlers[type] = handler;
	};

	SimpleQueuedHandler.prototype.enqueueMessage = function(msg) {
	  this._messages.push(msg);
	  if (!this._isProcessing) {
	    this._isProcessing = true;
	    setImmediate(this._processQueue.bind(this));
	  }
	};

	SimpleQueuedHandler.prototype._processQueue = function() {
	  var message = this._messages.shift();
	  while(message) {
	    var type = typeName(message);
	    var handler = this._handlers[type];
	    if (!handler)
	        throw new Error("No handler registered for message " + type);
	    setImmediate(handler, message);
	    message = this._messages.shift();
	  }
	  this._isProcessing = false;
	};

	module.exports = SimpleQueuedHandler;

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(4);
	var uuid = __webpack_require__(2);

	var LengthPrefixMessageFramer = __webpack_require__(14);
	var TcpConnection = __webpack_require__(16);
	var TcpPackage = __webpack_require__(18);
	var TcpCommand = __webpack_require__(20);

	/**
	 * @param log
	 * @param remoteEndPoint
	 * @param connectionId
	 * @param ssl
	 * @param targetHost
	 * @param validateServer
	 * @param timeout
	 * @param handlePackage
	 * @param onError
	 * @param connectionEstablished
	 * @param connectionClosed
	 * @constructor
	 * @property {string} connectionId
	 * @property {boolean} isClosed
	 * @property {object} remoteEndPoint
	 * @property {object} localEndPoint
	 */
	function TcpPackageConnection(
	    log, remoteEndPoint, connectionId, ssl, targetHost, validateServer, timeout,
	    handlePackage, onError, connectionEstablished, connectionClosed)
	{
	  this._connectionId = connectionId;
	  this._log = log;
	  this._handlePackage = handlePackage;
	  this._onError = onError;

	  //Setup callback for incoming messages
	  this._framer = new LengthPrefixMessageFramer();
	  this._framer.registerMessageArrivedCallback(this._incomingMessageArrived.bind(this));

	  //TODO ssl
	  var self = this;
	  this._connection = TcpConnection.createConnectingConnection(
	      log,
	      connectionId,
	      remoteEndPoint,
	      //ssl,
	      //targetHost,
	      //validateServer,
	      timeout,
	      function(tcpConnection) {
	        log.debug("TcpPackageConnection: connected to [%j, L%j, %s].", tcpConnection.remoteEndPoint, tcpConnection.localEndPoint, connectionId);
	        connectionEstablished(self);
	      },
	      function(conn, error) {
	        log.debug("TcpPackageConnection: connection to [%j, L%j, %s] failed. Error: %s.", conn.remoteEndPoint, conn.localEndPoint, connectionId, error);
	        connectionClosed(self, error);
	      },
	      function (conn, had_error) {
	        var error;
	        if (had_error)
	            error = new Error('transmission error.');

	        log.debug("TcpPackageConnection: connection [%j, L%j, %s] was closed %s", conn.remoteEndPoint, conn.localEndPoint,
	            connectionId, had_error ? "with error: " + error + "." : "cleanly.");

	        connectionClosed(self, error);
	      });
	}
	Object.defineProperty(TcpPackageConnection.prototype, 'connectionId', {
	  enumerable: true,
	  get: function() {
	    return this._connectionId;
	  }
	});
	Object.defineProperty(TcpPackageConnection.prototype, 'isClosed', {
	  enumerable: true,
	  get: function() {
	    return this._connection.isClosed;
	  }
	});
	Object.defineProperty(TcpPackageConnection.prototype, 'remoteEndPoint', {
	  enumerable: true,
	  get: function() {
	    return this._connection.remoteEndPoint;
	  }
	});
	Object.defineProperty(TcpPackageConnection.prototype, 'localEndPoint', {
	  enumerable: true,
	  get: function() {
	    return this._connection.localEndPoint;
	  }
	});

	TcpPackageConnection.prototype._onRawDataReceived = function(connection, data) {
	  try {
	    this._framer.unframeData(data);
	  } catch(e) {
	    this._log.error(e, "TcpPackageConnection: [%j, L%j, %s]. Invalid TCP frame received.", this.remoteEndPoint, this.localEndPoint, this._connectionId);
	    this.close("Invalid TCP frame received");
	    return;
	  }

	  connection.receive(this._onRawDataReceived.bind(this));
	};

	TcpPackageConnection.prototype._incomingMessageArrived = function(data) {
	  var valid = false;
	  var pkg;
	  try
	  {
	    pkg = TcpPackage.fromBufferSegment(data);
	    valid = true;
	    this._handlePackage(this, pkg);
	  }
	  catch (e)
	  {
	    this._connection.close(util.format("Error when processing TcpPackage %s: %s",
	        valid ? TcpCommand.getName(pkg.command) : "<invalid package>", e.message));

	    var message = util.format("TcpPackageConnection: [%j, L%j, %s] ERROR for %s. Connection will be closed.",
	        this.remoteEndPoint, this.localEndPoint, this._connectionId,
	        valid ? TcpCommand.getName(pkg.command) : "<invalid package>");
	    if (this._onError != null)
	      this._onError(this, e);
	    this._log.debug(e, message);
	  }
	};

	TcpPackageConnection.prototype.startReceiving = function() {
	  if (this._connection == null)
	    throw new Error("Failed connection.");
	  this._connection.receive(this._onRawDataReceived.bind(this));
	};

	TcpPackageConnection.prototype.enqueueSend = function(pkg) {
	  if (this._connection == null)
	    throw new Error("Failed connection.");
	  this._connection.enqueueSend(this._framer.frameData(pkg.asBufferSegment()));
	};

	TcpPackageConnection.prototype.close = function(reason) {
	  if (this._connection == null)
	    throw new Error("Failed connection.");
	  this._connection.close(reason);
	};

	TcpPackageConnection.prototype.equals = function(other) {
	  if (other === null) return false;
	  return this._connectionId === other._connectionId;
	};


	module.exports = TcpPackageConnection;

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	var createBufferSegment = __webpack_require__(15);

	const HeaderLength = 4;

	function LengthPrefixMessageFramer(maxPackageSize) {
	  this._maxPackageSize = maxPackageSize || 64*1024*1024;
	  this._receivedHandler = null;
	  this.reset();
	}

	LengthPrefixMessageFramer.prototype.reset = function() {
	  this._messageBuffer = null;
	  this._headerBytes = 0;
	  this._packageLength = 0;
	  this._bufferIndex = 0;
	};

	LengthPrefixMessageFramer.prototype.unframeData = function(bufferSegments) {
	  for(var i = 0; i < bufferSegments.length; i++) {
	    this._parse(bufferSegments[i]);
	  }
	};

	LengthPrefixMessageFramer.prototype._parse = function(bytes) {
	  var buffer = bytes.buffer;
	  for (var i = bytes.offset; i < bytes.offset + bytes.count; i++)
	  {
	    if (this._headerBytes < HeaderLength)
	    {
	      this._packageLength |= (buffer[i] << (this._headerBytes * 8)); // little-endian order
	      ++this._headerBytes;
	      if (this._headerBytes == HeaderLength)
	      {
	        if (this._packageLength <= 0 || this._packageLength > this._maxPackageSize)
	          throw new Error(["Package size is out of bounds: ", this._packageLength, "(max: ", this._maxPackageSize, "."].join(''));

	        this._messageBuffer = new Buffer(this._packageLength);
	      }
	    }
	    else
	    {
	      var copyCnt = Math.min(bytes.count + bytes.offset - i, this._packageLength - this._bufferIndex);
	      bytes.buffer.copy(this._messageBuffer, this._bufferIndex, i, i + copyCnt);
	      this._bufferIndex += copyCnt;
	      i += copyCnt - 1;

	      if (this._bufferIndex == this._packageLength)
	      {
	        if (this._receivedHandler != null)
	          this._receivedHandler(createBufferSegment(this._messageBuffer, 0, this._bufferIndex));
	        this.reset();
	      }
	    }
	  }
	};

	LengthPrefixMessageFramer.prototype.frameData = function(data) {
	  var length = data.count;
	  var lengthBuffer = new Buffer(HeaderLength);
	  lengthBuffer.writeInt32LE(length, 0);
	  return [
	    createBufferSegment(lengthBuffer, 0, HeaderLength),
	    data
	  ];
	};

	LengthPrefixMessageFramer.prototype.registerMessageArrivedCallback = function(handler) {
	  this._receivedHandler = handler;
	};


	module.exports = LengthPrefixMessageFramer;


/***/ },
/* 15 */
/***/ function(module, exports) {

	/**
	 * Create a buffer segment
	 * @param {Buffer} buf
	 * @param {number} [offset]
	 * @param {number} [count]
	 * @constructor
	 */
	function BufferSegment(buf, offset, count) {
	  if (!Buffer.isBuffer(buf)) throw new TypeError('buf must be a buffer');

	  this.buffer = buf;
	  this.offset = offset || 0;
	  this.count = count || buf.length;
	}

	BufferSegment.prototype.toString = function() {
	  return this.buffer.toString('utf8', this.offset, this.offset + this.count);
	};

	BufferSegment.prototype.toBuffer = function() {
	  if (this.offset === 0 && this.count === this.buffer.length)
	      return this.buffer;
	  return this.buffer.slice(this.offset, this.offset + this.count);
	};

	BufferSegment.prototype.copyTo = function(dst, offset) {
	  this.buffer.copy(dst, offset, this.offset, this.offset + this.count);
	};

	module.exports = function(buf, offset, count) {
	  return new BufferSegment(buf, offset, count);
	};

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	var net = __webpack_require__(17);
	var createBufferSegment = __webpack_require__(15);

	const MaxSendPacketSize = 64 * 1000;

	function TcpConnection(log, connectionId, remoteEndPoint, onConnectionClosed) {
	  this._socket = null;
	  this._log = log;
	  this._connectionId = connectionId;
	  this._remoteEndPoint = remoteEndPoint;
	  this._localEndPoint = null;
	  this._onConnectionClosed = onConnectionClosed;
	  this._receiveCallback = null;
	  this._closed = false;
	  this._sendQueue = [];
	  this._receiveQueue = [];

	  Object.defineProperty(this, 'remoteEndPoint', {
	    enumerable: true,
	    get: function() {
	      return this._remoteEndPoint;
	    }
	  });
	  Object.defineProperty(this, 'localEndPoint', {
	    enumerable: true,
	    get: function() {
	      return this._localEndPoint;
	    }
	  });
	}

	TcpConnection.prototype._initSocket = function(socket) {
	  this._socket = socket;
	  this._localEndPoint = {host: socket.localAddress, port: socket.localPort};

	  this._socket.on('error', this._processError.bind(this));
	  this._socket.on('data', this._processReceive.bind(this));
	};

	TcpConnection.prototype.enqueueSend = function(bufSegmentArray) {
	  //console.log(bufSegmentArray);

	  for(var i = 0; i < bufSegmentArray.length; i++) {
	    var bufSegment = bufSegmentArray[i];
	    this._sendQueue.push(bufSegment.toBuffer());
	  }

	  this._trySend();
	};

	TcpConnection.prototype._trySend = function() {
	  if (this._sendQueue.length === 0 || this._socket === null) return;

	  var buffers = [];
	  var bytes = 0;
	  var sendPiece = this._sendQueue.shift();
	  while(sendPiece) {
	    if (bytes + sendPiece.length > MaxSendPacketSize)
	        break;

	    buffers.push(sendPiece);
	    bytes += sendPiece.length;

	    sendPiece = this._sendQueue.shift();
	  }

	  var joinedBuffers = Buffer.concat(buffers, bytes);
	  this._socket.write(joinedBuffers);
	};

	TcpConnection.prototype._processError = function(err) {
	  this._closeInternal(err, "Socket error");
	};

	TcpConnection.prototype._processReceive = function(buf) {
	  if (buf.length === 0) {
	    //NotifyReceiveCompleted(0);
	    this._closeInternal(null, "Socket closed");
	    return;
	  }

	  //NotifyReceiveCompleted(buf.length)
	  this._receiveQueue.push(buf);

	  this._tryDequeueReceivedData();
	};

	TcpConnection.prototype.receive = function(cb) {
	  this._receiveCallback = cb;
	  this._tryDequeueReceivedData();
	};

	TcpConnection.prototype._tryDequeueReceivedData = function() {
	  if (this._receiveCallback === null || this._receiveQueue.length === 0)
	      return;

	  var res = [];
	  while(this._receiveQueue.length > 0) {
	    var buf = this._receiveQueue.shift();
	    var bufferSegment = createBufferSegment(buf);
	    res.push(bufferSegment);
	  }
	  var callback = this._receiveCallback;
	  this._receiveCallback = null;

	  callback(this, res);

	  var bytes = 0;
	  for(var i=0;i<res.length;i++)
	    bytes += res[i].count;

	  //this._pendingReceivedBytes -= bytes;
	};

	TcpConnection.prototype.close = function(reason) {
	  this._closeInternal(null, reason || "Normal socket close.");
	};

	TcpConnection.prototype._closeInternal = function(err, reason) {
	  if (this._closed) return;
	  this._closed = true;

	  if (this._socket != null) {
	    this._socket.end();
	    this._socket.unref();
	    this._socket = null;
	  }

	  if (this._onConnectionClosed != null)
	      this._onConnectionClosed(this, err);
	};

	TcpConnection.createConnectingConnection = function(
	    log, connectionId, remoteEndPoint, connectionTimeout,
	    onConnectionEstablished, onConnectionFailed, onConnectionClosed
	) {
	  var connection = new TcpConnection(log, connectionId, remoteEndPoint, onConnectionClosed);
	  var socket = net.connect(remoteEndPoint);
	  function onError(err) {
	    if (onConnectionFailed)
	      onConnectionFailed(connection, err);
	  }
	  socket.once('error', onError);
	  socket.on('connect', function() {
	    socket.removeListener('error', onError);
	    connection._initSocket(socket);
	    if (onConnectionEstablished)
	      onConnectionEstablished(connection);
	  });
	  return connection;
	};

	module.exports = TcpConnection;

/***/ },
/* 17 */
/***/ function(module, exports) {

	module.exports = require("net");

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	var uuid = __webpack_require__(2);

	var createBufferSegment = __webpack_require__(15);
	var TcpFlags = __webpack_require__(19);

	const CommandOffset = 0;
	const FlagsOffset = CommandOffset + 1;
	const CorrelationOffset = FlagsOffset + 1;
	const AuthOffset = CorrelationOffset + 16;
	const MandatorySize = AuthOffset;

	function TcpPackage(command, flags, correlationId, login, password, data) {
	  this.command = command;
	  this.flags = flags;
	  this.correlationId = correlationId;
	  this.login = login || null;
	  this.password = password || null;
	  this.data = data || null;
	}

	TcpPackage.fromBufferSegment = function(data) {
	  if (data.length < MandatorySize)
	    throw new Error("ArraySegment too short, length: " + data.length);

	  var command = data.buffer[data.offset + CommandOffset];
	  var flags = data.buffer[data.offset + FlagsOffset];

	  var correlationId = uuid.unparse(data.buffer, data.offset + CorrelationOffset);

	  var headerSize = MandatorySize;
	  var login = null, pass = null;
	  if ((flags & TcpFlags.Authenticated) != 0)
	  {
	    var loginLen = data.buffer[data.offset + AuthOffset];
	    if (AuthOffset + 1 + loginLen + 1 >= data.count)
	        throw new Error("Login length is too big, it doesn't fit into TcpPackage.");
	    login = data.buffer.toString('utf8', data.offset + AuthOffset + 1, data.offset + AuthOffset + 1 + loginLen);

	    var passLen = data.buffer[data.offset + AuthOffset + 1 + loginLen];
	    if (AuthOffset + 1 + loginLen + 1 + passLen > data.count)
	        throw new Error("Password length is too big, it doesn't fit into TcpPackage.");
	    headerSize += 1 + loginLen + 1 + passLen;
	    pass = data.buffer.toString('utf8', data.offset + AuthOffset + 1 + loginLen + 1, data.offset + headerSize);
	  }
	  return new TcpPackage(
	      command, flags, correlationId, login, pass,
	      createBufferSegment(data.buffer, data.offset + headerSize, data.count - headerSize));
	};

	TcpPackage.prototype.asBuffer = function() {
	  if ((this.flags & TcpFlags.Authenticated) != 0) {
	    var loginBytes = new Buffer(this.login);
	    if (loginBytes.length > 255) throw new Error("Login serialized length should be less than 256 bytes.");
	    var passwordBytes = new Buffer(this.password);
	    if (passwordBytes.length > 255) throw new Error("Password serialized length should be less than 256 bytes.");

	    var res = new Buffer(MandatorySize + 2 + loginBytes.length + passwordBytes.length + (this.data ? this.data.count : 0));
	    res[CommandOffset] = this.command;
	    res[FlagsOffset] = this.flags;
	    uuid.parse(this.correlationId, res, CorrelationOffset);

	    res[AuthOffset] = loginBytes.length;
	    loginBytes.copy(res, AuthOffset + 1);
	    res[AuthOffset + 1 + loginBytes.length] = passwordBytes.length;
	    passwordBytes.copy(res, AuthOffset + 2 + loginBytes.length);

	    if (this.data)
	      this.data.copyTo(res, res.length - this.data.count);

	    return res;
	  } else {
	    var res = new Buffer(MandatorySize + (this.data ? this.data.count : 0));
	    res[CommandOffset] = this.command;
	    res[FlagsOffset] = this.flags;
	    uuid.parse(this.correlationId, res, CorrelationOffset);
	    if (this.data)
	      this.data.copyTo(res, AuthOffset);
	    return res;
	  }
	};

	TcpPackage.prototype.asBufferSegment = function() {
	  return createBufferSegment(this.asBuffer());
	};

	module.exports = TcpPackage;

/***/ },
/* 19 */
/***/ function(module, exports) {

	const TcpFlags = {
	  None: 0x0,
	  Authenticated: 0x01
	};

	module.exports = TcpFlags;


/***/ },
/* 20 */
/***/ function(module, exports) {

	const TcpCommand = {
	  HeartbeatRequestCommand: 0x01,
	  HeartbeatResponseCommand: 0x02,

	  Ping: 0x03,
	  Pong: 0x04,

	  PrepareAck: 0x05,
	  CommitAck: 0x06,

	  SlaveAssignment: 0x07,
	  CloneAssignment: 0x08,

	  SubscribeReplica: 0x10,
	  ReplicaLogPositionAck: 0x11,
	  CreateChunk: 0x12,
	  RawChunkBulk: 0x13,
	  DataChunkBulk: 0x14,
	  ReplicaSubscriptionRetry: 0x15,
	  ReplicaSubscribed: 0x16,

	  // CLIENT COMMANDS
	  //        CreateStream: 0x80,
	  //        CreateStreamCompleted: 0x81,

	  WriteEvents: 0x82,
	  WriteEventsCompleted: 0x83,

	  TransactionStart: 0x84,
	  TransactionStartCompleted: 0x85,
	  TransactionWrite: 0x86,
	  TransactionWriteCompleted: 0x87,
	  TransactionCommit: 0x88,
	  TransactionCommitCompleted: 0x89,

	  DeleteStream: 0x8A,
	  DeleteStreamCompleted: 0x8B,

	  ReadEvent: 0xB0,
	  ReadEventCompleted: 0xB1,
	  ReadStreamEventsForward: 0xB2,
	  ReadStreamEventsForwardCompleted: 0xB3,
	  ReadStreamEventsBackward: 0xB4,
	  ReadStreamEventsBackwardCompleted: 0xB5,
	  ReadAllEventsForward: 0xB6,
	  ReadAllEventsForwardCompleted: 0xB7,
	  ReadAllEventsBackward: 0xB8,
	  ReadAllEventsBackwardCompleted: 0xB9,

	  SubscribeToStream: 0xC0,
	  SubscriptionConfirmation: 0xC1,
	  StreamEventAppeared: 0xC2,
	  UnsubscribeFromStream: 0xC3,
	  SubscriptionDropped: 0xC4,
	  ConnectToPersistentSubscription: 0xC5,
	  PersistentSubscriptionConfirmation: 0xC6,
	  PersistentSubscriptionStreamEventAppeared: 0xC7,
	  CreatePersistentSubscription: 0xC8,
	  CreatePersistentSubscriptionCompleted: 0xC9,
	  DeletePersistentSubscription: 0xCA,
	  DeletePersistentSubscriptionCompleted: 0xCB,
	  PersistentSubscriptionAckEvents: 0xCC,
	  PersistentSubscriptionNakEvents: 0xCD,
	  UpdatePersistentSubscription: 0xCE,
	  UpdatePersistentSubscriptionCompleted: 0xCF,

	  ScavengeDatabase: 0xD0,
	  ScavengeDatabaseCompleted: 0xD1,

	  BadRequest: 0xF0,
	  NotHandled: 0xF1,
	  Authenticate: 0xF2,
	  Authenticated: 0xF3,
	  NotAuthenticated: 0xF4
	};

	var _reverseLookup = {};
	for(var n in TcpCommand) {
	  var v = TcpCommand[n];
	  _reverseLookup[v] = n;
	}

	module.exports = TcpCommand;
	module.exports.getName = function(v) {
	  return _reverseLookup[v];
	};


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(4);
	var uuid = __webpack_require__(2);

	var Hash = __webpack_require__(22);
	var TcpCommand = __webpack_require__(20);

	/**
	 * @param {string} connectionName
	 * @param {object} settings
	 * @constructor
	 * @property {number} totalOperationCount
	 */
	function OperationsManager(connectionName, settings) {
	  this._connectionName = connectionName;
	  this._settings = settings;

	  this._totalOperationCount = 0;
	  this._activeOperations = new Hash();
	  this._waitingOperations = [];
	  this._retryPendingOperations = [];
	}
	Object.defineProperty(OperationsManager.prototype, 'totalOperationCount', {
	  get: function() {
	    return this._totalOperationCount;
	  }
	});

	OperationsManager.prototype.getActiveOperation = function(correlationId) {
	  return this._activeOperations.get(correlationId);
	};

	OperationsManager.prototype.cleanUp = function() {
	  var connectionClosedError = new Error(util.format("Connection '%s' was closed.", this._connectionName));

	  this._activeOperations.forEach(function(correlationId, operation){
	    operation.operation.fail(connectionClosedError);
	  });
	  this._waitingOperations.forEach(function(operation) {
	    operation.operation.fail(connectionClosedError);
	  });
	  this._retryPendingOperations.forEach(function(operation) {
	    operation.operation.fail(connectionClosedError);
	  });

	  this._activeOperations.clear();
	  this._waitingOperations = [];
	  this._retryPendingOperations = [];
	  this._totalOperationCount = 0;
	};

	OperationsManager.prototype.checkTimeoutsAndRetry = function(connection) {
	  if (!connection) throw new TypeError("Connection is null.");

	  var retryOperations = [];
	  var removeOperations = [];
	  var self = this;
	  this._activeOperations.forEach(function(correlationId, operation) {
	    if (operation.connectionId != connection.connectionId)
	    {
	      retryOperations.push(operation);
	    }
	    else if (operation.timeout > 0 && Date.now() - operation.lastUpdated > self._settings.operationTimeout)
	    {
	      var err = util.format("EventStoreConnection '%s': operation never got response from server.\n"
	          + "UTC now: %s, operation: %s.",
	          self._connectionName, new Date(), operation);
	      self._settings.log.error(err);

	      if (self._settings.failOnNoServerResponse)
	      {
	        operation.operation.fail(new Error(err));
	        removeOperations.push(operation);
	      }
	      else
	      {
	        retryOperations.push(operation);
	      }
	    }
	  });

	  retryOperations.forEach(function(operation) {
	    self.scheduleOperationRetry(operation);
	  });
	  removeOperations.forEach(function(operation) {
	    self.removeOperation(operation);
	  });

	  if (this._retryPendingOperations.length > 0)
	  {
	    this._retryPendingOperations.sort(function(x,y) {
	      if (x.seqNo < y.seqNo) return -1;
	      if (x.seqNo > y.seqNo) return 1;
	      return 0;
	    });
	    this._retryPendingOperations.forEach(function(operation) {
	      var oldCorrId = operation.correlationId;
	      operation.correlationId = uuid.v4();
	      operation.retryCount += 1;
	      self._logDebug("retrying, old corrId %s, operation %s.", oldCorrId, operation);
	      self.scheduleOperation(operation, connection);
	    });
	    this._retryPendingOperations = [];
	  }

	  this.scheduleWaitingOperations(connection);
	};

	OperationsManager.prototype.scheduleOperationRetry = function(operation) {
	  if (!this.removeOperation(operation))
	    return;

	  this._logDebug("ScheduleOperationRetry for %s.", operation);
	  if (operation.maxRetries >= 0 && operation.retryCount >= operation.maxRetries)
	  {
	    var err = util.format("Retry limit reached. Operation: %s, RetryCount: %d", operation, operation.retryCount);
	    operation.operation.fail(new Error(err));
	    return;
	  }
	  this._retryPendingOperations.push(operation);
	};

	OperationsManager.prototype.removeOperation = function(operation) {
	  this._activeOperations.remove(operation.connectionId);
	  this._logDebug("RemoveOperation SUCCEEDED for %s.", operation);
	  this._totalOperationCount = this._activeOperations.length + this._waitingOperations.length;
	  return true;
	};

	OperationsManager.prototype.scheduleWaitingOperations = function(connection) {
	  if (!connection) throw new TypeError("connection is null.");
	  while (this._waitingOperations.length > 0 && this._activeOperations.length < this._settings.maxConcurrentItems)
	  {
	    this.scheduleOperation(this._waitingOperations.shift(), connection);
	  }
	  this._totalOperationCount = this._activeOperations.length + this._waitingOperations.length;
	};

	OperationsManager.prototype.enqueueOperation = function(operation) {
	  this._logDebug("EnqueueOperation WAITING for %s.", operation);
	  this._waitingOperations.push(operation);
	};

	OperationsManager.prototype.scheduleOperation = function(operation, connection) {
	  if (this._activeOperations.length >= this._settings.maxConcurrentItems)
	  {
	    this._logDebug("ScheduleOperation WAITING for %s.", operation);
	    this._waitingOperations.push(operation);
	  }
	  else
	  {
	    operation.connectionId = connection.connectionId;
	    operation.lastUpdated = Date.now();
	    this._activeOperations.add(operation.correlationId, operation);

	    var pkg = operation.operation.createNetworkPackage(operation.correlationId);
	    this._logDebug("ScheduleOperation package %s, %s, %s.", TcpCommand.getName(pkg.command), pkg.correlationId, operation);
	    connection.enqueueSend(pkg);
	  }
	  this._totalOperationCount = this._activeOperations.length + this._waitingOperations.length;
	};

	OperationsManager.prototype._logDebug = function(message) {
	  if (!this._settings.verboseLogging) return;

	  if (arguments.length > 1)
	    message = util.format.apply(util, Array.prototype.slice.call(arguments));

	  this._settings.log.debug("EventStoreConnection '%s': %s.", this._connectionName, message);
	};

	module.exports = OperationsManager;


/***/ },
/* 22 */
/***/ function(module, exports) {

	/**
	 * @constructor
	 * @property {number} length
	 */
	function Hash() {
	  this._ = {};
	  this._length = 0;
	}
	Object.defineProperty(Hash.prototype, 'length', {
	  get: function() {
	    return this._length;
	  }
	});

	Hash.prototype.add = function(key,value) {
	  this._[key] = value;
	  this._length++;
	};

	Hash.prototype.clear = function() {
	  this._ = {};
	  this._length = 0;
	};

	Hash.prototype.forEach = function(cb) {
	  for(var k in this._) {
	    cb(k, this._[k]);
	  }
	};

	Hash.prototype.get = function(key) {
	  return this._[key];
	};

	Hash.prototype.remove = function(key) {
	  delete this._[key];
	  this._length--;
	};


	module.exports = Hash;


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(4);
	var uuid = __webpack_require__(2);
	var Hash = __webpack_require__(22);

	var SubscriptionDropReason = __webpack_require__(24);

	function SubscriptionsManager(connectionName, settings) {
	  //Ensure.NotNull(connectionName, "connectionName");
	  //Ensure.NotNull(settings, "settings");
	  this._connectionName = connectionName;
	  this._settings = settings;

	  this._activeSubscriptions = new Hash();
	  this._waitingSubscriptions = [];
	  this._retryPendingSubscriptions = [];
	}

	SubscriptionsManager.prototype.getActiveSubscription = function(correlationId) {
	  return this._activeSubscriptions.get(correlationId);
	};

	SubscriptionsManager.prototype.cleanUp = function() {
	  var connectionClosedError = new Error(util.format("Connection '%s' was closed.", this._connectionName));

	  var self = this;
	  this._activeSubscriptions.forEach(function(correlationId, subscription){
	    subscription.operation.dropSubscription(SubscriptionDropReason.ConnectionClosed, connectionClosedError);
	  });
	  this._waitingSubscriptions.forEach(function(subscription){
	    subscription.operation.dropSubscription(SubscriptionDropReason.ConnectionClosed, connectionClosedError);
	  });
	  this._retryPendingSubscriptions.forEach(function(subscription){
	    subscription.operation.dropSubscription(SubscriptionDropReason.ConnectionClosed, connectionClosedError);
	  });

	  this._activeSubscriptions.clear();
	  this._waitingSubscriptions = [];
	  this._retryPendingSubscriptions = [];
	};

	SubscriptionsManager.prototype.purgeSubscribedAndDroppedSubscriptions = function() {
	  var self = this;
	  var subscriptionsToRemove = [];
	  this._activeSubscriptions.forEach(function(_, subscription) {
	    if (subscription.isSubscribed && subscription.connectionId == connectionId) {
	      subscription.operation.connectionClosed();
	      subscriptionsToRemove.push(subscription);
	    }
	  });
	  subscriptionsToRemove.forEach(function(subscription) {
	    self._activeSubscriptions.remove(subscription.correlationId);
	  });
	};

	SubscriptionsManager.prototype.checkTimeoutsAndRetry = function(connection) {
	  //Ensure.NotNull(connection, "connection");

	  var self = this;
	  var retrySubscriptions = [];
	  var removeSubscriptions = [];
	  this._activeSubscriptions.forEach(function(_, subscription) {
	    if (subscription.isSubscribed) return;
	    if (subscription.connectionId != connection.connectionId)
	    {
	      retrySubscriptions.push(subscription);
	    }
	    else if (subscription.timeout > 0 && Date.now() - subscription.lastUpdated > self._settings.operationTimeout)
	    {
	      var err = util.format("EventStoreConnection '%s': subscription never got confirmation from server.\n" +
	          "UTC now: %s, operation: %s.",
	          self._connectionName, new Date(), subscription);
	      self._settings.log.error(err);

	      if (self._settings.failOnNoServerResponse)
	      {
	        subscription.operation.dropSubscription(SubscriptionDropReason.SubscribingError, new Error(err));
	        removeSubscriptions.push(subscription);
	      }
	      else
	      {
	        retrySubscriptions.push(subscription);
	      }
	    }
	  });

	  retrySubscriptions.forEach(function(subscription) {
	    self.scheduleSubscriptionRetry(subscription);
	  });
	  removeSubscriptions.forEach(function(subscription) {
	    self.removeSubscription(subscription);
	  });

	  if (this._retryPendingSubscriptions.length > 0)
	  {
	    this._retryPendingSubscriptions.forEach(function(subscription) {
	      subscription.retryCount += 1;
	      self.startSubscription(subscription, connection);
	    });
	    this._retryPendingSubscriptions = [];
	  }

	  while (this._waitingSubscriptions.length > 0)
	  {
	    this.startSubscription(this._waitingSubscriptions.shift(), connection);
	  }
	};

	SubscriptionsManager.prototype.removeSubscription = function(subscription) {
	  this._activeSubscriptions.remove(subscription.correlationId);
	  this._logDebug("RemoveSubscription %s.", subscription);
	  return true;
	};

	SubscriptionsManager.prototype.scheduleSubscriptionRetry = function(subscription) {
	  if (!this.removeSubscription(subscription))
	  {
	    this._logDebug("RemoveSubscription failed when trying to retry %s.", subscription);
	    return;
	  }

	  if (subscription.maxRetries >= 0 && subscription.retryCount >= subscription.maxRetries)
	  {
	    this._logDebug("RETRIES LIMIT REACHED when trying to retry %s.", subscription);
	    var err = util.format("Retries limit reached. Subscription: %s RetryCount: %d.", subscription, subscription.retryCount);
	    subscription.operation.dropSubscription(SubscriptionDropReason.SubscribingError, new Error(err));
	    return;
	  }

	  this._logDebug("retrying subscription %s.", subscription);
	  this._retryPendingSubscriptions.push(subscription);
	};

	SubscriptionsManager.prototype.enqueueSubscription = function(subscriptionItem) {
	  this._waitingSubscriptions.push(subscriptionItem);
	};

	SubscriptionsManager.prototype.startSubscription = function(subscription, connection) {
	  //Ensure.NotNull(connection, "connection");

	  if (subscription.isSubscribed)
	  {
	    this._logDebug("StartSubscription REMOVING due to already subscribed %s.", subscription);
	    this.removeSubscription(subscription);
	    return;
	  }

	  subscription.correlationId = uuid.v4();
	  subscription.connectionId = connection.connectionId;
	  subscription.lastUpdated = Date.now();

	  this._activeSubscriptions.add(subscription.correlationId, subscription);

	  if (!subscription.operation.subscribe(subscription.correlationId, connection))
	  {
	    this._logDebug("StartSubscription REMOVING AS COULDN'T SUBSCRIBE %s.", subscription);
	    this.removeSubscription(subscription);
	  }
	  else
	  {
	    this._logDebug("StartSubscription SUBSCRIBING %s.", subscription);
	  }
	};

	SubscriptionsManager.prototype._logDebug = function(message) {
	  if (!this._settings.verboseLogging) return;

	  var parameters = Array.prototype.slice.call(arguments, 1);
	  this._settings.log.debug("EventStoreConnection '%s': %s.", this._connectionName, parameters.length == 0 ? message : util.format(message, parameters));
	};

	module.exports = SubscriptionsManager;

/***/ },
/* 24 */
/***/ function(module, exports) {

	const SubscriptionDropReason = {
	  AccessDenied: 'accessDenied',
	  CatchUpError: 'catchUpError',
	  ConnectionClosed: 'connectionClosed',
	  EventHandlerException: 'eventHandlerException',
	  MaxSubscribersReached: 'maxSubscribersReached',
	  NotFound: 'notFound',
	  PersistentSubscriptionDeleted: 'persistentSubscriptionDeleted',
	  ProcessingQueueOverflow: 'processingQueueOverflow',
	  ServerError: 'serverError',
	  SubscribingError: 'subscribingError',
	  UserInitiated: 'userInitiated',
	  Unknown: 'unknown'
	};

	module.exports = SubscriptionDropReason;

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(4);

	var SubscriptionOperation = __webpack_require__(26);
	var ClientMessage = __webpack_require__(29);
	var TcpPackage = __webpack_require__(18);
	var TcpCommand = __webpack_require__(20);
	var TcpFlags = __webpack_require__(19);
	var BufferSegment = __webpack_require__(15);
	var InspectionDecision = __webpack_require__(27);
	var InspectionResult = __webpack_require__(28);
	var results = __webpack_require__(3);
	var VolatileEventStoreSubscription = __webpack_require__(30);

	function VolatileSubscriptionOperation(
	    log, cb, streamId, resolveLinkTos, userCredentials, eventAppeared,
	    subscriptionDropped, verboseLogging, getConnection
	) {
	  SubscriptionOperation.call(this, log, cb, streamId, resolveLinkTos, userCredentials, eventAppeared, subscriptionDropped, verboseLogging, getConnection);
	}
	util.inherits(VolatileSubscriptionOperation, SubscriptionOperation);

	VolatileSubscriptionOperation.prototype._createSubscriptionPackage = function() {
	  var dto = new ClientMessage.SubscribeToStream(this._streamId, this._resolveLinkTos);
	  return new TcpPackage(TcpCommand.SubscribeToStream,
	      this._userCredentials != null ? TcpFlags.Authenticated : TcpFlags.None,
	      this._correlationId,
	      this._userCredentials != null ? this._userCredentials.username : null,
	      this._userCredentials != null ? this._userCredentials.password : null,
	      new BufferSegment(dto.toBuffer()));
	};

	VolatileSubscriptionOperation.prototype._inspectPackage = function(pkg) {
	  try {
	    if (pkg.command == TcpCommand.SubscriptionConfirmation) {
	      var dto = ClientMessage.SubscriptionConfirmation.decode(pkg.data.toBuffer());
	      this._confirmSubscription(dto.last_commit_position, dto.last_event_number);
	      return new InspectionResult(InspectionDecision.Subscribed, "SubscriptionConfirmation");
	    }
	    if (pkg.command == TcpCommand.StreamEventAppeared) {
	      var dto = ClientMessage.StreamEventAppeared.decode(pkg.data.toBuffer());
	      this._onEventAppeared(new results.ResolvedEvent(dto.event));
	      return new InspectionResult(InspectionDecision.DoNothing, "StreamEventAppeared");
	    }
	    return null;
	  } catch(e) {
	    console.log(e.stack);
	    return null;
	  }
	};

	VolatileSubscriptionOperation.prototype._createSubscriptionObject = function(lastCommitPosition, lastEventNumber) {
	  return new VolatileEventStoreSubscription(this, this._streamId, lastCommitPosition, lastEventNumber);
	};

	module.exports = VolatileSubscriptionOperation;

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(4);
	var uuid = __webpack_require__(2);

	var TcpCommand = __webpack_require__(20);
	var TcpFlags = __webpack_require__(19);
	var InspectionDecision = __webpack_require__(27);
	var InspectionResult = __webpack_require__(28);
	var ClientMessage = __webpack_require__(29);
	var TcpPackage = __webpack_require__(18);
	var BufferSegment = __webpack_require__(15);
	var results = __webpack_require__(3);
	var SubscriptionDropReason = __webpack_require__(24);

	//TODO: nodify eventAppeared and subscriptionDropped, should be emit on subscription
	function SubscriptionOperation(
	    log, cb, streamId, resolveLinkTos, userCredentials, eventAppeared,
	    subscriptionDropped, verboseLogging, getConnection
	) {
	  //TODO: validations
	  //Ensure.NotNull(log, "log");
	  //Ensure.NotNull(source, "source");
	  //Ensure.NotNull(eventAppeared, "eventAppeared");
	  //Ensure.NotNull(getConnection, "getConnection");

	  this._log = log;
	  this._cb = cb;
	  this._streamId = streamId || '';
	  this._resolveLinkTos = resolveLinkTos;
	  this._userCredentials = userCredentials;
	  this._eventAppeared = eventAppeared;
	  this._subscriptionDropped = subscriptionDropped || function() {};
	  this._verboseLogging = verboseLogging;
	  this._getConnection = getConnection;

	  this._correlationId = null;
	  this._unsubscribed = false;
	  this._subscription = null;
	  this._actionExecuting = false;
	  this._actionQueue = [];
	}

	SubscriptionOperation.prototype._enqueueSend = function(pkg) {
	  this._getConnection().enqueueSend(pkg);
	};

	SubscriptionOperation.prototype.subscribe = function(correlationId, connection) {
	  if (connection === null) throw new TypeError("connection is null.");

	  if (this._subscription != null || this._unsubscribed != 0)
	    return false;

	  this._correlationId = correlationId;
	  connection.enqueueSend(this._createSubscriptionPackage());
	  return true;
	};

	SubscriptionOperation.prototype._createSubscriptionPackage = function() {
	  throw new Error("SubscriptionOperation._createSubscriptionPackage abstract method called. " + this.constructor.name);
	};

	SubscriptionOperation.prototype.unsubscribe = function() {
	  this.dropSubscription(SubscriptionDropReason.UserInitiated, null, this._getConnection());
	};

	SubscriptionOperation.prototype._createUnsubscriptionPackage = function() {
	  var msg = new ClientMessage.UnsubscribeFromStream();
	  var data = new BufferSegment(msg.toBuffer());
	  return new TcpPackage(TcpCommand.UnsubscribeFromStream, TcpFlags.None, this._correlationId, null, null, data);
	};

	SubscriptionOperation.prototype._inspectPackage = function(pkg) {
	  throw new Error("SubscriptionOperation._inspectPackage abstract method called." + this.constructor.name);
	};

	SubscriptionOperation.prototype.inspectPackage = function(pkg) {
	  try
	  {
	    var result = this._inspectPackage(pkg);
	    if (result !== null) {
	      return result;
	    }

	    switch (pkg.command)
	    {
	      case TcpCommand.StreamEventAppeared:
	      {
	        var dto = ClientMessage.StreamEventAppeared.decode(pkg.data.toBuffer());
	        this._onEventAppeared(new results.ResolvedEvent(dto.event));
	        return new InspectionResult(InspectionDecision.DoNothing, "StreamEventAppeared");
	      }

	      case TcpCommand.SubscriptionDropped:
	      {
	        var dto = ClientMessage.SubscriptionDropped.decode(pkg.data.toBuffer());
	        switch (dto.reason)
	        {
	          case ClientMessage.SubscriptionDropped.SubscriptionDropReason.Unsubscribed:
	            this.dropSubscription(SubscriptionDropReason.UserInitiated, null);
	            break;
	          case ClientMessage.SubscriptionDropped.SubscriptionDropReason.AccessDenied:
	            this.dropSubscription(SubscriptionDropReason.AccessDenied,
	                new Error(util.format("Subscription to '%s' failed due to access denied.", this._streamId || "<all>")));
	            break;
	          default:
	            if (this._verboseLogging) this._log.debug("Subscription dropped by server. Reason: %s.", dto.reason);
	            this.dropSubscription(SubscriptionDropReason.Unknown,
	                new Error(util.format("Unsubscribe reason: '%s'.", dto.reason)));
	            break;
	        }
	        return new InspectionResult(InspectionDecision.EndOperation, util.format("SubscriptionDropped: %s", dto.reason));
	      }

	      case TcpCommand.NotAuthenticated:
	      {
	        var message = pkg.data.toString();
	        this.dropSubscription(SubscriptionDropReason.NotAuthenticated,
	            new Error(message || "Authentication error"));
	        return new InspectionResult(InspectionDecision.EndOperation, "NotAuthenticated");
	      }

	      case TcpCommand.BadRequest:
	      {
	        var message = pkg.data.toString();
	        this.dropSubscription(SubscriptionDropReason.ServerError,
	            new Error("Server error: " + (message || "<no message>")));
	        return new InspectionResult(InspectionDecision.EndOperation, util.format("BadRequest: %s", message));
	      }

	      case TcpCommand.NotHandled:
	      {
	        if (this._subscription != null)
	          throw new Error("NotHandled command appeared while we already subscribed.");

	        var message = ClientMessage.NotHandled.decode(pkg.data.toBuffer());
	        switch (message.reason)
	        {
	          case ClientMessage.NotHandled.NotHandledReason.NotReady:
	            return new InspectionResult(InspectionDecision.Retry, "NotHandled - NotReady");

	          case ClientMessage.NotHandled.NotHandledReason.TooBusy:
	            return new InspectionResult(InspectionDecision.Retry, "NotHandled - TooBusy");

	          case ClientMessage.NotHandled.NotHandledReason.NotMaster:
	            var masterInfo = ClientMessage.NotHandled.MasterInfo.decode(message.additional_info);
	            return new InspectionResult(InspectionDecision.Reconnect, "NotHandled - NotMaster",
	                {host: masterInfo.external_tcp_address, port: masterInfo.external_tcp_port},
	                {host: masterInfo.external_secure_tcp_address, port: masterInfo.external_secure_tcp_port});

	          default:
	            this._log.error("Unknown NotHandledReason: %s.", message.reason);
	            return new InspectionResult(InspectionDecision.Retry, "NotHandled - <unknown>");
	        }
	      }

	      default:
	      {
	        this.dropSubscription(SubscriptionDropReason.ServerError,
	            new Error("Command not expected: " + TcpCommand.getName(pkg.command)));
	        return new InspectionResult(InspectionDecision.EndOperation, pkg.command);
	      }
	    }
	  }
	  catch (e)
	  {
	    this.dropSubscription(SubscriptionDropReason.Unknown, e);
	    return new InspectionResult(InspectionDecision.EndOperation, util.format("Exception - %s", e.Message));
	  }
	};

	SubscriptionOperation.prototype.connectionClosed = function() {
	  this.dropSubscription(SubscriptionDropReason.ConnectionClosed, new Error("Connection was closed."));
	};

	SubscriptionOperation.prototype.timeOutSubscription = function() {
	  if (this._subscription !== null)
	    return false;
	  this.dropSubscription(SubscriptionDropReason.SubscribingError, null);
	  return true;
	};

	SubscriptionOperation.prototype.dropSubscription = function(reason, err, connection) {
	  if (!this._unsubscribed)
	  {
	    this._unsubscribed = true;
	    if (this._verboseLogging)
	      this._log.debug("Subscription %s to %s: closing subscription, reason: %s, exception: %s...",
	          this._correlationId, this._streamId || "<all>", reason, err);

	    if (reason !== SubscriptionDropReason.UserInitiated && this._subscription === null)
	    {
	      if (err === null) throw new Error(util.format("No exception provided for subscription drop reason '%s", reason));
	      //TODO: this should be last thing to execute
	      this._cb(err);
	      return;
	    }

	    if (reason === SubscriptionDropReason.UserInitiated && this._subscription !== null && connection !== null)
	      connection.enqueueSend(this._createUnsubscriptionPackage());

	    var self = this;
	    if (this._subscription !== null)
	      this._executeAction(function() { self._subscriptionDropped(self._subscription, reason, err); });
	  }
	};

	SubscriptionOperation.prototype._confirmSubscription = function(lastCommitPosition, lastEventNumber) {
	  if (lastCommitPosition < -1)
	    throw new Error(util.format("Invalid lastCommitPosition %s on subscription confirmation.", lastCommitPosition));
	  if (this._subscription !== null)
	    throw new Error("Double confirmation of subscription.");

	  if (this._verboseLogging)
	    this._log.debug("Subscription %s to %s: subscribed at CommitPosition: %d, EventNumber: %d.",
	        this._correlationId, this._streamId || "<all>", lastCommitPosition, lastEventNumber);

	  this._subscription = this._createSubscriptionObject(lastCommitPosition, lastEventNumber);
	  this._cb(null, this._subscription);
	};

	SubscriptionOperation.prototype._createSubscriptionObject = function(lastCommitPosition, lastEventNumber) {
	  throw new Error("SubscriptionOperation._createSubscriptionObject abstract method called. " + this.constructor.name);
	};

	SubscriptionOperation.prototype._onEventAppeared = function(e) {
	  if (this._unsubscribed)
	    return;

	  if (this._subscription === null) throw new Error("Subscription not confirmed, but event appeared!");

	  if (this._verboseLogging)
	    this._log.debug("Subscription %s to %s: event appeared (%s, %d, %s @ %s).",
	        this._correlationId, this._streamId || "<all>",
	        e.originalStreamId, e.originalEventNumber, e.originalEvent.eventType, e.originalPosition);

	  var self = this;
	  this._executeAction(function() { self._eventAppeared(self._subscription, e); });
	};

	SubscriptionOperation.prototype._executeAction = function(action) {
	  this._actionQueue.push(action);
	  if (!this._actionExecuting) {
	    this._actionExecuting = true;
	    setImmediate(this._executeActions.bind(this));
	  }
	};

	SubscriptionOperation.prototype._executeActions = function() {
	  //TODO: possible blocking loop for node.js
	  var action = this._actionQueue.shift();
	  while (action)
	  {
	    try
	    {
	      action();
	    }
	    catch (err)
	    {
	      this._log.error(err, "Exception during executing user callback: %s.", err.message);
	    }
	    action = this._actionQueue.shift();
	  }
	  this._actionExecuting = false;
	};

	SubscriptionOperation.prototype.toString = function() {
	  return this.constructor.name;
	};


	module.exports = SubscriptionOperation;

/***/ },
/* 27 */
/***/ function(module, exports) {

	var InspectionDecision = {
	  DoNothing: 'doNothing',
	  EndOperation: 'endOperation',
	  Retry: 'retry',
	  Reconnect: 'reconnect',
	  Subscribed: 'subscribed'
	};

	module.exports = InspectionDecision;

/***/ },
/* 28 */
/***/ function(module, exports) {

	function InspectionResult(decision, description, tcpEndPoint, secureTcpEndPoint) {
	  this.decision = decision;
	  this.description = description;
	  this.tcpEndPoint = tcpEndPoint || null;
	  this.secureTcpEndPoint = secureTcpEndPoint || null;
	}

	module.exports = InspectionResult;


/***/ },
/* 29 */
/***/ function(module, exports) {

	module.exports = require("../src/messages/clientMessage");

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(4);

	var EventStoreSubsription = __webpack_require__(31);

	/**
	 * @param {SubscriptionOperation} subscriptionOperation
	 * @param {string} streamId
	 * @param {Position} lastCommitPosition
	 * @param {number} lastEventNumber
	 * @constructor
	 * @augments {EventStoreSubscription}
	 */
	function VolatileEventStoreConnection(subscriptionOperation, streamId, lastCommitPosition, lastEventNumber) {
	  EventStoreSubsription.call(this, streamId, lastCommitPosition, lastEventNumber);

	  this._subscriptionOperation = subscriptionOperation;
	}
	util.inherits(VolatileEventStoreConnection, EventStoreSubsription);

	VolatileEventStoreConnection.prototype.unsubscribe = function() {
	  this._subscriptionOperation.unsubscribe();
	};

	module.exports = VolatileEventStoreConnection;


/***/ },
/* 31 */
/***/ function(module, exports) {

	/***
	 * EventStoreSubscription
	 * @param {string} streamId
	 * @param {number} lastCommitPosition
	 * @param {?number} lastEventNumber
	 * @constructor
	 * @property {boolean} isSubscribedToAll
	 * @property {string} streamId
	 * @property {number} lastCommitPosition
	 * @property {?number} lastEventNumber
	 */
	function EventStoreSubscription(streamId, lastCommitPosition, lastEventNumber) {
	  Object.defineProperties(this, {
	    isSubscribedToAll: {
	      value: streamId === ''
	    },
	    streamId: {
	      value: streamId
	    },
	    lastCommitPosition: {
	      value: lastCommitPosition
	    },
	    lastEventNumber: {
	      value: lastEventNumber
	    }
	  });
	}

	/**
	 * Unsubscribes from the stream
	 */
	EventStoreSubscription.prototype.close = function() {
	  this.unsubscribe();
	};

	/**
	 * Unsubscribes from the stream
	 * @abstract
	 */
	EventStoreSubscription.prototype.unsubscribe = function() {
	  throw new Error("EventStoreSubscription.unsubscribe abstract method called." + this.constructor.name);
	};

	module.exports = EventStoreSubscription;


/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(4);
	var uuid = __webpack_require__(2);

	var SubscriptionOperation = __webpack_require__(26);
	var ClientMessage = __webpack_require__(29);
	var TcpCommand = __webpack_require__(20);
	var TcpFlags = __webpack_require__(19);
	var TcpPackage = __webpack_require__(18);
	var createBufferSegment = __webpack_require__(15);
	var InspectionResult = __webpack_require__(28);
	var InspectionDecision = __webpack_require__(27);
	var results = __webpack_require__(3);
	var SubscriptionDropReason = __webpack_require__(24);
	var PersistentEventStoreSubscription = __webpack_require__(33);
	var ensure = __webpack_require__(6);

	function ConnectToPersistentSubscriptionOperation(
	    log, cb, groupName, bufferSize, streamId, userCredentials, eventAppeared, subscriptionDropped,
	    verboseLogging, getConnection
	) {
	  SubscriptionOperation.call(this, log, cb, streamId, false, userCredentials, eventAppeared, subscriptionDropped, verboseLogging, getConnection);

	  this._groupName = groupName;
	  this._bufferSize = bufferSize;
	  this._subscriptionId = null;
	}
	util.inherits(ConnectToPersistentSubscriptionOperation, SubscriptionOperation);

	ConnectToPersistentSubscriptionOperation.prototype._createSubscriptionPackage = function() {
	  var dto = new ClientMessage.ConnectToPersistentSubscription(this._groupName, this._streamId, this._bufferSize);
	  return new TcpPackage(TcpCommand.ConnectToPersistentSubscription,
	      this._userCredentials !== null ? TcpFlags.Authenticated : TcpFlags.None,
	      this._correlationId,
	      this._userCredentials !== null ? this._userCredentials.username : null,
	      this._userCredentials !== null ? this._userCredentials.password : null,
	      createBufferSegment(dto.toBuffer()));
	};

	ConnectToPersistentSubscriptionOperation.prototype._inspectPackage = function(pkg) {
	  if (pkg.command == TcpCommand.PersistentSubscriptionConfirmation)
	  {
	    var dto = ClientMessage.PersistentSubscriptionConfirmation.decode(pkg.data.toBuffer());
	    this._confirmSubscription(dto.last_commit_position, dto.last_event_number);
	    this._subscriptionId = dto.subscription_id;
	    return new InspectionResult(InspectionDecision.Subscribed, "SubscriptionConfirmation");
	  }
	  if (pkg.command == TcpCommand.PersistentSubscriptionStreamEventAppeared)
	  {
	    var dto = ClientMessage.PersistentSubscriptionStreamEventAppeared.decode(pkg.data.toBuffer());
	    this._onEventAppeared(new results.ResolvedEvent(dto.event));
	    return new InspectionResult(InspectionDecision.DoNothing, "StreamEventAppeared");
	  }
	  if (pkg.command == TcpCommand.SubscriptionDropped)
	  {
	    var dto = ClientMessage.SubscriptionDropped.decode(pkg.data.toBuffer());
	    if (dto.reason == ClientMessage.SubscriptionDropped.SubscriptionDropReason.AccessDenied)
	    {
	      this.dropSubscription(SubscriptionDropReason.AccessDenied, new Error("You do not have access to the stream."));
	      return new InspectionResult(InspectionDecision.EndOperation, "SubscriptionDropped");
	    }
	    if (dto.reason == ClientMessage.SubscriptionDropped.SubscriptionDropReason.NotFound)
	    {
	      this.dropSubscription(SubscriptionDropReason.NotFound, new Error("Subscription not found"));
	      return new InspectionResult(InspectionDecision.EndOperation, "SubscriptionDropped");
	    }
	    if (dto.reason == ClientMessage.SubscriptionDropped.SubscriptionDropReason.PersistentSubscriptionDeleted)
	    {
	      this.dropSubscription(SubscriptionDropReason.PersistentSubscriptionDeleted, new Error("Persistent subscription deleted."));
	      return new InspectionResult(InspectionDecision.EndOperation, "SubscriptionDropped");
	    }
	    if (dto.reason == ClientMessage.SubscriptionDropped.SubscriptionDropReason.SubscriberMaxCountReached)
	    {
	      this.dropSubscription(SubscriptionDropReason.MaxSubscribersReached, new Error("Maximum subscribers reached."));
	      return new InspectionResult(InspectionDecision.EndOperation, "SubscriptionDropped");
	    }
	    this.dropSubscription(SubscriptionDropReason.UserInitiated, null, this._getConnection());
	    return new InspectionResult(InspectionDecision.EndOperation, "SubscriptionDropped");
	  }
	  return null;
	};

	ConnectToPersistentSubscriptionOperation.prototype._createSubscriptionObject = function(lastCommitPosition, lastEventNumber) {
	  return new PersistentEventStoreSubscription(this, this._streamId, lastCommitPosition, lastEventNumber);
	};

	ConnectToPersistentSubscriptionOperation.prototype.notifyEventsProcessed = function(processedEvents) {
	  ensure.notNull(processedEvents, "processedEvents");
	  var dto = new ClientMessage.PersistentSubscriptionAckEvents({
	    subscription_id: this._subscriptionId,
	    processed_event_ids: processedEvents.map(function (x) {
	      return new Buffer(uuid.parse(x));
	    })
	  });

	  var pkg = new TcpPackage(TcpCommand.PersistentSubscriptionAckEvents,
	      this._userCredentials !== null ? TcpFlags.Authenticated : TcpFlags.None,
	      this._correlationId,
	      this._userCredentials !== null ? this._userCredentials.username : null,
	      this._userCredentials !== null ? this._userCredentials.password : null,
	      createBufferSegment(dto.encode().toBuffer()));
	  this._enqueueSend(pkg);
	};

	ConnectToPersistentSubscriptionOperation.prototype.notifyEventsFailed = function(processedEvents, action, reason) {
	  ensure.notNull(processedEvents, "processedEvents");
	  ensure.notNull(reason, "reason");
	  var dto = new ClientMessage.PersistentSubscriptionNakEvents(
	      this._subscriptionId,
	      processedEvents.map(function(x) { return new Buffer(uuid.parse(x)); }),
	      reason,
	      action);

	  var pkg = new TcpPackage(TcpCommand.PersistentSubscriptionNakEvents,
	      this._userCredentials != null ? TcpFlags.Authenticated : TcpFlags.None,
	      this._correlationId,
	      this._userCredentials != null ? this._userCredentials.username : null,
	      this._userCredentials != null ? this._userCredentials.password : null,
	      createBufferSegment(dto.toBuffer()));
	  this._enqueueSend(pkg);
	};

	module.exports = ConnectToPersistentSubscriptionOperation;


/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(4);

	var EventStoreSubscription = __webpack_require__(31);


	function PersistentEventStoreSubscription(subscriptionOperation, streamId, lastCommitPosition, lastEventNumber) {
	  EventStoreSubscription.call(this, streamId, lastCommitPosition, lastEventNumber);

	  this._subscriptionOperation = subscriptionOperation;
	}
	util.inherits(PersistentEventStoreSubscription, EventStoreSubscription);

	PersistentEventStoreSubscription.prototype.unsubscribe = function() {
	  this._subscriptionOperation.unsubscribe();
	};

	PersistentEventStoreSubscription.prototype.notifyEventsProcessed = function(processedEvents) {
	  this._subscriptionOperation.notifyEventsProcessed(processedEvents);
	};

	PersistentEventStoreSubscription.prototype.notifyEventsFailed = function(processedEvents, action, reason) {
	  this._subscriptionOperation.notifyEventsFailed(processedEvents, action, reason);
	};

	module.exports = PersistentEventStoreSubscription;


/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(4);
	var uuid = __webpack_require__(2);

	var TcpCommand = __webpack_require__(20);
	var InspectionDecision = __webpack_require__(27);
	var InspectionResult = __webpack_require__(28);
	var ClientMessage = __webpack_require__(29);
	var results = __webpack_require__(3);
	var WrongExpectedVersionError = __webpack_require__(35);
	var StreamDeletedError = __webpack_require__(36);
	var AccessDeniedError = __webpack_require__(37);

	var OperationBase = __webpack_require__(38);


	function DeleteStreamOperation(log, cb, requireMaster, stream, expectedVersion, hardDelete, userCredentials) {
	  OperationBase.call(this, log, cb, TcpCommand.DeleteStream, TcpCommand.DeleteStreamCompleted, userCredentials);
	  this._responseType = ClientMessage.DeleteStreamCompleted;

	  this._requireMaster = requireMaster;
	  this._stream = stream;
	  this._expectedVersion = expectedVersion;
	  this._hardDelete = hardDelete;
	}
	util.inherits(DeleteStreamOperation, OperationBase);

	DeleteStreamOperation.prototype._createRequestDto = function() {
	  return new ClientMessage.DeleteStream(this._stream, this._expectedVersion, this._requireMaster, this._hardDelete);
	};

	DeleteStreamOperation.prototype._inspectResponse = function(response) {
	  switch (response.result)
	  {
	    case ClientMessage.OperationResult.Success:
	      this._succeed();
	      return new InspectionResult(InspectionDecision.EndOperation, "Success");
	    case ClientMessage.OperationResult.PrepareTimeout:
	      return new InspectionResult(InspectionDecision.Retry, "PrepareTimeout");
	    case ClientMessage.OperationResult.CommitTimeout:
	      return new InspectionResult(InspectionDecision.Retry, "CommitTimeout");
	    case ClientMessage.OperationResult.ForwardTimeout:
	      return new InspectionResult(InspectionDecision.Retry, "ForwardTimeout");
	    case ClientMessage.OperationResult.WrongExpectedVersion:
	      this.fail(new WrongExpectedVersionError("Delete", this._stream, this._expectedVersion));
	      return new InspectionResult(InspectionDecision.EndOperation, "WrongExpectedVersion");
	    case ClientMessage.OperationResult.StreamDeleted:
	      this.fail(new StreamDeletedError(this._stream));
	      return new InspectionResult(InspectionDecision.EndOperation, "StreamDeleted");
	    case ClientMessage.OperationResult.InvalidTransaction:
	      this.fail(new Error("Invalid transaction."));
	      return new InspectionResult(InspectionDecision.EndOperation, "InvalidTransaction");
	    case ClientMessage.OperationResult.AccessDenied:
	      this.fail(new AccessDeniedError("Delete", this._stream));
	      return new InspectionResult(InspectionDecision.EndOperation, "AccessDenied");
	    default:
	      throw new Error(util.format("Unexpected OperationResult: %d.", response.result));
	  }
	};

	DeleteStreamOperation.prototype._transformResponse = function(response) {
	  return new results.DeleteResult(new results.Position(response.prepare_position || -1, response.commit_position || -1));
	};

	DeleteStreamOperation.prototype.toString = function() {
	  return util.format("Stream: %s, ExpectedVersion: %s.", this._stream, this._expectedVersion);
	};

	module.exports = DeleteStreamOperation;

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(4);
	var Long = __webpack_require__(5);

	function WrongExpectedVersionError(action, streamOrTransactionId, expectedVersion) {
	  Error.captureStackTrace(this, this.constructor);
	  this.name = this.constructor.name;
	  this.action = action;
	  if (typeof streamOrTransactionId === 'string') {
	    this.message = util.format("%s failed due to WrongExpectedVersion. Stream: %s Expected version: %d.", action, streamOrTransactionId, expectedVersion);
	    this.stream = streamOrTransactionId;
	    this.expectedVersion = expectedVersion;
	    return;
	  }
	  if (Long.isLong(streamOrTransactionId)) {
	    this.message = util.format("%s transaction failed due to WrongExpectedVersion. Transaction Id: %s.", action, streamOrTransactionId);
	    this.transactionId = streamOrTransactionId;
	    return;
	  }
	  throw new TypeError("second argument must be a stream name or a transaction Id.");
	}
	util.inherits(WrongExpectedVersionError, Error);

	module.exports = WrongExpectedVersionError;

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(4);
	var Long = __webpack_require__(5);

	function StreamDeletedError(streamOrTransactionId) {
	  Error.captureStackTrace(this, this.constructor);
	  this.name = this.constructor.name;
	  if (typeof streamOrTransactionId === 'string') {
	    this.message = util.format("Event stream '%s' is deleted.", streamOrTransactionId);
	    this.stream = streamOrTransactionId;
	    return;
	  }
	  if (Long.isLong(streamOrTransactionId)) {
	    this.message = util.format("Stream is deleted for transaction %s.", streamOrTransactionId);
	    this.transactionId = streamOrTransactionId;
	    return;
	  }
	  throw new TypeError("second argument must be a stream name or transaction Id.");
	}
	util.inherits(StreamDeletedError, Error);

	module.exports = StreamDeletedError;

/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(4);
	var Long = __webpack_require__(5);

	function AccessDeniedError(action, streamOrTransactionId) {
	  Error.captureStackTrace(this, this.constructor);
	  this.name = this.constructor.name;
	  this.action = action;
	  if (typeof streamOrTransactionId === 'string') {
	    this.message = util.format("%s access denied for stream '%s'.", action, streamOrTransactionId);
	    this.stream = streamOrTransactionId;
	    return;
	  }
	  if (Long.isLong(streamOrTransactionId)) {
	    this.message = util.format("%s access denied for transaction %s.", action, streamOrTransactionId);
	    this.transactionId = streamOrTransactionId;
	    return;
	  }
	  throw new TypeError("second argument must be a stream name or transaction Id.");
	}
	util.inherits(AccessDeniedError, Error);

	module.exports = AccessDeniedError;

/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(4);

	var TcpPackage = __webpack_require__(18);
	var TcpCommand = __webpack_require__(20);
	var TcpFlags = __webpack_require__(19);
	var InspectionDecision = __webpack_require__(27);
	var ClientMessage = __webpack_require__(29);
	var InspectionResult = __webpack_require__(28);
	var createBufferSegment = __webpack_require__(15);

	function OperationBase(log, cb, requestCommand, responseCommand, userCredentials) {
	  this.log = log;
	  this._cb = cb;
	  this._requestCommand = requestCommand;
	  this._responseCommand = responseCommand;
	  this.userCredentials = userCredentials;

	  this._completed = false;
	  this._response = null;

	  this._responseType = null;
	}

	OperationBase.prototype._createRequestDto = function() {
	  throw new Error('_createRequestDto not implemented.');
	};

	OperationBase.prototype._inspectResponse = function() {
	  throw new Error('_inspectResponse not implemented.');
	};

	OperationBase.prototype._transformResponse = function() {
	  throw new Error('_transformResponse not implemented.');
	};

	OperationBase.prototype.fail = function(error) {
	  this._completed = true;
	  this._cb(error);
	};

	OperationBase.prototype._succeed = function() {
	  if (!this._completed) {
	    this._completed = true;

	    if (this._response != null)
	      this._cb(null, this._transformResponse(this._response));
	    else
	      this._cb(new Error("No result."))
	  }
	};

	OperationBase.prototype.createNetworkPackage = function(correlationId) {
	  var dto = this._createRequestDto();
	  var buf = dto.toBuffer();
	  return new TcpPackage(
	      this._requestCommand,
	      this.userCredentials ? TcpFlags.Authenticated : TcpFlags.None,
	      correlationId,
	      this.userCredentials ? this.userCredentials.username : null,
	      this.userCredentials ? this.userCredentials.password : null,
	      createBufferSegment(buf));
	};

	OperationBase.prototype.inspectPackage = function(pkg) {
	  try {
	    if (pkg.command === this._responseCommand) {
	      this._response = this._responseType.decode(pkg.data.toBuffer());
	      return this._inspectResponse(this._response);
	    }
	    switch (pkg.command) {
	      case TcpCommand.NotAuthenticated:
	        return this._inspectNotAuthenticated(pkg);
	      case TcpCommand.BadRequest:
	        return this._inspectBadRequest(pkg);
	      case TcpCommand.NotHandled:
	        return this._inspectNotHandled(pkg);
	      default:
	        return this._inspectUnexpectedCommand(package, this._responseCommand);
	    }
	  } catch(e) {
	    this.fail(e);
	    return new InspectionResult(InspectionDecision.EndOperation, "Error - " + e.message);
	  }
	};

	OperationBase.prototype._inspectNotAuthenticated = function(pkg)
	{
	  var message = '';
	  try {
	    message = pkg.data.toString();
	  } catch(e) {}
	  //TODO typed error
	  this.fail(new Error("Authentication error: " + message));
	  return new InspectionResult(InspectionDecision.EndOperation, "NotAuthenticated");
	};

	OperationBase.prototype._inspectBadRequest = function(pkg)
	{
	  var message = '';
	  try {
	    message = pkg.data.toString();
	  } catch(e) {}
	  //TODO typed error
	  this.fail(new Error("Bad request: " + message));
	  return new InspectionResult(InspectionDecision.EndOperation, "BadRequest - " + message);
	};

	OperationBase.prototype._inspectNotHandled = function(pkg)
	{
	  var message = ClientMessage.NotHandled.decode(pkg.data.toBuffer());
	  switch (message.reason)
	  {
	    case ClientMessage.NotHandled.NotHandledReason.NotReady:
	      return new InspectionResult(InspectionDecision.Retry, "NotHandled - NotReady");

	    case ClientMessage.NotHandled.NotHandledReason.TooBusy:
	      return new InspectionResult(InspectionDecision.Retry, "NotHandled - TooBusy");

	    case ClientMessage.NotHandled.NotHandledReason.NotMaster:
	      var masterInfo = ClientMessage.NotHandled.MasterInfo.decode(message.additional_info);
	      return new new InspectionResult(InspectionDecision.Reconnect, "NotHandled - NotMaster",
	          {host: masterInfo.external_tcp_address, port: masterInfo.external_tcp_port},
	          {host: masterInfo.external_secure_tcp_address, port: masterInfo.external_secure_tcp_port});

	    default:
	      this.log.error("Unknown NotHandledReason: %s.", message.reason);
	      return new InspectionResult(InspectionDecision.Retry, "NotHandled - <unknown>");
	  }
	};

	OperationBase.prototype._inspectUnexpectedCommand = function(pkg, expectedCommand)
	{
	  if (pkg.command == expectedCommand)
	    throw new Error("Command shouldn't be " + TcpCommand.getName(pkg.command));

	  this.log.error("Unexpected TcpCommand received.\n"
	      + "Expected: %s, Actual: %s, Flags: %s, CorrelationId: %s\n"
	      + "Operation (%s): %s\n"
	      +"TcpPackage Data Dump:\n%j",
	      expectedCommand, TcpCommand.getName(pkg.command), pkg.flags, pkg.correlationId,
	      this.constructor.name, this, pkg.data);

	  this.fail(new Error(util.format("Unexpected command. Expecting %s got %s.", TcpCommand.getName(expectedCommand), TcpCommand.getName(pkg.command))));
	  return new InspectionResult(InspectionDecision.EndOperation, "Unexpected command - " + TcpCommand.getName(pkg.command));
	};


	module.exports = OperationBase;


/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(4);
	var uuid = __webpack_require__(2);

	var TcpCommand = __webpack_require__(20);
	var InspectionDecision = __webpack_require__(27);
	var InspectionResult = __webpack_require__(28);
	var ClientMessage = __webpack_require__(29);
	var WriteResult = __webpack_require__(3).WriteResult;
	var Position = __webpack_require__(3).Position;
	var WrongExpectedVersionError = __webpack_require__(35);
	var StreamDeletedError = __webpack_require__(36);
	var AccessDeniedError = __webpack_require__(37);

	var OperationBase = __webpack_require__(38);

	function AppendToStreamOperation(log, cb, requireMaster, stream, expectedVersion, events, userCredentials) {
	  OperationBase.call(this, log, cb, TcpCommand.WriteEvents, TcpCommand.WriteEventsCompleted, userCredentials);
	  this._responseType = ClientMessage.WriteEventsCompleted;

	  this._requireMaster = requireMaster;
	  this._stream = stream;
	  this._expectedVersion = expectedVersion;
	  this._events = events;
	}
	util.inherits(AppendToStreamOperation, OperationBase);

	AppendToStreamOperation.prototype._createRequestDto = function() {
	  var dtos = this._events.map(function(ev) {
	    var eventId = new Buffer(uuid.parse(ev.eventId));
	    return new ClientMessage.NewEvent({
	      event_id: eventId, event_type: ev.type,
	      data_content_type: ev.isJson ? 1 : 0, metadata_content_type: 0,
	      data: ev.data, metadata: ev.metadata});
	  });
	  return new ClientMessage.WriteEvents({
	    event_stream_id: this._stream,
	    expected_version: this._expectedVersion,
	    events: dtos,
	    require_master: this._requireMaster});
	};

	AppendToStreamOperation.prototype._inspectResponse = function(response) {
	  switch (response.result)
	  {
	    case ClientMessage.OperationResult.Success:
	      if (this._wasCommitTimeout)
	        this.log.debug("IDEMPOTENT WRITE SUCCEEDED FOR %s.", this);
	      this._succeed();
	      return new InspectionResult(InspectionDecision.EndOperation, "Success");
	    case ClientMessage.OperationResult.PrepareTimeout:
	      return new InspectionResult(InspectionDecision.Retry, "PrepareTimeout");
	    case ClientMessage.OperationResult.ForwardTimeout:
	      return new InspectionResult(InspectionDecision.Retry, "ForwardTimeout");
	    case ClientMessage.OperationResult.CommitTimeout:
	      this._wasCommitTimeout = true;
	      return new InspectionResult(InspectionDecision.Retry, "CommitTimeout");
	    case ClientMessage.OperationResult.WrongExpectedVersion:
	      this.fail(new WrongExpectedVersionError("Append", this._stream, this._expectedVersion));
	      return new InspectionResult(InspectionDecision.EndOperation, "WrongExpectedVersion");
	    case ClientMessage.OperationResult.StreamDeleted:
	      this.fail(new StreamDeletedError(this._stream));
	      return new InspectionResult(InspectionDecision.EndOperation, "StreamDeleted");
	    case ClientMessage.OperationResult.InvalidTransaction:
	      this.fail(new Error("Invalid transaction."));
	      return new InspectionResult(InspectionDecision.EndOperation, "InvalidTransaction");
	    case ClientMessage.OperationResult.AccessDenied:
	      this.fail(new AccessDeniedError("Write", this._stream));
	      return new InspectionResult(InspectionDecision.EndOperation, "AccessDenied");
	    default:
	      throw new Error("Unexpected OperationResult: " + response.result);
	  }
	};

	AppendToStreamOperation.prototype._transformResponse = function(response) {
	  return new WriteResult(response.last_event_number, new Position(response.prepare_position || -1, response.commit_position || -1));
	};

	AppendToStreamOperation.prototype.toString = function() {
	  return util.format("Stream: %s, ExpectedVersion: %d", this._stream, this._expectedVersion);
	};

	module.exports = AppendToStreamOperation;


/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(4);
	var uuid = __webpack_require__(2);

	var TcpCommand = __webpack_require__(20);
	var InspectionDecision = __webpack_require__(27);
	var InspectionResult = __webpack_require__(28);
	var ClientMessage = __webpack_require__(29);
	var EventStoreTransaction = __webpack_require__(41);
	var results = __webpack_require__(3);
	var AccessDeniedError = __webpack_require__(37);
	var WrongExpectedVersionError = __webpack_require__(35);
	var StreamDeletedError = __webpack_require__(36);
	var OperationBase = __webpack_require__(38);

	function StartTransactionOperation(log, cb, requireMaster, stream, expectedVersion, parentConnection, userCredentials) {
	  OperationBase.call(this, log, cb, TcpCommand.TransactionStart, TcpCommand.TransactionStartCompleted, userCredentials);
	  this._responseType = ClientMessage.TransactionStartCompleted;

	  this._requireMaster = requireMaster;
	  this._stream = stream;
	  this._expectedVersion = expectedVersion;
	  this._parentConnection = parentConnection;
	}
	util.inherits(StartTransactionOperation, OperationBase);

	StartTransactionOperation.prototype._createRequestDto = function() {
	  return new ClientMessage.TransactionStart(this._stream, this._expectedVersion, this._requireMaster);
	};

	StartTransactionOperation.prototype._inspectResponse = function(response) {
	  switch (response.result)
	  {
	    case ClientMessage.OperationResult.Success:
	      this._succeed();
	      return new InspectionResult(InspectionDecision.EndOperation, "Success");
	    case ClientMessage.OperationResult.PrepareTimeout:
	      return new InspectionResult(InspectionDecision.Retry, "PrepareTimeout");
	    case ClientMessage.OperationResult.CommitTimeout:
	      return new InspectionResult(InspectionDecision.Retry, "CommitTimeout");
	    case ClientMessage.OperationResult.ForwardTimeout:
	      return new InspectionResult(InspectionDecision.Retry, "ForwardTimeout");
	    case ClientMessage.OperationResult.WrongExpectedVersion:
	      this.fail(new WrongExpectedVersionError("Start transaction", this._stream, this._expectedVersion));
	      return new InspectionResult(InspectionDecision.EndOperation, "WrongExpectedVersion");
	    case ClientMessage.OperationResult.StreamDeleted:
	      this.fail(new StreamDeletedError(this._stream));
	      return new InspectionResult(InspectionDecision.EndOperation, "StreamDeleted");
	    case ClientMessage.OperationResult.InvalidTransaction:
	      this.fail(new Error("Invalid transaction."));
	      return new InspectionResult(InspectionDecision.EndOperation, "InvalidTransaction");
	    case ClientMessage.OperationResult.AccessDenied:
	      this.fail(new AccessDeniedError("Write", this._stream));
	      return new InspectionResult(InspectionDecision.EndOperation, "AccessDenied");
	    default:
	      throw new Error(util.format("Unexpected OperationResult: %s.", response.result));
	  }
	};

	StartTransactionOperation.prototype._transformResponse = function(response) {
	  return new EventStoreTransaction(response.transaction_id, this.userCredentials, this._parentConnection);
	};

	StartTransactionOperation.prototype.toString = function() {
	  return util.format("Stream: %s, ExpectedVersion: %d", this._stream, this._expectedVersion);
	};

	module.exports = StartTransactionOperation;


/***/ },
/* 41 */
/***/ function(module, exports) {

	/**
	 * @param {number} transactionId
	 * @param {UserCredentials} userCredentials
	 * @param {EventStoreNodeConnection} connection
	 * @constructor
	 * @property {number} transactionId
	 */
	function EventStoreTransaction(transactionId, userCredentials, connection) {
	  this._transactionId = transactionId;
	  this._userCredentials = userCredentials;
	  this._connection = connection;

	  this._isCommitted = false;
	  this._isRolledBack = false;

	  Object.defineProperties(this, {
	    transactionId: {
	      enumerable: true, get: function() { return this._transactionId; }
	    }
	  });
	}

	/**
	 * Commit (async)
	 * @returns {Promise.<WriteResult>}
	 */
	EventStoreTransaction.prototype.commit = function() {
	  if (this._isRolledBack) throw new Error("Can't commit a rolledback transaction.");
	  if (this._isCommitted) throw new Error("Transaction is already committed.");
	  this._isCommitted = true;
	  return this._connection.commitTransaction(this, this._userCredentials);
	};

	/**
	 * Write events (async)
	 * @param {EventData|EventData[]} eventOrEvents
	 * @returns {Promise}
	 */
	EventStoreTransaction.prototype.write = function(eventOrEvents) {
	  if (this._isRolledBack) throw new Error("can't write to a rolledback transaction");
	  if (this._isCommitted) throw new Error("Transaction is already committed");
	  var events = Array.isArray(eventOrEvents) ? eventOrEvents : [eventOrEvents];
	  return this._connection.transactionalWrite(this, events);
	};

	/**
	 * Rollback
	 */
	EventStoreTransaction.prototype.rollback = function() {
	  if (this._isCommitted) throw new Error("Transaction is already committed");
	  this._isRolledBack = true;
	};

	module.exports = EventStoreTransaction;

/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(4);
	var uuid = __webpack_require__(2);

	var TcpCommand = __webpack_require__(20);
	var InspectionDecision = __webpack_require__(27);
	var InspectionResult = __webpack_require__(28);
	var ClientMessage = __webpack_require__(29);
	var AccessDeniedError = __webpack_require__(37);

	var OperationBase = __webpack_require__(38);


	function TransactionalWriteOperation(log, cb, requireMaster, transactionId, events, userCredentials) {
	  OperationBase.call(this, log, cb, TcpCommand.TransactionWrite, TcpCommand.TransactionWriteCompleted, userCredentials);
	  this._responseType = ClientMessage.TransactionWriteCompleted;

	  this._requireMaster = requireMaster;
	  this._transactionId = transactionId;
	  this._events = events;
	}
	util.inherits(TransactionalWriteOperation, OperationBase);

	TransactionalWriteOperation.prototype._createRequestDto = function() {
	  var dtos = this._events.map(function(ev) {
	    var eventId = new Buffer(uuid.parse(ev.eventId));
	    return new ClientMessage.NewEvent({
	      event_id: eventId, event_type: ev.type,
	      data_content_type: ev.isJson ? 1 : 0, metadata_content_type: 0,
	      data: ev.data, metadata: ev.metadata});
	  });
	  return new ClientMessage.TransactionWrite(this._transactionId, dtos, this._requireMaster);
	};

	TransactionalWriteOperation.prototype._inspectResponse = function(response) {
	  switch (response.result)
	  {
	    case ClientMessage.OperationResult.Success:
	      this._succeed();
	      return new InspectionResult(InspectionDecision.EndOperation, "Success");
	    case ClientMessage.OperationResult.PrepareTimeout:
	      return new InspectionResult(InspectionDecision.Retry, "PrepareTimeout");
	    case ClientMessage.OperationResult.CommitTimeout:
	      return new InspectionResult(InspectionDecision.Retry, "CommitTimeout");
	    case ClientMessage.OperationResult.ForwardTimeout:
	      return new InspectionResult(InspectionDecision.Retry, "ForwardTimeout");
	    case ClientMessage.OperationResult.AccessDenied:
	      this.fail(new AccessDeniedError("Write", "trx:" + this._transactionId));
	      return new InspectionResult(InspectionDecision.EndOperation, "AccessDenied");
	    default:
	      throw new Error(util.format("Unexpected OperationResult: %s.", response.result));
	  }
	};

	TransactionalWriteOperation.prototype._transformResponse = function(response) {
	  return null;
	};

	TransactionalWriteOperation.prototype.toString = function() {
	  return util.format("TransactionId: %s", this._transactionId);
	};

	module.exports = TransactionalWriteOperation;



/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(4);
	var uuid = __webpack_require__(2);

	var TcpCommand = __webpack_require__(20);
	var InspectionDecision = __webpack_require__(27);
	var InspectionResult = __webpack_require__(28);
	var ClientMessage = __webpack_require__(29);
	var results = __webpack_require__(3);
	var WrongExpectedVersionError = __webpack_require__(35);
	var StreamDeletedError = __webpack_require__(36);
	var AccessDeniedError = __webpack_require__(37);

	var OperationBase = __webpack_require__(38);


	function CommitTransactionOperation(log, cb, requireMaster, transactionId, userCredentials) {
	  OperationBase.call(this, log, cb, TcpCommand.TransactionCommit, TcpCommand.TransactionCommitCompleted, userCredentials);
	  this._responseType = ClientMessage.TransactionCommitCompleted;

	  this._requireMaster = requireMaster;
	  this._transactionId = transactionId;
	}
	util.inherits(CommitTransactionOperation, OperationBase);

	CommitTransactionOperation.prototype._createRequestDto = function() {
	  return new ClientMessage.TransactionCommit(this._transactionId, this._requireMaster);
	};

	CommitTransactionOperation.prototype._inspectResponse = function(response) {
	  switch (response.result)
	  {
	    case ClientMessage.OperationResult.Success:
	      this._succeed();
	      return new InspectionResult(InspectionDecision.EndOperation, "Success");
	    case ClientMessage.OperationResult.PrepareTimeout:
	      return new InspectionResult(InspectionDecision.Retry, "PrepareTimeout");
	    case ClientMessage.OperationResult.CommitTimeout:
	      return new InspectionResult(InspectionDecision.Retry, "CommitTimeout");
	    case ClientMessage.OperationResult.ForwardTimeout:
	      return new InspectionResult(InspectionDecision.Retry, "ForwardTimeout");
	    case ClientMessage.OperationResult.WrongExpectedVersion:
	      this.fail(new WrongExpectedVersionError("Commit", this._transactionId));
	      return new InspectionResult(InspectionDecision.EndOperation, "WrongExpectedVersion");
	    case ClientMessage.OperationResult.StreamDeleted:
	      this.fail(new StreamDeletedError(this._transactionId));
	      return new InspectionResult(InspectionDecision.EndOperation, "StreamDeleted");
	    case ClientMessage.OperationResult.InvalidTransaction:
	      this.fail(new Error("Invalid transaction."));
	      return new InspectionResult(InspectionDecision.EndOperation, "InvalidTransaction");
	    case ClientMessage.OperationResult.AccessDenied:
	      this.fail(new AccessDeniedError("Write", this._transactionId));
	      return new InspectionResult(InspectionDecision.EndOperation, "AccessDenied");
	    default:
	      throw new Error(util.format("Unexpected OperationResult: %s.", response.result));
	  }
	};

	CommitTransactionOperation.prototype._transformResponse = function(response) {
	  var logPosition = new results.Position(response.prepare_position || -1, response.commit_position || -1);
	  return new results.WriteResult(response.last_event_number, logPosition);
	};

	CommitTransactionOperation.prototype.toString = function() {
	  return util.format("TransactionId: %s", this._transactionId);
	};

	module.exports = CommitTransactionOperation;

/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(4);

	var TcpCommand = __webpack_require__(20);
	var ClientMessage = __webpack_require__(29);
	var InspectionResult = __webpack_require__(28);
	var InspectionDecision = __webpack_require__(27);
	var results = __webpack_require__(3);
	var AccessDeniedError = __webpack_require__(37);

	var OperationBase = __webpack_require__(38);

	function ReadEventOperation(log, cb, stream, eventNumber, resolveLinkTos, requireMaster, userCredentials) {
	  OperationBase.call(this, log, cb, TcpCommand.ReadEvent, TcpCommand.ReadEventCompleted, userCredentials);
	  this._responseType = ClientMessage.ReadEventCompleted;

	  this._stream = stream;
	  this._eventNumber = eventNumber;
	  this._resolveLinkTos = resolveLinkTos;
	  this._requireMaster = requireMaster;
	}
	util.inherits(ReadEventOperation, OperationBase);

	ReadEventOperation.prototype._createRequestDto = function() {
	  return new ClientMessage.ReadEvent(this._stream, this._eventNumber, this._resolveLinkTos, this._requireMaster);
	};

	ReadEventOperation.prototype._inspectResponse = function(response) {
	  switch (response.result)
	  {
	    case ClientMessage.ReadEventCompleted.ReadEventResult.Success:
	      this._succeed();
	      return new InspectionResult(InspectionDecision.EndOperation, "Success");
	    case ClientMessage.ReadEventCompleted.ReadEventResult.NotFound:
	      this._succeed();
	      return new InspectionResult(InspectionDecision.EndOperation, "NotFound");
	    case ClientMessage.ReadEventCompleted.ReadEventResult.NoStream:
	      this._succeed();
	      return new InspectionResult(InspectionDecision.EndOperation, "NoStream");
	    case ClientMessage.ReadEventCompleted.ReadEventResult.StreamDeleted:
	      this._succeed();
	      return new InspectionResult(InspectionDecision.EndOperation, "StreamDeleted");
	    case ClientMessage.ReadEventCompleted.ReadEventResult.Error:
	      this.fail(new Error("Server error: " + response.error));
	      return new InspectionResult(InspectionDecision.EndOperation, "Error");
	    case ClientMessage.ReadEventCompleted.ReadEventResult.AccessDenied:
	      this.fail(new AccessDeniedError("Read", this._stream));
	      return new InspectionResult(InspectionDecision.EndOperation, "AccessDenied");
	    default:
	      throw new Error(util.format("Unexpected ReadEventResult: %s.", response.result));
	  }
	};

	ReadEventOperation.prototype._transformResponse = function(response) {
	  return new results.EventReadResult(convert(response.result), this._stream, this._eventNumber, response.event);
	};


	function convert(result)
	{
	  switch (result)
	  {
	    case ClientMessage.ReadEventCompleted.ReadEventResult.Success:
	      return results.EventReadStatus.Success;
	    case ClientMessage.ReadEventCompleted.ReadEventResult.NotFound:
	      return results.EventReadStatus.NotFound;
	    case ClientMessage.ReadEventCompleted.ReadEventResult.NoStream:
	      return results.EventReadStatus.NoStream;
	    case ClientMessage.ReadEventCompleted.ReadEventResult.StreamDeleted:
	      return results.EventReadStatus.StreamDeleted;
	    default:
	      throw new Error(util.format("Unexpected ReadEventResult: %s.", result));
	  }
	}

	ReadEventOperation.prototype.toString = function() {
	  return util.format("Stream: %s, EventNumber: %s, ResolveLinkTo: %s, RequireMaster: %s",
	      this._stream, this._eventNumber, this._resolveLinkTos, this._requireMaster);
	};

	module.exports = ReadEventOperation;


/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(4);
	var uuid = __webpack_require__(2);

	var TcpCommand = __webpack_require__(20);
	var ClientMessage = __webpack_require__(29);
	var ReadDirection = __webpack_require__(46);
	var StatusCode = __webpack_require__(47);
	var InspectionResult = __webpack_require__(28);
	var InspectionDecision = __webpack_require__(27);
	var results = __webpack_require__(3);
	var AccessDeniedError = __webpack_require__(37);

	var OperationBase = __webpack_require__(38);

	function ReadStreamEventsForwardOperation(
	    log, cb, stream, fromEventNumber, maxCount, resolveLinkTos, requireMaster, userCredentials
	) {
	  OperationBase.call(this, log, cb, TcpCommand.ReadStreamEventsForward, TcpCommand.ReadStreamEventsForwardCompleted, userCredentials);
	  this._responseType = ClientMessage.ReadStreamEventsCompleted;

	  this._stream = stream;
	  this._fromEventNumber = fromEventNumber;
	  this._maxCount = maxCount;
	  this._resolveLinkTos = resolveLinkTos;
	  this._requireMaster = requireMaster;
	}
	util.inherits(ReadStreamEventsForwardOperation, OperationBase);

	ReadStreamEventsForwardOperation.prototype._createRequestDto = function() {
	  return new ClientMessage.ReadStreamEvents(this._stream, this._fromEventNumber, this._maxCount, this._resolveLinkTos, this._requireMaster);
	};

	ReadStreamEventsForwardOperation.prototype._inspectResponse = function(response) {
	  switch (response.result)
	  {
	    case ClientMessage.ReadStreamEventsCompleted.ReadStreamResult.Success:
	      this._succeed();
	      return new InspectionResult(InspectionDecision.EndOperation, "Success");
	    case ClientMessage.ReadStreamEventsCompleted.ReadStreamResult.StreamDeleted:
	      this._succeed();
	      return new InspectionResult(InspectionDecision.EndOperation, "StreamDeleted");
	    case ClientMessage.ReadStreamEventsCompleted.ReadStreamResult.NoStream:
	      this._succeed();
	      return new InspectionResult(InspectionDecision.EndOperation, "NoStream");
	    case ClientMessage.ReadStreamEventsCompleted.ReadStreamResult.Error:
	      this.fail(new Error("Server error: " + response.error));
	      return new InspectionResult(InspectionDecision.EndOperation, "Error");
	    case ClientMessage.ReadStreamEventsCompleted.ReadStreamResult.AccessDenied:
	      this.fail(new AccessDeniedError("Read", this._stream));
	      return new InspectionResult(InspectionDecision.EndOperation, "AccessDenied");
	    default:
	      throw new Error(util.format("Unexpected ReadStreamResult: %s.", response.result));
	  }
	};

	ReadStreamEventsForwardOperation.prototype._transformResponse = function(response) {
	  return new results.StreamEventsSlice(
	      StatusCode.convert(response.result),
	      this._stream,
	      this._fromEventNumber,
	      ReadDirection.Forward,
	      response.events,
	      response.next_event_number,
	      response.last_event_number,
	      response.is_end_of_stream
	  )
	};

	ReadStreamEventsForwardOperation.prototype.toString = function() {
	  return util.format("Stream: %s, FromEventNumber: %d, MaxCount: %d, ResolveLinkTos: %s, RequireMaster: %s",
	      this._stream, this._fromEventNumber, this._maxCount, this._resolveLinkTos, this._requireMaster);
	};

	module.exports = ReadStreamEventsForwardOperation;


/***/ },
/* 46 */
/***/ function(module, exports) {

	const ReadDirection = {
	  Forward: 'forward',
	  Backward: 'backward'
	};

	module.exports = ReadDirection;


/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	var ClientMessage = __webpack_require__(29);
	var SliceReadStatus = __webpack_require__(48);

	module.exports = {};

	module.exports.convert = function(code) {
	  switch(code) {
	    case ClientMessage.ReadStreamEventsCompleted.ReadStreamResult.Success:
	      return SliceReadStatus.Success;
	    case ClientMessage.ReadStreamEventsCompleted.ReadStreamResult.NoStream:
	      return SliceReadStatus.StreamNotFound;
	    case ClientMessage.ReadStreamEventsCompleted.ReadStreamResult.StreamDeleted:
	      return SliceReadStatus.StreamDeleted;
	    default:
	      throw new Error('Invalid code: ' + code)
	  }
	};

/***/ },
/* 48 */
/***/ function(module, exports) {

	const SliceReadStatus = {
	  Success: 'success',
	  StreamNotFound: 'streamNotFound',
	  StreamDeleted: 'streamDeleted'
	};

	module.exports = SliceReadStatus;


/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(4);
	var uuid = __webpack_require__(2);

	var TcpCommand = __webpack_require__(20);
	var ClientMessage = __webpack_require__(29);
	var ReadDirection = __webpack_require__(46);
	var StatusCode = __webpack_require__(47);
	var InspectionResult = __webpack_require__(28);
	var InspectionDecision = __webpack_require__(27);
	var results = __webpack_require__(3);
	var AccessDeniedError = __webpack_require__(37);

	var OperationBase = __webpack_require__(38);

	function ReadStreamEventsBackwardOperation(
	    log, cb, stream, fromEventNumber, maxCount, resolveLinkTos, requireMaster, userCredentials
	) {
	  OperationBase.call(this, log, cb, TcpCommand.ReadStreamEventsBackward, TcpCommand.ReadStreamEventsBackwardCompleted, userCredentials);
	  this._responseType = ClientMessage.ReadStreamEventsCompleted;

	  this._stream = stream;
	  this._fromEventNumber = fromEventNumber;
	  this._maxCount = maxCount;
	  this._resolveLinkTos = resolveLinkTos;
	  this._requireMaster = requireMaster;
	}
	util.inherits(ReadStreamEventsBackwardOperation, OperationBase);

	ReadStreamEventsBackwardOperation.prototype._createRequestDto = function() {
	  return new ClientMessage.ReadStreamEvents(this._stream, this._fromEventNumber, this._maxCount, this._resolveLinkTos, this._requireMaster);
	};

	ReadStreamEventsBackwardOperation.prototype._inspectResponse = function(response) {
	  switch (response.result)
	  {
	    case ClientMessage.ReadStreamEventsCompleted.ReadStreamResult.Success:
	      this._succeed();
	      return new InspectionResult(InspectionDecision.EndOperation, "Success");
	    case ClientMessage.ReadStreamEventsCompleted.ReadStreamResult.StreamDeleted:
	      this._succeed();
	      return new InspectionResult(InspectionDecision.EndOperation, "StreamDeleted");
	    case ClientMessage.ReadStreamEventsCompleted.ReadStreamResult.NoStream:
	      this._succeed();
	      return new InspectionResult(InspectionDecision.EndOperation, "NoStream");
	    case ClientMessage.ReadStreamEventsCompleted.ReadStreamResult.Error:
	      this.fail(new Error("Server error: " + response.error));
	      return new InspectionResult(InspectionDecision.EndOperation, "Error");
	    case ClientMessage.ReadStreamEventsCompleted.ReadStreamResult.AccessDenied:
	      this.fail(new AccessDeniedError("Read", this._stream));
	      return new InspectionResult(InspectionDecision.EndOperation, "AccessDenied");
	    default:
	      throw new Error(util.format("Unexpected ReadStreamResult: %s.", response.result));
	  }
	};

	ReadStreamEventsBackwardOperation.prototype._transformResponse = function(response) {
	  return new results.StreamEventsSlice(
	      StatusCode.convert(response.result),
	      this._stream,
	      this._fromEventNumber,
	      ReadDirection.Backward,
	      response.events,
	      response.next_event_number,
	      response.last_event_number,
	      response.is_end_of_stream
	  )
	};

	ReadStreamEventsBackwardOperation.prototype.toString = function() {
	  return util.format("Stream: %s, FromEventNumber: %d, MaxCount: %d, ResolveLinkTos: %s, RequireMaster: %s",
	      this._stream, this._fromEventNumber, this._maxCount, this._resolveLinkTos, this._requireMaster);
	};

	module.exports = ReadStreamEventsBackwardOperation;


/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(4);
	var uuid = __webpack_require__(2);

	var TcpCommand = __webpack_require__(20);
	var ClientMessage = __webpack_require__(29);
	var ReadDirection = __webpack_require__(46);
	var InspectionResult = __webpack_require__(28);
	var InspectionDecision = __webpack_require__(27);
	var results = __webpack_require__(3);
	var AccessDeniedError = __webpack_require__(37);

	var OperationBase = __webpack_require__(38);

	function ReadAllEventsForwardOperation(
	    log, cb, position, maxCount, resolveLinkTos, requireMaster, userCredentials
	) {
	  OperationBase.call(this, log, cb, TcpCommand.ReadAllEventsForward, TcpCommand.ReadAllEventsForwardCompleted, userCredentials);
	  this._responseType = ClientMessage.ReadAllEventsCompleted;

	  this._position = position;
	  this._maxCount = maxCount;
	  this._resolveLinkTos = resolveLinkTos;
	  this._requireMaster = requireMaster;
	}
	util.inherits(ReadAllEventsForwardOperation, OperationBase);

	ReadAllEventsForwardOperation.prototype._createRequestDto = function() {
	  return new ClientMessage.ReadAllEvents(this._position.commitPosition, this._position.preparePosition, this._maxCount, this._resolveLinkTos, this._requireMaster);
	};

	ReadAllEventsForwardOperation.prototype._inspectResponse = function(response) {
	  switch (response.result)
	  {
	    case ClientMessage.ReadAllEventsCompleted.ReadAllResult.Success:
	      this._succeed();
	      return new InspectionResult(InspectionDecision.EndOperation, "Success");
	    case ClientMessage.ReadAllEventsCompleted.ReadAllResult.Error:
	      this.fail(new Error("Server error: " + response.error));
	      return new InspectionResult(InspectionDecision.EndOperation, "Error");
	    case ClientMessage.ReadAllEventsCompleted.ReadAllResult.AccessDenied:
	      this.fail(new AccessDeniedError("Read", "$all"));
	      return new InspectionResult(InspectionDecision.EndOperation, "AccessDenied");
	    default:
	      throw new Error(util.format("Unexpected ReadStreamResult: %s.", response.result));
	  }
	};

	ReadAllEventsForwardOperation.prototype._transformResponse = function(response) {
	  return new results.AllEventsSlice(
	      ReadDirection.Forward,
	      new results.Position(response.commit_position, response.prepare_position),
	      new results.Position(response.next_commit_position, response.next_prepare_position),
	      response.events
	  )
	};

	ReadAllEventsForwardOperation.prototype.toString = function() {
	  return util.format("Position: %j, MaxCount: %d, ResolveLinkTos: %s, RequireMaster: %s",
	      this._position, this._maxCount, this._resolveLinkTos, this._requireMaster);
	};

	module.exports = ReadAllEventsForwardOperation;


/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(4);
	var uuid = __webpack_require__(2);

	var TcpCommand = __webpack_require__(20);
	var ClientMessage = __webpack_require__(29);
	var ReadDirection = __webpack_require__(46);
	var InspectionResult = __webpack_require__(28);
	var InspectionDecision = __webpack_require__(27);
	var results = __webpack_require__(3);
	var AccessDeniedError = __webpack_require__(37);

	var OperationBase = __webpack_require__(38);

	function ReadAllEventsBackwardOperation(
	    log, cb, position, maxCount, resolveLinkTos, requireMaster, userCredentials
	) {
	  OperationBase.call(this, log, cb, TcpCommand.ReadAllEventsBackward, TcpCommand.ReadAllEventsBackwardCompleted, userCredentials);
	  this._responseType = ClientMessage.ReadAllEventsCompleted;

	  this._position = position;
	  this._maxCount = maxCount;
	  this._resolveLinkTos = resolveLinkTos;
	  this._requireMaster = requireMaster;
	}
	util.inherits(ReadAllEventsBackwardOperation, OperationBase);

	ReadAllEventsBackwardOperation.prototype._createRequestDto = function() {
	  return new ClientMessage.ReadAllEvents(this._position.commitPosition, this._position.preparePosition, this._maxCount, this._resolveLinkTos, this._requireMaster);
	};

	ReadAllEventsBackwardOperation.prototype._inspectResponse = function(response) {
	  switch (response.result)
	  {
	    case ClientMessage.ReadAllEventsCompleted.ReadAllResult.Success:
	      this._succeed();
	      return new InspectionResult(InspectionDecision.EndOperation, "Success");
	    case ClientMessage.ReadAllEventsCompleted.ReadAllResult.Error:
	      this.fail(new Error("Server error: " + response.error));
	      return new InspectionResult(InspectionDecision.EndOperation, "Error");
	    case ClientMessage.ReadAllEventsCompleted.ReadAllResult.AccessDenied:
	      this.fail(new AccessDeniedError("Read", "$all"));
	      return new InspectionResult(InspectionDecision.EndOperation, "AccessDenied");
	    default:
	      throw new Error(util.format("Unexpected ReadStreamResult: %s.", response.result));
	  }
	};

	ReadAllEventsBackwardOperation.prototype._transformResponse = function(response) {
	  return new results.AllEventsSlice(
	      ReadDirection.Backward,
	      new results.Position(response.commit_position, response.prepare_position),
	      new results.Position(response.next_commit_position, response.next_prepare_position),
	      response.events
	  )
	};

	ReadAllEventsBackwardOperation.prototype.toString = function() {
	  return util.format("Position: %j, MaxCount: %d, ResolveLinkTos: %s, RequireMaster: %s",
	      this._position, this._maxCount, this._resolveLinkTos, this._requireMaster);
	};

	module.exports = ReadAllEventsBackwardOperation;


/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(4);
	var uuid = __webpack_require__(2);

	var ensure = __webpack_require__(6);
	var OperationBase = __webpack_require__(38);
	var TcpCommand = __webpack_require__(20);
	var ClientMessage = __webpack_require__(29);
	var SystemConsumerStrategies = __webpack_require__(53);
	var InspectionDecision = __webpack_require__(27);
	var InspectionResult = __webpack_require__(28);
	var results = __webpack_require__(3);


	function CreatePersistentSubscriptionOperation(log, cb, stream, groupName, settings, userCredentials) {
	  OperationBase.call(this, log, cb, TcpCommand.CreatePersistentSubscription, TcpCommand.CreatePersistentSubscriptionCompleted, userCredentials);

	  ensure.notNull(settings, "settings");
	  this._resolveLinkTos = settings.resolveLinkTos;
	  this._stream = stream;
	  this._groupName = groupName;
	  this._startFromBeginning = settings.startFrom;
	  this._maxRetryCount = settings.maxRetryCount;
	  this._liveBufferSize = settings.liveBufferSize;
	  this._readBatchSize = settings.readBatchSize;
	  this._bufferSize = settings.historyBufferSize;
	  this._recordStatistics = settings.extraStatistics;
	  this._messageTimeoutMilliseconds = settings.messageTimeout;
	  this._checkPointAfter = settings.checkPointAfter;
	  this._minCheckPointCount = settings.minCheckPointCount;
	  this._maxCheckPointCount = settings.maxCheckPointCount;
	  this._maxSubscriberCount = settings.maxSubscriberCount;
	  this._namedConsumerStrategy = settings.namedConsumerStrategy;

	  this._responseType = ClientMessage.CreatePersistentSubscriptionCompleted;
	}
	util.inherits(CreatePersistentSubscriptionOperation, OperationBase);

	CreatePersistentSubscriptionOperation.prototype._createRequestDto = function() {
	  return new ClientMessage.CreatePersistentSubscription(this._groupName, this._stream, this._resolveLinkTos,
	      this._startFromBeginning, this._messageTimeoutMilliseconds, this._recordStatistics, this._liveBufferSize,
	      this._readBatchSize, this._bufferSize, this._maxRetryCount,
	      this._namedConsumerStrategy == SystemConsumerStrategies.RoundRobin, this._checkPointAfter,
	      this._maxCheckPointCount, this._minCheckPointCount, this._maxSubscriberCount, this._namedConsumerStrategy);
	};

	CreatePersistentSubscriptionOperation.prototype._inspectResponse = function(response) {
	  switch (response.result)
	  {
	    case ClientMessage.CreatePersistentSubscriptionCompleted.CreatePersistentSubscriptionResult.Success:
	      this._succeed();
	      return new InspectionResult(InspectionDecision.EndOperation, "Success");
	    case ClientMessage.CreatePersistentSubscriptionCompleted.CreatePersistentSubscriptionResult.Fail:
	      this.fail(new Error(util.format("Subscription group %s on stream %s failed '%s'", this._groupName, this._stream, response.reason)));
	      return new InspectionResult(InspectionDecision.EndOperation, "Fail");
	    case ClientMessage.CreatePersistentSubscriptionCompleted.CreatePersistentSubscriptionResult.AccessDenied:
	      this.fail(new Error(util.format("Write access denied for stream '%s'.", this._stream)));
	      return new InspectionResult(InspectionDecision.EndOperation, "AccessDenied");
	    case ClientMessage.CreatePersistentSubscriptionCompleted.CreatePersistentSubscriptionResult.AlreadyExists:
	      this.fail(new Error(util.format("Subscription group %s on stream %s already exists", this._groupName, this._stream)));
	      return new InspectionResult(InspectionDecision.EndOperation, "AlreadyExists");
	    default:
	      throw new Error(util.format("Unexpected OperationResult: %s.", response.result));
	  }
	};

	CreatePersistentSubscriptionOperation.prototype._transformResponse = function(response) {
	  return new results.PersistentSubscriptionCreateResult(results.PersistentSubscriptionCreateStatus.Success);
	};

	CreatePersistentSubscriptionOperation.prototype.toString = function() {
	  return util.format("Stream: %s, Group Name: %s", this._stream, this._groupName);
	};

	module.exports = CreatePersistentSubscriptionOperation;


/***/ },
/* 53 */
/***/ function(module, exports) {

	const SystemConsumerStrategies = {
	  DispatchToSingle: 'DispatchToSingle',
	  RoundRobin: 'RoundRobin',
	  Pinned: 'Pinned'
	};

	module.exports = SystemConsumerStrategies;


/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(4);
	var uuid = __webpack_require__(2);

	var ensure = __webpack_require__(6);
	var OperationBase = __webpack_require__(38);
	var TcpCommand = __webpack_require__(20);
	var ClientMessage = __webpack_require__(29);
	var SystemConsumerStrategies = __webpack_require__(53);
	var InspectionDecision = __webpack_require__(27);
	var InspectionResult = __webpack_require__(28);
	var results = __webpack_require__(3);


	function UpdatePersistentSubscriptionOperation(log, cb, stream, groupName, settings, userCredentials) {
	  OperationBase.call(this, log, cb, TcpCommand.UpdatePersistentSubscription, TcpCommand.UpdatePersistentSubscriptionCompleted, userCredentials);

	  ensure.notNull(settings, "settings");
	  this._resolveLinkTos = settings.resolveLinkTos;
	  this._stream = stream;
	  this._groupName = groupName;
	  this._startFromBeginning = settings.startFrom;
	  this._maxRetryCount = settings.maxRetryCount;
	  this._liveBufferSize = settings.liveBufferSize;
	  this._readBatchSize = settings.readBatchSize;
	  this._bufferSize = settings.historyBufferSize;
	  this._recordStatistics = settings.extraStatistics;
	  this._messageTimeoutMilliseconds = settings.messageTimeout;
	  this._checkPointAfter = settings.checkPointAfter;
	  this._minCheckPointCount = settings.minCheckPointCount;
	  this._maxCheckPointCount = settings.maxCheckPointCount;
	  this._maxSubscriberCount = settings.maxSubscriberCount;
	  this._namedConsumerStrategy = settings.namedConsumerStrategy;

	  this._responseType = ClientMessage.UpdatePersistentSubscriptionCompleted;
	}
	util.inherits(UpdatePersistentSubscriptionOperation, OperationBase);

	UpdatePersistentSubscriptionOperation.prototype._createRequestDto = function() {
	  return new ClientMessage.UpdatePersistentSubscription(this._groupName, this._stream, this._resolveLinkTos,
	      this._startFromBeginning, this._messageTimeoutMilliseconds, this._recordStatistics, this._liveBufferSize,
	      this._readBatchSize, this._bufferSize, this._maxRetryCount,
	      this._namedConsumerStrategy == SystemConsumerStrategies.RoundRobin, this._checkPointAfter,
	      this._maxCheckPointCount, this._minCheckPointCount, this._maxSubscriberCount, this._namedConsumerStrategy);
	};

	UpdatePersistentSubscriptionOperation.prototype._inspectResponse = function(response) {
	  switch (response.result)
	  {
	    case ClientMessage.UpdatePersistentSubscriptionCompleted.UpdatePersistentSubscriptionResult.Success:
	      this._succeed();
	      return new InspectionResult(InspectionDecision.EndOperation, "Success");
	    case ClientMessage.UpdatePersistentSubscriptionCompleted.UpdatePersistentSubscriptionResult.Fail:
	      this.fail(new Error(util.format("Subscription group %s on stream %s failed '%s'", this._groupName, this._stream, response.reason)));
	      return new InspectionResult(InspectionDecision.EndOperation, "Fail");
	    case ClientMessage.UpdatePersistentSubscriptionCompleted.UpdatePersistentSubscriptionResult.AccessDenied:
	      this.fail(new Error(util.format("Write access denied for stream '%s'.", this._stream)));
	      return new InspectionResult(InspectionDecision.EndOperation, "AccessDenied");
	    case ClientMessage.UpdatePersistentSubscriptionCompleted.UpdatePersistentSubscriptionResult.DoesNotExist:
	      this.fail(new Error(util.format("Subscription group %s on stream %s does not exist", this._groupName, this._stream)));
	      return new InspectionResult(InspectionDecision.EndOperation, "DoesNotExist");
	    default:
	      throw new Error(util.format("Unexpected OperationResult: %s.", response.result));
	  }
	};

	UpdatePersistentSubscriptionOperation.prototype._transformResponse = function(response) {
	  return new results.PersistentSubscriptionUpdateResult(results.PersistentSubscriptionUpdateStatus.Success);
	};

	UpdatePersistentSubscriptionOperation.prototype.toString = function() {
	  return util.format("Stream: %s, Group Name: %s", this._stream, this._groupName);
	};

	module.exports = UpdatePersistentSubscriptionOperation;


/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(4);
	var uuid = __webpack_require__(2);

	var ensure = __webpack_require__(6);
	var OperationBase = __webpack_require__(38);
	var TcpCommand = __webpack_require__(20);
	var ClientMessage = __webpack_require__(29);
	var InspectionDecision = __webpack_require__(27);
	var InspectionResult = __webpack_require__(28);
	var results = __webpack_require__(3);


	function DeletePersistentSubscriptionOperation(log, cb, stream, groupName, userCredentials) {
	  OperationBase.call(this, log, cb, TcpCommand.DeletePersistentSubscription, TcpCommand.DeletePersistentSubscriptionCompleted, userCredentials);

	  this._stream = stream;
	  this._groupName = groupName;

	  this._responseType = ClientMessage.DeletePersistentSubscriptionCompleted;
	}
	util.inherits(DeletePersistentSubscriptionOperation, OperationBase);

	DeletePersistentSubscriptionOperation.prototype._createRequestDto = function() {
	  return new ClientMessage.DeletePersistentSubscription(this._groupName, this._stream);
	};

	DeletePersistentSubscriptionOperation.prototype._inspectResponse = function(response) {
	  switch (response.result)
	  {
	    case ClientMessage.DeletePersistentSubscriptionCompleted.DeletePersistentSubscriptionResult.Success:
	      this._succeed();
	      return new InspectionResult(InspectionDecision.EndOperation, "Success");
	    case ClientMessage.DeletePersistentSubscriptionCompleted.DeletePersistentSubscriptionResult.Fail:
	      this.fail(new Error(util.format("Subscription group %s on stream %s failed '%s'", this._groupName, this._stream, response.reason)));
	      return new InspectionResult(InspectionDecision.EndOperation, "Fail");
	    case ClientMessage.DeletePersistentSubscriptionCompleted.DeletePersistentSubscriptionResult.AccessDenied:
	      this.fail(new Error(util.format("Write access denied for stream '%s'.", this._stream)));
	      return new InspectionResult(InspectionDecision.EndOperation, "AccessDenied");
	    case ClientMessage.DeletePersistentSubscriptionCompleted.DeletePersistentSubscriptionResult.DoesNotExist:
	      this.fail(new Error(util.format("Subscription group %s on stream %s does not exist", this._groupName, this._stream)));
	      return new InspectionResult(InspectionDecision.EndOperation, "DoesNotExist");
	    default:
	      throw new Error(util.format("Unexpected OperationResult: %s.", response.result));
	  }
	};

	DeletePersistentSubscriptionOperation.prototype._transformResponse = function(response) {
	  return new results.PersistentSubscriptionDeleteResult(results.PersistentSubscriptionDeleteStatus.Success);
	};

	DeletePersistentSubscriptionOperation.prototype.toString = function() {
	  return util.format("Stream: %s, Group Name: %s", this._stream, this._groupName);
	};

	module.exports = DeletePersistentSubscriptionOperation;


/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(4);

	var EventStoreCatchUpSubscription = __webpack_require__(57);
	var SliceReadStatus = __webpack_require__(48);

	function EventStoreStreamCatchUpSubscription(
	    connection, log, streamId, fromEventNumberExclusive, resolveLinkTos, userCredentials,
	    eventAppeared, liveProcessingStarted, subscriptionDropped,
	    verboseLogging, readBatchSize
	){
	  EventStoreCatchUpSubscription.call(this, connection, log, streamId, resolveLinkTos, userCredentials,
	                                           eventAppeared, liveProcessingStarted, subscriptionDropped,
	                                           verboseLogging, readBatchSize);

	  //Ensure.NotNullOrEmpty(streamId, "streamId");

	  this._lastProcessedEventNumber = fromEventNumberExclusive || -1;
	  this._nextReadEventNumber = fromEventNumberExclusive || 0;
	}
	util.inherits(EventStoreStreamCatchUpSubscription, EventStoreCatchUpSubscription);

	EventStoreStreamCatchUpSubscription.prototype._readEventsTill = function(
	    connection, resolveLinkTos, userCredentials, lastCommitPosition, lastEventNumber
	) {
	  var self = this;

	  function processEvents(events, index) {
	    index = index || 0;
	    if (index >= events.length) return Promise.resolve();

	    return new Promise(function(resolve, reject) {
	          self._tryProcess(events[index]);
	          resolve();
	        })
	        .then(function() {
	          return processEvents(events, index + 1);
	        });
	  }

	  function readNext() {
	    return connection.readStreamEventsForward(self.streamId, self._nextReadEventNumber, self.readBatchSize, resolveLinkTos, userCredentials)
	        .then(function(slice) {
	          switch(slice.status) {
	            case SliceReadStatus.Success:
	              return processEvents(slice.events)
	                  .then(function() {
	                    self._nextReadEventNumber = slice.nextEventNumber;
	                    var done = Promise.resolve(lastEventNumber === null ? slice.isEndOfStream : slice.nextEventNumber > lastEventNumber);
	                    if (!done && slice.isEndOfStream)
	                        return done.delay(10);
	                    return done;
	                  });
	              break;
	            case SliceReadStatus.StreamNotFound:
	              if (lastEventNumber && lastEventNumber !== -1)
	                throw new Error(util.format("Impossible: stream %s disappeared in the middle of catching up subscription.", self.streamId));
	              return true;
	            case SliceReadStatus.StreamDeleted:
	              throw new Error("Stream deleted: " + self.streamId);
	            default:
	              throw new Error("Unexpected StreamEventsSlice.Status: %s.", slice.status);
	          }
	        })
	        .then(function(done) {
	          if (done || self._shouldStop)
	              return;
	          return readNext();
	        })
	  }
	  return readNext()
	      .then(function() {
	        if (self._verbose)
	          self._log.debug("Catch-up Subscription to %s: finished reading events, nextReadEventNumber = %d.",
	              self.isSubscribedToAll ? '<all>' : self.streamId, self._nextReadEventNumber);
	      });
	};

	EventStoreStreamCatchUpSubscription.prototype._tryProcess = function(e) {
	  var processed = false;
	  if (e.originalEventNumber > this._lastProcessedEventNumber) {
	    this._eventAppeared(this, e);
	    this._lastProcessedEventNumber = e.originalEventNumber;
	    processed = true;
	  }
	  if (this._verbose)
	    this._log.debug("Catch-up Subscription to %s: %s event (%s, %d, %s @ %d).",
	        this.isSubscribedToAll ? '<all>' : this.streamId, processed ? "processed" : "skipping",
	        e.originalEvent.eventStreamId, e.originalEvent.eventNumber, e.originalEvent.eventType, e.originalEventNumber)
	};


	module.exports = EventStoreStreamCatchUpSubscription;


/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(4);

	var SubscriptionDropReason = __webpack_require__(24);
	var results = __webpack_require__(3);

	const DefaultReadBatchSize = 500;
	const DefaultMaxPushQueueSize = 10000;
	const MaxReadSize = 4096;

	function DropSubscriptionEvent() {}

	/**
	 * @param connection
	 * @param log
	 * @param streamId
	 * @param resolveLinkTos
	 * @param userCredentials
	 * @param eventAppeared
	 * @param liveProcessingStarted
	 * @param subscriptionDropped
	 * @param verboseLogging
	 * @param readBatchSize
	 * @param maxPushQueueSize
	 * @constructor
	 * @property {boolean} isSubscribedToAll
	 * @property {string} streamId
	 * @property {number} readBatchSize
	 * @property {number} maxPushQueueSize
	 */
	function EventStoreCatchUpSubscription(
	    connection, log, streamId, resolveLinkTos, userCredentials,
	    eventAppeared, liveProcessingStarted, subscriptionDropped,
	    verboseLogging, readBatchSize, maxPushQueueSize
	) {
	  readBatchSize = readBatchSize || DefaultReadBatchSize;
	  maxPushQueueSize = maxPushQueueSize || DefaultMaxPushQueueSize;
	  //Ensure.NotNull(connection, "connection");
	  //Ensure.NotNull(log, "log");
	  //Ensure.NotNull(eventAppeared, "eventAppeared");
	  //Ensure.Positive(readBatchSize, "readBatchSize");
	  //Ensure.Positive(maxPushQueueSize, "maxPushQueueSize");
	  if (readBatchSize > MaxReadSize) throw new Error(util.format("Read batch size should be less than %d. For larger reads you should page.", MaxReadSize));

	  this._connection = connection;
	  this._log = log;
	  this._streamId = streamId || '';
	  this._resolveLinkTos = resolveLinkTos;
	  this._userCredentials = userCredentials;
	  this._shouldStop = false;
	  this._stopped = false;
	  this._isDropped = false;
	  this._subscription = null;
	  this._liveQueue = [];
	  this._dropData = null;
	  this._isProcessing = false;

	  Object.defineProperties(this, {
	    isSubscribedToAll: { value: this._streamId === '' },
	    streamId: { value: this._streamId },
	    readBatchSize: { value: readBatchSize },
	    maxPushQueueSize: { value: maxPushQueueSize }
	  });

	  this._eventAppeared = eventAppeared;
	  this._liveProcessingStarted = liveProcessingStarted;
	  this._subscriptionDropped = subscriptionDropped;
	  this._verbose = verboseLogging;

	  var self = this;
	  this._onReconnect = function() {
	    if (self._verbose) self._log.debug("Catch-up Subscription to %s: recovering after reconnection.", self._streamId || '<all>');
	    if (self._verbose) self._log.debug("Catch-up Subscription to %s: unhooking from connection.Connected.", self._streamId || '<all>');
	    self._connection.removeListener('connected', self._onReconnect);
	    self._runSubscription();
	  }
	}

	/**
	 * @param {EventStoreNodeConnection} connection
	 * @param {boolean} resolveLinkTos
	 * @param {UserCredentials} userCredentials
	 * @param {?number} lastCommitPosition
	 * @param {?number} lastEventNumber
	 * @private
	 * @abstract
	 */
	EventStoreCatchUpSubscription.prototype._readEventsTill = function(
	    connection, resolveLinkTos, userCredentials, lastCommitPosition, lastEventNumber
	) {
	  throw new Error("EventStoreCatchUpSubscription._readEventsTill abstract method called. " + this.constructor.name);
	};

	/**
	 * @param {ResolvedEvent} e
	 * @private
	 * @abstract
	 */
	EventStoreCatchUpSubscription.prototype._tryProcess = function(e) {
	  throw new Error("EventStoreCatchUpSubscription._tryProcess abstract method called. " + this.constructor.name);
	};

	EventStoreCatchUpSubscription.prototype.start = function() {
	  if (this._verbose) this._log.debug("Catch-up Subscription to %s: starting...", this._streamId || '<all>');
	  this._runSubscription();
	};

	EventStoreCatchUpSubscription.prototype.stop = function() {
	  if (this._verbose) this._log.debug("Catch-up Subscription to %s: requesting stop...", this._streamId || '<all>');

	  if (this._verbose) this._log.debug("Catch-up Subscription to %s: unhooking from connection.Connected.", this._streamId || '<all>');
	  this._connection.removeListener('connected', this._onReconnect);

	  this._shouldStop = true;
	  this._enqueueSubscriptionDropNotification(SubscriptionDropReason.UserInitiated, null);
	/*
	  if (timeout) {
	    if (this._verbose) this._log.debug("Waiting on subscription to stop");
	    if (!this._stopped.Wait(timeout))
	      throw new TimeoutException(string.Format("Could not stop {0} in time.", GetType().Name));
	  }
	  */
	};

	EventStoreCatchUpSubscription.prototype._runSubscription = function() {
	  var logStreamName = this._streamId || '<all>';

	  if (this._verbose) this._log.debug("Catch-up Subscription to %s: running...", logStreamName);

	  var self = this;
	  this._stopped = false;
	  if (this._verbose) this._log.debug("Catch-up Subscription to %s: pulling events...", logStreamName);
	  this._readEventsTill(this._connection, this._resolveLinkTos, this._userCredentials, null, null)
	      .then(function() {
	        if (self._shouldStop) return;
	        if (self._verbose) self._log.debug("Catch-up Subscription to %s: subscribing...", logStreamName);
	        if (self._streamId === '')
	          return self._connection.subscribeToAll(self._resolveLinkTos, self._enqueuePushedEvent.bind(self), self._serverSubscriptionDropped.bind(self), self._userCredentials);
	        else
	          return self._connection.subscribeToStream(self._streamId, self._resolveLinkTos, self._enqueuePushedEvent.bind(self), self._serverSubscriptionDropped.bind(self), self._userCredentials);
	      })
	      .then(function(subscription) {
	        if (subscription === undefined) return;
	        if (self._verbose) self._log.debug("Catch-up Subscription to %s: pulling events (if left)...", logStreamName);
	        self._subscription = subscription;
	        return self._readEventsTill(self._connection, self._resolveLinkTos, self._userCredentials, subscription.lastCommitPosition, subscription.lastEventNumber)
	      })
	      .catch(function(err) {
	        self._dropSubscription(SubscriptionDropReason.CatchUpError, err);
	        return true;
	      })
	      .then(function(faulted) {
	        if (faulted) return;
	        if (self._shouldStop) {
	          self._dropSubscription(SubscriptionDropReason.UserInitiated, null);
	          return;
	        }
	        if (self._verbose) self._log.debug("Catch-up Subscription to %s: processing live events...", logStreamName);
	        if (self._liveProcessingStarted)
	          try {
	            self._liveProcessingStarted(self);
	          } catch(e) {
	            self._log.error(e, "Catch-up Subscription to %s: liveProcessingStarted callback failed.", logStreamName);
	          }
	        if (self._verbose) self._log.debug("Catch-up Subscription to %s: hooking to connection.Connected", logStreamName);
	        self._connection.on('connected', self._onReconnect);
	        self._allowProcessing = true;
	        self._ensureProcessingPushQueue();
	      });
	};

	EventStoreCatchUpSubscription.prototype._enqueuePushedEvent = function(subscription, e) {
	  if (this._verbose)
	    this._log.debug("Catch-up Subscription to %s: event appeared (%s, %d, %s @ %s).",
	        this._streamId || '<all>',
	        e.originalStreamId, e.originalEventNumber, e.originalEvent.eventType, e.originalPosition);

	  if (this._liveQueue.length >= this.maxPushQueueSize)
	  {
	    this._enqueueSubscriptionDropNotification(SubscriptionDropReason.ProcessingQueueOverflow, null);
	    subscription.unsubscribe();
	    return;
	  }

	  this._liveQueue.push(e);

	  if (this._allowProcessing)
	    this._ensureProcessingPushQueue();
	};

	EventStoreCatchUpSubscription.prototype._serverSubscriptionDropped = function(subscription, reason, err) {
	  this._enqueueSubscriptionDropNotification(reason, err);
	};

	EventStoreCatchUpSubscription.prototype._enqueueSubscriptionDropNotification = function(reason, error) {
	  // if drop data was already set -- no need to enqueue drop again, somebody did that already
	  if (this._dropData) return;
	  this._dropData = {reason: reason, error: error};
	  this._liveQueue.push(new DropSubscriptionEvent());
	  if (this._allowProcessing)
	    this._ensureProcessingPushQueue();
	};

	EventStoreCatchUpSubscription.prototype._ensureProcessingPushQueue = function() {
	  if (this._isProcessing) return;

	  this._isProcessing = true;
	  setImmediate(this._processLiveQueue.bind(this));
	};

	EventStoreCatchUpSubscription.prototype._processLiveQueue = function() {
	  var ev = this._liveQueue.shift();
	  //TODO: possible blocking while, use when
	  while(ev) {
	    if (ev instanceof DropSubscriptionEvent) {
	      if (!this._dropData) this._dropData = {reason: SubscriptionDropReason.Unknown, error: new Error("Drop reason not specified.")};
	      this._dropSubscription(this._dropData.reason, this._dropData.error);
	      this._isProcessing = false;
	      return;
	    }

	    try {
	      this._tryProcess(ev);
	    }
	    catch(err) {
	      this._dropSubscription(SubscriptionDropReason.EventHandlerException, err);
	      return;
	    }
	    ev = this._liveQueue.shift();
	  }

	  this._isProcessing = false;
	};

	EventStoreCatchUpSubscription.prototype._dropSubscription = function(reason, error) {
	  if (this._isDropped) return;

	  this._isDropped = true;
	  if (this._verbose)
	    this._log.debug("Catch-up Subscription to %s: dropping subscription, reason: %s %s.",
	                    this._streamId || '<all>', reason, error);

	  if (this._subscription)
	    this._subscription.unsubscribe();
	  if (this._subscriptionDropped)
	    try {
	      this._subscriptionDropped(this, reason, error);
	    } catch(e) {
	      this._log.error(e, "Catch-up Subscription to %s: subscriptionDropped callback failed.", this._streamId || '<all>');
	    }
	  this._stopped = true;
	};

	module.exports = EventStoreCatchUpSubscription;

/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(4);

	var EventStoreCatchUpSubscription = __webpack_require__(57);
	var results = __webpack_require__(3);


	function EventStoreAllCatchUpSubscription(
	    connection, log, fromPositionExclusive, resolveLinkTos, userCredentials,
	    eventAppeared, liveProcessingStarted, subscriptionDropped,
	    verboseLogging, readBatchSize
	) {
	  EventStoreCatchUpSubscription.call(this, connection, log, '', resolveLinkTos, userCredentials,
	      eventAppeared, liveProcessingStarted, subscriptionDropped,
	      verboseLogging, readBatchSize);

	  this._lastProcessedPosition = fromPositionExclusive || new results.Position(-1,-1);
	  this._nextReadPosition = fromPositionExclusive || new results.Position(0,0);
	}
	util.inherits(EventStoreAllCatchUpSubscription, EventStoreCatchUpSubscription);

	EventStoreAllCatchUpSubscription.prototype._readEventsTill = function(
	    connection, resolveLinkTos, userCredentials, lastCommitPosition, lastEventNumber
	) {
	  var self = this;

	  function processEvents(events, index) {
	    index = index || 0;
	    if (index >= events.length) return Promise.resolve();
	    if (events[index].originalPosition === null) throw new Error("Subscription event came up with no OriginalPosition.");

	    return new Promise(function(resolve, reject) {
	          self._tryProcess(events[index]);
	          resolve();
	        })
	        .then(function() {
	          return processEvents(events, index + 1);
	        });
	  }

	  function readNext() {
	    return connection.readAllEventsForward(self._nextReadPosition, self.readBatchSize, resolveLinkTos, userCredentials)
	        .then(function(slice) {
	          return processEvents(slice.events)
	              .then(function() {
	                self._nextReadPosition = slice.nextPosition;
	                var done = lastCommitPosition === null
	                    ? slice.isEndOfStream
	                    : slice.nextPosition.compareTo(new results.Position(lastCommitPosition, lastCommitPosition)) >= 0;
	                if (!done && slice.isEndOfStream)
	                    return Promise.resolve(done).delay(10);
	                return Promise.resolve(done);
	              });
	        })
	        .then(function(done) {
	          if (done || self._shouldStop)
	              return;
	          return readNext();
	        });
	  }

	  return readNext()
	      .then(function() {
	        if (self._verbose)
	          self._log.debug("Catch-up Subscription to %s: finished reading events, nextReadPosition = %s.",
	              self.isSubscribedToAll ? "<all>" : self.streamId, self._nextReadPosition);
	      });
	};


	EventStoreAllCatchUpSubscription.prototype._tryProcess = function(e) {
	  var processed = false;
	  if (e.originalPosition.compareTo(this._lastProcessedPosition) > 0)
	  {
	    this._eventAppeared(this, e);
	    this._lastProcessedPosition = e.originalPosition;
	    processed = true;
	  }
	  if (this._verbose)
	    this._log.debug("Catch-up Subscription to %s: %s event (%s, %d, %s @ %s).",
	        this.streamId || '<all>', processed ? "processed" : "skipping",
	        e.originalEvent.eventStreamId, e.originalEvent.eventNumber, e.originalEvent.eventType, e.originalPosition);
	};

	module.exports = EventStoreAllCatchUpSubscription;


/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(4);

	var EventStorePersistentSubscriptionBase = __webpack_require__(60);
	var messages = __webpack_require__(10);

	function EventStorePersistentSubscription(
	    subscriptionId, streamId, eventAppeared, subscriptionDropped, userCredentials, log, verboseLogging, settings,
	    handler, bufferSize, autoAck
	) {
	  bufferSize = bufferSize === undefined ? 10 : bufferSize;
	  autoAck = autoAck === undefined ? true : !!autoAck;

	  EventStorePersistentSubscriptionBase.call(this, subscriptionId, streamId, eventAppeared, subscriptionDropped,
	                                            userCredentials, log, verboseLogging, settings, bufferSize, autoAck);

	  this._handler = handler;
	}
	util.inherits(EventStorePersistentSubscription, EventStorePersistentSubscriptionBase);

	EventStorePersistentSubscription.prototype._startSubscription = function(
	    subscriptionId, streamId, bufferSize, userCredentials, onEventAppeared, onSubscriptionDropped, settings
	) {
	  var self = this;
	  return new Promise(function(resolve, reject){
	    function cb(err, result) {
	      if (err) return reject(err);
	      resolve(result);
	    }
	    self._handler.enqueueMessage(new messages.StartPersistentSubscriptionMessage(cb, subscriptionId, streamId,
	        bufferSize, userCredentials, onEventAppeared, onSubscriptionDropped, settings.maxRetries,
	        settings.operationTimeout));
	  });
	};

	module.exports = EventStorePersistentSubscription;

/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(4);
	var ensure = __webpack_require__(6);
	var PersistentSubscriptionNakEventAction = __webpack_require__(61);
	var SubscriptionDropReason = __webpack_require__(24);

	function DropSubscriptionEvent() {}

	function EventStorePersistentSubscriptionBase(
	    subscriptionId, streamId,
	    eventAppeared, subscriptionDropped,
	    userCredentials, log, verboseLogging, settings, bufferSize, autoAck
	) {
	  bufferSize = bufferSize === undefined ? 10 : bufferSize;
	  autoAck = autoAck === undefined ? true : autoAck;

	  this._subscriptionId = subscriptionId;
	  this._streamId = streamId;
	  this._eventAppeared = eventAppeared;
	  this._subscriptionDropped = subscriptionDropped;
	  this._userCredentials = userCredentials;
	  this._log = log;
	  this._verbose = verboseLogging;
	  this._settings = settings;
	  this._bufferSize = bufferSize;
	  this._autoAck = autoAck;

	  this._subscription = null;
	  this._dropData = null;
	  this._queue = [];
	  this._isProcessing = false;
	  this._isDropped = false;
	}

	EventStorePersistentSubscriptionBase.prototype.start = function() {
	  this._stopped = false;

	  var self = this;
	  this._startSubscription(this._subscriptionId, this._streamId, this._bufferSize, this._userCredentials,
	                          this._onEventAppeared.bind(this), this._onSubscriptionDropped.bind(this), this._settings)
	      .then(function(subscription) {
	        self._subscription = subscription;
	      });
	};

	EventStorePersistentSubscriptionBase.prototype._startSubscription = function() {
	  throw new Error("EventStorePersistentSubscriptionBase._startSubscription abstract method called." +
	                  this.constructor.name);
	};

	/**
	 * @param {ResolvedEvent[]|ResolvedEvent} events
	 */
	EventStorePersistentSubscriptionBase.prototype.acknowledge = function(events) {
	  ensure.notNull(events, "events");

	  if (this._subscription === null) throw new Error("Invalid operation. Subscription is not active yet.");
	  if (!Array.isArray(events))
	    events = [events];
	  var ids = events.map(function(x) { return x.originalEvent.eventId; });
	  this._subscription.notifyEventsProcessed(ids);
	};

	/**
	 * @param {ResolvedEvent[]|ResolvedEvent} events
	 * @param {number} action One of PersistentSubscriptionNakEventAction
	 * @param {string} reason
	 */
	EventStorePersistentSubscriptionBase.prototype.fail = function(events, action, reason) {
	  ensure.notNull(events, "events");
	  PersistentSubscriptionNakEventAction.isValid(action);
	  ensure.notNull(reason, "reason");

	  if (this._subscription === null) throw new Error("Invalid operation. Subscription is not active yet.");
	  if (!Array.isArray(events))
	    events = [events];
	  var ids = events.map(function(x) { return x.originalEvent.eventId; });
	  this._subscription.notifyEventsFailed(ids, action, reason);
	};

	EventStorePersistentSubscriptionBase.prototype.stop = function() {
	  if (this._verbose) this._log.debug("Persistent Subscription to %s: requesting stop...", this._streamId);
	  this._enqueueSubscriptionDropNotification(SubscriptionDropReason.UserInitiated, null);
	  //TODO figure out timeout with Promise still running
	  //if (!_stopped.Wait(timeout))
	    //throw new TimeoutException(string.Format("Could not stop {0} in time.", GetType().Name));
	};

	EventStorePersistentSubscriptionBase.prototype._enqueueSubscriptionDropNotification = function(reason, error) {
	  // if drop data was already set -- no need to enqueue drop again, somebody did that already
	  if (!this._dropData) {
	    this._dropData = {reason: reason, error: error};
	    this._enqueue(new DropSubscriptionEvent());
	  }
	};

	EventStorePersistentSubscriptionBase.prototype._onSubscriptionDropped = function(subscription, reason, exception) {
	  this._enqueueSubscriptionDropNotification(reason, exception);
	};

	EventStorePersistentSubscriptionBase.prototype._onEventAppeared = function(subscription, resolvedEvent) {
	  this._enqueue(resolvedEvent);
	};

	EventStorePersistentSubscriptionBase.prototype._enqueue = function(resolvedEvent) {
	  this._queue.push(resolvedEvent);
	  if (!this._isProcessing) {
	    this._isProcessing = true;
	    setImmediate(this._processQueue.bind(this));
	  }
	};

	EventStorePersistentSubscriptionBase.prototype._processQueue = function() {
	  //do
	  //{
	    var e = this._queue.shift();
	    while (e)
	    {
	      if (e instanceof DropSubscriptionEvent) // drop subscription artificial ResolvedEvent
	      {
	        if (this._dropData === null) throw new Error("Drop reason not specified.");
	        this._dropSubscription(this._dropData.reason, this._dropData.error);
	        return;
	      }
	      if (this._dropData !== null)
	      {
	        this._dropSubscription(this._dropData.reason, this._dropData.error);
	        return;
	      }
	      try
	      {
	        this._eventAppeared(this, e);
	        if(this._autoAck)
	          this._subscription.notifyEventsProcessed([e.originalEvent.eventId]);
	        if (this._verbose)
	          this._log.debug("Persistent Subscription to %s: processed event (%s, %d, %s @ %d).",
	              this._streamId, e.originalEvent.eventStreamId, e.originalEvent.eventNumber, e.originalEvent.eventType,
	              e.originalEventNumber);
	      }
	      catch (err)
	      {
	        //TODO GFY should we autonak here?
	        this._dropSubscription(SubscriptionDropReason.EventHandlerException, err);
	        return;
	      }
	      e = this._queue.shift();
	    }
	    this._isProcessing = false;
	  //} while (_queue.Count > 0 && Interlocked.CompareExchange(ref _isProcessing, 1, 0) == 0);
	};

	EventStorePersistentSubscriptionBase.prototype._dropSubscription = function(reason, error) {
	  if (!this._isDropped)
	  {
	    this._isDropped = true;
	    if (this._verbose)
	      this._log.debug("Persistent Subscription to %s: dropping subscription, reason: %s %s.",
	                      this._streamId, reason, error);

	    if (this._subscription !== null)
	      this._subscription.unsubscribe();
	    if (this._subscriptionDropped !== null)
	      this._subscriptionDropped(this, reason, error);
	    this._stopped = true;
	  }
	};

	module.exports = EventStorePersistentSubscriptionBase;


/***/ },
/* 61 */
/***/ function(module, exports) {

	const PersistentSubscriptionNakEventAction = {
	  Unknown: 0,
	  Park: 1,
	  Retry: 2,
	  Skip: 3,
	  Stop: 4
	};

	module.exports = PersistentSubscriptionNakEventAction;
	module.exports.isValid = function(value) {
	  for(var k in PersistentSubscriptionNakEventAction)
	    if (PersistentSubscriptionNakEventAction[k] === value) return true;
	  return false;
	};


/***/ },
/* 62 */
/***/ function(module, exports) {

	module.exports.metastreamOf = function(stream) {
	  return '$$' + stream;
	};
	module.exports.isMetastream = function(stream) {
	  return stream.indexOf('$$') === 0;
	};

/***/ },
/* 63 */
/***/ function(module, exports) {

	const SystemEventTypes = {
	  StreamMetadata: '$metadata'
	};

	module.exports = SystemEventTypes;


/***/ },
/* 64 */
/***/ function(module, exports) {

	function StaticEndpointDiscoverer(tcpEndPoint, useSsl) {
	  this._nodeEndpoints = {
	    tcpEndPoint: useSsl ? null : tcpEndPoint,
	    secureTcpEndPoint: useSsl ? tcpEndPoint : null
	  }
	}

	StaticEndpointDiscoverer.prototype.discover = function(failedTcpEndpoint) {
	  return Promise.resolve(this._nodeEndpoints);
	};

	module.exports = StaticEndpointDiscoverer;

/***/ },
/* 65 */
/***/ function(module, exports) {

	function NoopLogger() {
	}
	NoopLogger.prototype.error = function() {};
	NoopLogger.prototype.debug = function() {};
	NoopLogger.prototype.info = function() {};

	module.exports = NoopLogger;

/***/ },
/* 66 */
/***/ function(module, exports, __webpack_require__) {

	var ensure = __webpack_require__(6);

	/**
	 * @param {string} username
	 * @param {string} password
	 * @constructor
	 * @property {string} username
	 * @property {string} password
	 */
	function UserCredentials(username, password) {
	  ensure.notNullOrEmpty(username, 'username');
	  ensure.notNullOrEmpty(password, 'password');

	  Object.defineProperties(this, {
	    username: {enumerable: true, value: username},
	    password: {enumerable: true, value: password}
	  });
	}

	module.exports = UserCredentials;

/***/ },
/* 67 */
/***/ function(module, exports, __webpack_require__) {

	var SystemConsumerStrategies = __webpack_require__(53);

	function PersistentSubscriptionSettings(
	  resolveLinkTos, startFrom, extraStatistics, messageTimeout,
	  maxRetryCount, liveBufferSize, readBatchSize, historyBufferSize,
	  checkPointAfter, minCheckPointCount, maxCheckPointCount,
	  maxSubscriberCount, namedConsumerStrategy
	) {
	  this.resolveLinkTos = resolveLinkTos;
	  this.startFrom = startFrom;
	  this.extraStatistics = extraStatistics;
	  this.messageTimeout = messageTimeout;
	  this.maxRetryCount = maxRetryCount;
	  this.liveBufferSize = liveBufferSize;
	  this.readBatchSize = readBatchSize;
	  this.historyBufferSize = historyBufferSize;
	  this.checkPointAfter = checkPointAfter;
	  this.minCheckPointCount = minCheckPointCount;
	  this.maxCheckPointCount = maxCheckPointCount;
	  this.maxSubscriberCount = maxSubscriberCount;
	  this.namedConsumerStrategy = namedConsumerStrategy;
	}

	module.exports.create = function() {
	  return new PersistentSubscriptionSettings(false, -1, false, 30000, 500, 500, 10, 20, 2000, 10, 1000, 0, SystemConsumerStrategies.RoundRobin);
	};

/***/ },
/* 68 */
/***/ function(module, exports) {

	const SystemMetadata = {
	  maxAge: '$maxAge',
	  maxCount: '$maxCount',
	  truncateBefore: '$tb',
	  cacheControl: '$cacheControl',
	  acl: '$acl',
	  aclRead: '$r',
	  aclWrite: '$w',
	  aclDelete: '$d',
	  aclMetaRead: '$mr',
	  aclMetaWrite: '$mw',
	  userStreamAcl: '$userStreamAcl',
	  systemStreamAcl: '$systemStreamAcl'
	};

	module.exports = SystemMetadata;

/***/ }
/******/ ]);