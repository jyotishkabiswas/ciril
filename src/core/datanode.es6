import FlowGraph from './flowgraph';
import FlowNode from './flownode';
import Transformer from './transformer';
import assign from 'lodash/object/assign';
import isEqual from 'lodash/lang/isEqual';
import isFunction from 'lodash/lang/isFunction';

var hasProp = require('lodash/object/has');

/**
 * A data node acts as a store.
 * Input edges are compared for equality.
 */
export default class DataNode extends FlowNode {

    constructor(obj=null) {
        super();
        this._state = obj;
    }

    transform(fn) {
        let transformer = new Transformer(fn);
        FlowGraph.bind(this, transformer);
        return transformer;
    }

    setState(...args) {
        if (!args.reduce((p, c, i, a) => {
            return p && isEqual(a[0], a[i]);
        })) {
            console.warn(`Inconsistent state detected, \
                make sure transforms are correct.
                node ID: ${this.uuid}`);
        }
        this._state = args[0];
        return this;
    }

    static create(obj) {
        if(!hasProp(obj, 'state') || !hasProp(obj, 'setState'))
            throw new Error('Source object must implement getState() and setState() methods.');
        var source = new Source();
        assign(source, obj);
        return source;
    }

}