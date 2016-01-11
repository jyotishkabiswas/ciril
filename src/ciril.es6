import 'babel-polyfill';
import FlowGraph from './core/flowgraph';
import FlowNode, {Transformer} from './core/flownode';
import createClass, {createMixin} from './factory/classes';

module.exports = {

    // core/flownode.js
    FlowNode: FlowNode,

    // core/transformer.js
    Transformer: Transformer,

    // FlowGraph API
    // core/flowgraph.js

    // fields for debugging
    _nodes: FlowGraph.nodes,
    _bindings: FlowGraph.bindings,
    _inputs: FlowGraph.inputs,

    // public methods
    register: FlowGraph.register.bind(FlowGraph),
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

    setInputs: FlowGraph.setInputs.bind(FlowGraph),
    nodeFromUuid: FlowGraph.nodeFromUuid.bind(FlowGraph),
    getNodeState: FlowGraph.getNodeState.bind(FlowGraph),

    update: FlowGraph.update.bind(FlowGraph),
    updateAll: FlowGraph.updateAll.bind(FlowGraph),
    updateSync: FlowGraph.updateSync.bind(FlowGraph),
    updateAllSync: FlowGraph.updateAllSync.bind(FlowGraph),

    clear: FlowGraph.clear.bind(FlowGraph),

    // Factory methods

    // factory/classes.js
    createClass: createClass,
    createMixin: createMixin
}