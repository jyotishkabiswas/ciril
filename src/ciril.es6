if(!global._babelPolyfill) { require('babel-polyfill'); }
import FlowGraph from './core/flowgraph';
import FlowNode, {Transformer, wrap} from './core/flownode';
import createClass, {createMixin} from './factory/classes';

const Ciril = {

    // core/flownode.js
    FlowNode: FlowNode,
    Transformer: Transformer,
    wrap: wrap,

    // FlowGraph API
    // core/flowgraph.js

    FlowGraph: FlowGraph,

    // fields for debugging
    _nodes: FlowGraph.nodes,
    _bindings: FlowGraph.bindings,
    _inputs: FlowGraph.inputs,

    // public methods
    register: FlowGraph.register.bind(FlowGraph),
    isRegistered: FlowGraph.isRegistered.bind(FlowGraph),
    remove: FlowGraph.remove.bind(FlowGraph),
    removeAll: FlowGraph.removeAll.bind(FlowGraph),

    bind: FlowGraph.bind.bind(FlowGraph),
    bindAll: FlowGraph.bindAll.bind(FlowGraph),
    bindInputs: FlowGraph.bindInputs.bind(FlowGraph),
    bindAllInputs: FlowGraph.bindAllInputs.bind(FlowGraph),

    unbind: FlowGraph.unbind.bind(FlowGraph),
    unbindAll: FlowGraph.unbindAll.bind(FlowGraph),

    synchronize: FlowGraph.synchronize.bind(FlowGraph),
    synchronizeAll: FlowGraph.synchronizeAll.bind(FlowGraph),
    desynchronize: FlowGraph.desynchronize.bind(FlowGraph),
    desynchronizeAll: FlowGraph.desynchronizeAll.bind(FlowGraph),

    nodeFromUuid: FlowGraph.nodeFromUuid.bind(FlowGraph),
    getNodeState: FlowGraph.getNodeState.bind(FlowGraph),

    update: FlowGraph.update.bind(FlowGraph),
    updateAll: FlowGraph.updateAll.bind(FlowGraph),
    updateSync: FlowGraph.updateSync.bind(FlowGraph),
    updateAllSync: FlowGraph.updateAllSync.bind(FlowGraph),

    flush: FlowGraph.flush.bind(FlowGraph),
    clear: FlowGraph.clear.bind(FlowGraph),

    // Factory methods

    // factory/classes.js
    createClass: createClass,
    createMixin: createMixin
}

module.exports = Ciril;