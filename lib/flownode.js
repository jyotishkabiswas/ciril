'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _flowgraph = require('./flowgraph');

var _flowgraph2 = _interopRequireDefault(_flowgraph);

var _assign = require('lodash/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FlowNode = function () {
    function FlowNode() {
        _classCallCheck(this, FlowNode);

        this._dirty = false;
        this.uuid = _uuid2.default.v4();
        _flowgraph2.default.register(this);
        this._state = null;
    }

    // // TODO: move to FlowGraph api
    // synchronize(other) {
    //     if (typeof transformer === 'undefined') {
    //         if (!(FlowGraph.bind(this, other) && FlowGraph.bind(other, this)))
    //             throw new Error('Could not synchronize sources, one or both may be unregistered.');
    //     } else if (!transformer.invertible()) {
    //         throw new Error('Transform must have an inverse for synchronization.');
    //     } else {
    //         this.transform(transformer).bind(other);
    //         other.transform(transformer.inverse()).bind(this);
    //     }
    //     return this;
    // }

    _createClass(FlowNode, [{
        key: 'bind',
        value: function bind() {
            for (var _len = arguments.length, destinations = Array(_len), _key = 0; _key < _len; _key++) {
                destinations[_key] = arguments[_key];
            }

            return this.bindAll(destinations);
        }
    }, {
        key: 'bindAll',
        value: function bindAll(destinations) {
            _flowgraph2.default.bindAll(this, destinations);
            return destinations[destinations.length - 1];
        }
    }, {
        key: 'emitChange',
        value: function emitChange() {
            return _flowgraph2.default.update(this);
        }
    }, {
        key: 'isDirty',
        value: function isDirty() {
            return this._dirty;
        }
    }, {
        key: 'markDirty',
        value: function markDirty(dirty) {
            this._dirty = dirty;
        }
    }, {
        key: 'bindInputs',
        value: function bindInputs() {
            for (var _len2 = arguments.length, inputs = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                inputs[_key2] = arguments[_key2];
            }

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = inputs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    inp = _step.value;

                    _flowgraph2.default.bind(inp, this);
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

            return this;
        }
    }, {
        key: 'getState',
        value: function getState() {
            return this._state;
        }
    }]);

    return FlowNode;
}();

exports.default = FlowNode;