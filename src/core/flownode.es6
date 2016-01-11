import FlowGraph from './flowgraph';

import uuid from 'uuid';
import isEqual from 'lodash/lang/isEqual';


/**
 * Constructor for creating a FlowNode. Should be
 * called if creating a mixin class with FlowNode.
 */
export function NodeConstructor(initialState=null) {
    this._dirty = false;
    this.uuid = uuid.v4();
    FlowGraph.register(this);
    this.state = initialState;
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
    constructor(initialState=null) {
        NodeConstructor.call(this, initialState);
    }

    /**
     * Same as ciril.register(this).
     */
    register() {
        FlowGraph.register(this);
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
     * Same as ciril.bind(this, ...destinations)
     * @param destinations
     *        the destination nodes
     * @return
     *        the last node in destinations
     */
    bind(...destinations) {
        FlowGraph.bindAll(this, destinations);
        return destinations[destinations.length - 1];
    }

    /**
     * Same as ciril.bindAll(this, ...destinations)
     * @param destinations
     *        the destination nodes
     * @return
     *        the last node in destinations
     */
    bindAll(destinations) {
        FlowGraph.bindAll(this, destinations);
        return destinations[destinations.length - 1];
    }

    /**
     * Same as ciril.synchronize(this, ..nodes).
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
     * Same as ciril.synchronize(this, ..nodes).
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
     * Same as ciril.unbind(this, ...destinations).
     * @param destinations
     *        the destination nodes
     */
    unbind(...destinations) {
        FlowGraph.unbindAll(this, destinations);
    }

    /**
     * Same as ciril.unbindAll(this, destinations).
     * @param destinations
     */
    unbindAll(destinations) {
        FlowGraph.unbindAll(this, destinations);
    }

    /**
     * Same as ciril.update(this).
     */
    update() {
        return FlowGraph.update(this);
    }

    /**
     * Same as ciril.updateSync(this).
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
        return this._dirty;
    }

    /**
     * Mark this node as dirty or clean.
     * Be careful using this method, as it
     * affects the update algorithm. It is
     * meant to be used by ciril for
     * bookkeeping purposes.
     * @param dirty
     *        true iff marking dirty
     */
    markDirty(dirty) {
        this._dirty = dirty;
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
     * Same as ciril.bindAllInputs(this, inputs).
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
     * Same as ciril.remove(this).
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
     *        this node
     */
    setState(...args) {
        if (!args.reduce((p, c, i, a) => {
            return p && isEqual(a[0], a[i]);
        })) {
            console.warn(`setState(...): Inconsistent state ` +
                `detected, make sure transforms are correct.
                ` + `inputs: ${args}`);
        }
        this.state = args[0];
        return this;
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
     *        this
     */
    setState(...args) {
        this.state = this.fn.apply(this, args);
        return this;
    }
}