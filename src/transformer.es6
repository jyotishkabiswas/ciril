import FlowGraph from './flowgraph';
import FlowNode from './flownode';

export default class Transformer extends FlowNode {
    constructor(fn, inv=null){
        super();
        this.fn = fn;
        // we'll trust that the inverse is correct
        this._inverse = inv === null ? inv : new Transformer(inv);
    }

    setInputs(...inputs) {
    }

    transform(fn) {
        let transformer = new Transformer(fn);
        FlowGraph.bind(this, transformer);
        return transformer;
    }

    get invertible() {
        return this._inverse != null;
    }

    get inverse() {
        return this._inverse;
    }

    set inverse(inv) {
        this._inverse = new Transformer(inv);
    }

    setState(...args) {
        this._state = this.fn.apply(this, args);
    }
}