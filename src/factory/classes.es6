import FlowNode, {Transformer, NodeConstructor} from '../core/flownode';

let assign = require('object-assign');

function conservativeMerge(target, source) {
    Object.getOwnPropertyNames(source).forEach(function (name) {
        if (name !== "constructor" && !target[name])
            Object.defineProperty(
                target, name,
                Object.getOwnPropertyDescriptor(source, name)
            );
    });
}

/**
 * Helper method to mix source class into target class. Existing
 * properties are NOT overriden.
 * @param target {function}
 * @param source {function}
 */
function mixin(target, ...sources) {
    let proto = target.prototype;
    sources.forEach(source => {
        source = source.prototype;
        conservativeMerge(proto, source);
    });
    return target;
}

/**
 * Create a FlowNode mixin class from a constructor.
 * @param Constructor {function}
 * @return
 *        A FlowNode mixin class
 */
export function createMixin(Constructor) {
    if (typeof Constructor !== 'function')
        throw new Error(`createMixin(...): argument ` +
            `should be function, got ${typeof Constructor}`);
    let getInitialState = Constructor.prototype.getInitialState;
    const initialState = typeof getInitialState === 'function' ?
        getInitialState.apply(this) : null;

    class Mixin extends Constructor {};

    mixin(Mixin, FlowNode);

    let proto = Mixin.prototype;
    // override constructor
    Mixin = function () {
        NodeConstructor.call(this, initialState);
        Constructor.apply(this, arguments);
    }
    // copy back prototype
    Mixin.prototype = proto;
    return Mixin;
}

/**
 * Create a FlowNode class from a specification.
 * @param spec {object}
 */
export default function createClass(spec) {
    if (typeof spec !== 'object')
        throw new Error(`createClass(...): class ` +
            `specification must be an object, ` +
            `got ${typeof spec}`);

    class NewClass extends FlowNode {};
    assign(
        NewClass.prototype,
        spec
    )
    return NewClass;
}