'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _difference = require('lodash/array/difference');

var _difference2 = _interopRequireDefault(_difference);

var _union = require('lodash/array/union');

var _union2 = _interopRequireDefault(_union);

var _isFunction = require('lodash/lang/isFunction');

var _isFunction2 = _interopRequireDefault(_isFunction);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// renaming
var hasProp = require('lodash/object/has');

/**
 * Maintains dependences between various data
 * sources and sinks.
 */

var _FlowGraph = function () {
    function _FlowGraph() {
        _classCallCheck(this, _FlowGraph);

        // id --> node
        this.nodes = {};
        // id --> [id]
        this.bindings = {};
        // id --> [id]
        this.inputs = {};
    }

    /**
     * Associate a node uuid with the node
     * within the flow graph.
     * @param uuid
     *        the node's uuid
     * @param node
     *        the node
     * @return
     *        true iff the node doesn't already
     *        exist in the store.
     */

    _createClass(_FlowGraph, [{
        key: 'register',
        value: function register(node) {
            if (hasProp(this.nodes, node.uuid)) return false;
            this.nodes[node.uuid] = node;
            this.bindings[node.uuid] = [];
            this.inputs[node.uuid] = [];
            return true;
        }

        /**
         * Create a one-way data binding between
         * the source and each of the destinations.
         * @param source
         *        the uuid of the source node
         * @param destinations
         *        the uuid_s of the destination nodes
         * @return true iff source and destinations
         *        are registered
         */

    }, {
        key: 'bind',
        value: function bind(source) {
            for (var _len = arguments.length, destinations = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                destinations[_key - 1] = arguments[_key];
            }

            return this.bindAll(source, destinations);
        }

        /**
         * Create a one-way data binding between
         * the source and each of the destinations.
         * @param source
         *        the uuid of the source node
         * @param destinations
         *        the uuid_s of the destination nodes
         * @return true iff source and destinations
         *        are registered
         */

    }, {
        key: 'bindAll',
        value: function bindAll(source, destinations) {
            if (!hasProp(this.nodes, source.uuid)) throw new Error('Can\'t bind, source ' + source + ' not registered.');
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = destinations[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var node = _step.value;

                    if (!hasProp(this.nodes, node.uuid)) throw new Error('Can\'t bind, destination not registered.');
                    this.inputs[node.uuid].push(source.uuid);
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            this.bindings[source.uuid] = (0, _union2.default)(this.bindings[source.uuid], destinations.map(function (node) {
                return node.uuid;
            }));
            return true;
        }

        /**
         * Remove bindings between the source
         * and destinations.
         * @param source
         *        the source uuid
         * @param destinations
         *        the destination uuid_s
         * @return true iff source and destinations
         *        are registered
         */

    }, {
        key: 'unbind',
        value: function unbind(source) {
            for (var _len2 = arguments.length, destinations = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                destinations[_key2 - 1] = arguments[_key2];
            }

            return this.unbindAll(source, destinations);
        }

        /**
         * Remove bindings between the source
         * and destinations.
         * @param source
         *        the source uuid
         * @param destinations
         *        the destination uuid_s
         * @return true iff source and destinations
         *        are registered
         */

    }, {
        key: 'unbindAll',
        value: function unbindAll(source, destinations) {
            if (!hasProp(this.nodes, source.uuid)) return false;
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = destinations[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var d = _step2.value;

                    if (!hasProp(this.nodes), d.uuid) return false;
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }

            this.bindings[source.uuid] = (0, _difference2.default)(this.bindings[source.uuid], destinations.map(function (node) {
                return node.uuid;
            }));
            return true;
        }

        /**
         * Get the node keyed by uuid.
         * @param uuid
         *        the node's uuid
         * @return
         *        the node keyed by uuid
         */

    }, {
        key: 'nodeFromUuid',
        value: function nodeFromUuid(uuid) {
            return hasProp(this.nodes, uuid) ? this.nodes[uuid] : null;
        }

        /**
         * Get the state of the node keyed
         * by uuid.
         * @param uuid
         *        the node's uuid
         * @return
         *        the node's state
         */

    }, {
        key: 'getNodeState',
        value: function getNodeState(uuid) {
            return this.nodeFromUuid(uuid).getState();
        }

        /**
         * Should be called when a node's data changes.
         * Recursively updates bound nodes asynchronously.
         * @param node
         *        the node uuid
         * @return
         *        a Promise for the update
         */

    }, {
        key: 'update',
        value: function update(node) {
            var _this = this;

            var uuid = node.uuid;
            return new _bluebird2.default(function (resolve, reject) {
                resolve(_this._terminalsFrom(uuid));
            }).map(function (uuid) {
                return _this._update(uuid);
            }).all().caught(function (e) {
                return console.warn(e);
            });
        }

        /**
         * Updates terminal node keyed by uuid, recursively
         * updating dirty nodes when necessary.
         * @param uuid
         *        the terminal uuid
         * @return
         *        a Promise for the update
         */

    }, {
        key: '_update',
        value: function _update(uuid) {
            var _this2 = this;

            var node = this.nodeFromUuid(uuid);
            // to avoid infinite recursion
            node.markDirty(false);

            // wrap in a promise
            return new _bluebird2.default(function (resolve, reject) {
                // update dirty dependencies first
                _bluebird2.default.filter(_this2.inputs[uuid], function (id) {
                    return _this2.nodeFromUuid(id).isDirty();
                }).map(function (id) {
                    return _this2._update(id);
                }).all()
                // then update node
                .then(function (res) {
                    var args = _this2.inputs[uuid].map(function (id) {
                        return _this2.getNodeState(id);
                    });
                    // console.log(args);
                    // supporting asynchronous setState() functions
                    _bluebird2.default.resolve(node.setState.apply(node, _toConsumableArray(args))).then(resolve()).caught(function (e) {
                        return reject(e);
                    });
                });
            });
        }

        /**
         * Get terminal nodes from node keyed by uuid
         * @param uuid
         *        the node uuid
         * @return
         *        the nodes in a topological ordering
         */

    }, {
        key: '_terminalsFrom',
        value: function _terminalsFrom(uuid) {
            var visited = new Set();
            var stack = [uuid];
            // const sorted = [];
            var terminals = [];

            // Depth-first search from uuid
            while (stack.length > 0) {
                var current = stack.pop();
                var terminal = true;
                visited.add(current);
                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                    for (var _iterator3 = this.bindings[current][Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var child = _step3.value;

                        if (!visited.has(child)) {
                            terminal = false;
                            stack.push(child);
                            this.nodeFromUuid(child).markDirty(true);
                        }
                    }
                } catch (err) {
                    _didIteratorError3 = true;
                    _iteratorError3 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion3 && _iterator3.return) {
                            _iterator3.return();
                        }
                    } finally {
                        if (_didIteratorError3) {
                            throw _iteratorError3;
                        }
                    }
                }

                if (terminal) terminals.push(current);
                // sorted.push(current);
            }
            // console.log(terminals);
            return terminals;
        }
    }]);

    return _FlowGraph;
}();

var FlowGraph = new _FlowGraph();
exports.default = FlowGraph;