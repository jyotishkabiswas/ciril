import FlowGraph from './flowgraph';
import assign from 'lodash/object/assign';
import uuid from 'uuid';

export default class FlowNode {
    constructor() {
        this._dirty = false;
        this.uuid = uuid.v4();
        FlowGraph.register(this);
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

    bind(...destinations) {
        return this.bindAll(destinations);
    }

    bindAll(destinations) {
        FlowGraph.bindAll(this, destinations);
        return destinations[destinations.length - 1];
    }

    update() {
        return FlowGraph.update(this);
    }

    updateSync() {
        FlowGraph.updateSync(this);
    }

    isDirty() {
        return this._dirty;
    }

    markDirty(dirty) {
        this._dirty = dirty;
    }

    bindInputs(...inputs) {
        for (inp of inputs) {
            FlowGraph.bind(inp, this);
        }
        return this;
    }

    getState() {
        return this._state;
    }
}