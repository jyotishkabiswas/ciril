'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _flowgraph = require('./flowgraph');

var _flowgraph2 = _interopRequireDefault(_flowgraph);

var _flownode = require('./flownode');

var _flownode2 = _interopRequireDefault(_flownode);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Transformer = function (_FlowNode) {
    _inherits(Transformer, _FlowNode);

    function Transformer(fn) {
        var inv = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

        _classCallCheck(this, Transformer);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Transformer).call(this));

        _this.fn = fn;
        // we'll trust that the inverse is correct
        _this._inverse = inv === null ? inv : new Transformer(inv);
        return _this;
    }

    _createClass(Transformer, [{
        key: 'setInputs',
        value: function setInputs() {}
    }, {
        key: 'transform',
        value: function transform(fn) {
            var transformer = new Transformer(fn);
            _flowgraph2.default.bind(this, transformer);
            return transformer;
        }
    }, {
        key: 'setState',
        value: function setState() {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            this._state = this.fn.apply(this, args);
        }
    }, {
        key: 'invertible',
        get: function get() {
            return this._inverse != null;
        }
    }, {
        key: 'inverse',
        get: function get() {
            return this._inverse;
        },
        set: function set(inv) {
            this._inverse = new Transformer(inv);
        }
    }]);

    return Transformer;
}(_flownode2.default);

exports.default = Transformer;