import FlowGraph from './flowgraph';

import uuid from 'uuid';
import isEqual from 'lodash/lang/isEqual';


function conservativeMerge(target, ...sources) {
    sources.forEach(source => {
        Object.getOwnPropertyNames(source).forEach(name => {
            if (name === 'constructor' || target[name])
                return;
            Object.defineProperty(target, name,
                Object.getOwnPropertyDescriptor(source, name));
        });
    });
}


function createTransformer(fn) {
    return new Transformer(fn);
}

function createSimpleWrapper(obj) {
    let node = new FlowNode(obj);
    return node;
}

function createWrapper(obj) {
    if (!obj.hasOwnProperty('state'))
        return createSimpleWrapper(obj);
    let node = new FlowNode(null, false);
    // Add FlowNode fields
    conservativeMerge(obj, node, FlowNode.prototype);
    obj.register();
    return obj;
}

/**
 * Wrap the given object or function or value in a FlowNode.
 * @param obj
 *        the object, function, or value to wrap
 * @return
 *        the wrapper FlowNode
 */
export function wrap(obj) {
    if (obj instanceof FlowNode)
        return obj.register();
    switch (typeof obj) {
        case 'function': return createTransformer(obj);
        case 'object': return createWrapper(obj);
        default:
            return createSimpleWrapper(obj);
    }
}



/**
 * Constructor for creating a FlowNode. Should be
 * called if creating a mixin class with FlowNode.
 */
export function NodeConstructor(initialState=null, register=true) {
    Object.defineProperty(this, 'dirty', {
        writable: true,
        value: false
    });
    Object.defineProperty(this, 'uuid', {
        value: uuid.v4(),
    });
    Object.defineProperty(this, 'state', {
        writable: true,
        value: initialState
    });
    Object.defineProperty(this, 'changed', {
        writable: true,
        value: false
    })

    if (register)
        FlowGraph.register(this);
}

/**
 * A FlowNode stores some state and can have
 * input and output nodes. When extending this class,
 * the primary implementation details to consider
 * are how input data is handled in setState(), and
 * how object data is serialized in getState().
 *
 * The core subclasses of FlowNode are Transformer
 * and DataNode.
 */
export default class FlowNode {

    /**
     * On creation, a FlowNode registers itself
     * with the FlowGraph.
     */
    constructor(initialState=null, register=true) {
        NodeConstructor.call(this, initialState, register);
    }

    /**
     * Same as Ciril.register(this).
     */
    register() {
        FlowGraph.register(this);
        return this;
    }

    /**
     * Same as Ciril.isRegistered(this).
     */
    isRegistered() {
        return FlowGraph.isRegistered(this);
    }

    /**
     * Bind this node to a transformer node.
     * @param fn
     *        the transformer function
     * @return
     *        the transformer node
     */
    transform(fn) {
        let transformer = new Transformer(fn);
        FlowGraph.bind(this, transformer);
        return transformer;
    };

    /**
     * Same as Ciril.bind(this, ...destinations)
     * @param destinations
     *        the destination nodes
     * @return
     *        the last node in destinations
     */
    bind(...destinations) {
        return this.bindAll(destinations);
    }

    /**
     * Same as Ciril.bindAll(this, ...destinations)
     * @param destinations
     *        the destination nodes
     * @return
     *        the last node in destinations
     */
    bindAll(destinations) {
        let dests = destinations.map(
            e => FlowGraph.isRegistered(e) ? e : wrap(e)
        );
        FlowGraph.bindAll(this, dests);
        return dests[dests.length - 1];
    }

    /**
     * Same as Ciril.synchronize(this, ..nodes).
     * @param nodes
     *        the nodes to synchronize with
     * @return
     *        this node
     */
    synchronize(...nodes) {
        nodes.reduce((p, c, i, a) => p.bind(c), this);
        return this;
    }

    /**
     * Same as Ciril.synchronize(this, ..nodes).
     * @param nodes
     *        the nodes to synchronize with
     * @return
     *        this node
     */
    synchronizeAll(nodes) {
        nodes.reduce((p, c, i, a) => p.bind(c), this);
        return this;
    }

    /**
     * Same as Ciril.unbind(this, ...destinations).
     * @param destinations
     *        the destination nodes
     */
    unbind(...destinations) {
        FlowGraph.unbindAll(this, destinations);
    }

    /**
     * Same as Ciril.unbindAll(this, destinations).
     * @param destinations
     */
    unbindAll(destinations) {
        FlowGraph.unbindAll(this, destinations);
    }

    /**
     * Same as Ciril.update(this).
     */
    update() {
        return FlowGraph.update(this);
    }

    /**
     * Same as Ciril.updateSync(this).
     */
    updateSync() {
        FlowGraph.updateSync(this);
    }

    /**
     * Ckecks whether this node has been
     * marked dirty, which is if its state
     * is out of date.
     * @return
     *        true iff the node is dirty.
     */
    isDirty() {
        return this.dirty;
    }

    /**
     * Mark this node as dirty or clean.
     * Be careful using this method, as it
     * affects the update algorithm. It is
     * meant to be used by Ciril for
     * bookkeeping purposes.
     * @param dirty
     *        true iff marking dirty
     */
    markDirty(dirty) {
        this.dirty = dirty;
    }

    /**
     * Same as cirl.bindInputs(this, ...inputs).
     * @param inputs
     *        the input nodes
     * @return
     *        this node
     */
    bindInputs(...inputs) {
        FlowGraph.bindAllInputs(this, inputs);
        return this;
    }

    /**
     * Same as Ciril.bindAllInputs(this, inputs).
     * @param inputs
     *        the input nodes
     * @return
     *        this node
     */
    bindAllInputs(inputs) {
        FlowGraph.bindAllInputs(this, inputs);
        return this;
    }


    /**
     * Same as Ciril.remove(this).
     */
    remove() {
        FlowGraph.remove(this);
    }

    /**
     * Get this node's state.
     * @return
     *        the node's state
     */
    getState() {
        return this.state;
    }

    /**
     * Set this node's state.
     * @param args
     *        the input state objects
     * @return
     *        true iff state changed
     */
    setState(...args) {
        if (!args.reduce((p, c, i, a) => {
            return p && isEqual(a[0], a[i]);
        })) {
            console.warn(`setState(...): Inconsistent state ` +
                `detected, make sure transforms are correct.
                ` + `inputs: ${args}`);
        }
        if (!isEqual(this.state, args[0])) {
            this.state = args[0]
            this.changed = true
            return true
        }
        this.changed = false
        return false
    }

    /**
     * Called before node is removed.
     * Should be overriden.
     */
    onRemove() {

    }

    /**
     * Called before an input is unbound.
     * Should be overriden.
     */
    onUnbindInput(input) {

    }

    /**
     * Called after an input is bound.
     * Should be overriden.
     */
    onBindInput(input) {

    }

    /**
     * Called before an output is unbound.
     * Should be overriden.
     */
    onUnbind(node) {

    }

    /**
     * Called after an output is bound.
     * Should be overriden.
     */
    onBind(node) {

    }
}

/**
 * A Transformer represents a functional transform
 * from an input state to an output state. Its purpose
 * in the FlowGraph is to compute values from input
 * data.
 */
export class Transformer extends FlowNode {

    constructor(fn){
        super();
        this.fn = fn;
    }

    /**
     * Compute new state based on input state.
     * @param args
     *        the input state objects
     * @return
     *        true iff state changed
     */
    setState(...args) {
        let state = this.fn.apply(this, args)
        if (!isEqual(this.state, state)) {
            this.state = state
            this.changed = true
            return true
        }
        this.changed = false
        return false
    }
}