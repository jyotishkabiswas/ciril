'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _flowgraph = require('./flowgraph');

var _flowgraph2 = _interopRequireDefault(_flowgraph);

var _flownode = require('./flownode');

var _flownode2 = _interopRequireDefault(_flownode);

var _transformer = require('./transformer');

var _transformer2 = _interopRequireDefault(_transformer);

var _assign = require('lodash/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _isEqual = require('lodash/lang/isEqual');

var _isEqual2 = _interopRequireDefault(_isEqual);

var _isFunction = require('lodash/lang/isFunction');

var _isFunction2 = _interopRequireDefault(_isFunction);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var hasProp = require('lodash/object/has');

/**
 * A data node acts as a store.
 * Input edges are compared for equality.
 */

var DataNode = function (_FlowNode) {
    _inherits(DataNode, _FlowNode);

    function DataNode() {
        var obj = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

        _classCallCheck(this, DataNode);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(DataNode).call(this));

        _this._state = obj;
        return _this;
    }

    _createClass(DataNode, [{
        key: 'transform',
        value: function transform(fn) {
            var transformer = new _transformer2.default(fn);
            _flowgraph2.default.bind(this, transformer);
            return transformer;
        }
    }, {
        key: 'setState',
        value: function setState() {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            if (!args.reduce(function (p, c, i, a) {
                return p && (0, _isEqual2.default)(a[0], a[i]);
            })) {
                console.warn('Inconsistent state detected,                 make sure transforms are correct.\n                node ID: ' + this.uuid);
            }
            this._state = args[0];
        }
    }], [{
        key: 'create',
        value: function create(obj) {
            if (!hasProp(obj, 'state') || !hasProp(obj, 'setState')) throw new Error('Source object must implement getState() and setState() methods.');
            var source = new Source();
            (0, _assign2.default)(source, obj);
            return source;
        }
    }]);

    return DataNode;
}(_flownode2.default);

exports.default = DataNode;

module.exports = DataNode;