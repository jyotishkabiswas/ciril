import 'babel-polyfill';
import FlowGraph from './core/flowgraph';
import FlowNode from './core/flownode';
import Transformer from './core/transformer';
import DataNode from './core/datanode';

module.exports = {
    // classes
    FlowNode: FlowNode,
    Transformer: Transformer,
    DataNode: DataNode,

    // fields for debugging
    _bindings: FlowGraph.bindings,
    _inputs: FlowGraph.inputs,

    // methods
    register: FlowGraph.register.bind(FlowGraph),

    bind: FlowGraph.bind.bind(FlowGraph),
    bindAll: FlowGraph.bindAll.bind(FlowGraph),
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
    updateAllSync: FlowGraph.updateAllSync.bind(FlowGraph)

}