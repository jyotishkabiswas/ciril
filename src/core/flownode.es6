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

    bind(...destinations) {
        FlowGraph.bindAll(this, destinations);
        return destinations[destinations.length - 1];
    }

    bindAll(destinations) {
        FlowGraph.bindAll(this, destinations);
        return destinations[destinations.length - 1];
    }

    synchronize(...nodes) {
        nodes.reduce((p, c, i, a) => p.bind(c), this);
        return this;
    }

    unbind(...destinations) {
        FlowGraph.unbindAll(destinations);
    }

    unbindAll(destinations) {
        FlowGraph.unbindAll(destinations);
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

    remove() {

    }

    getState() {
        return this._state;
    }
}