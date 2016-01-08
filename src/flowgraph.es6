import Promise from 'bluebird';
import difference from 'lodash/array/difference';
import union from 'lodash/array/union';
import isFunction from 'lodash/lang/isFunction';

// renaming
var hasProp = require('lodash/object/has');

/**
 * Maintains dependences between various data
 * sources and sinks.
 */
class _FlowGraph {

    constructor() {
        // id --> node
        this.nodes = {};
        // id --> [id]
        this.bindings = {};
        // id --> [id]
        this.inputs = {};
    }

    /**
     * Associate a node uuid with the node
     * within the flow graph.
     * @param uuid
     *        the node's uuid
     * @param node
     *        the node
     * @return
     *        true iff the node doesn't already
     *        exist in the store.
     */
    register(node) {
        if (hasProp(this.nodes, node.uuid))
            return false;
        this.nodes[node.uuid] = node;
        this.bindings[node.uuid] = [];
        this.inputs[node.uuid] = [];
        return true;
    }

    /**
     * Create a one-way data binding between
     * the source and each of the destinations.
     * @param source
     *        the uuid of the source node
     * @param destinations
     *        the uuid_s of the destination nodes
     * @return true iff source and destinations
     *        are registered
     */
    bind(source, ...destinations) {
        return this.bindAll(source, destinations);
    }

    /**
     * Create a one-way data binding between
     * the source and each of the destinations.
     * @param source
     *        the uuid of the source node
     * @param destinations
     *        the uuid_s of the destination nodes
     * @return true iff source and destinations
     *        are registered
     */
    bindAll(source, destinations) {
        if (!hasProp(this.nodes, source.uuid))
            throw new Error(`Can't bind, source ${source} not registered.`)
        for (let node of destinations) {
            if (!hasProp(this.nodes, node.uuid))
                throw new Error(`Can't bind, destination not registered.`);
            this.inputs[node.uuid].push(source.uuid);
        }
        this.bindings[source.uuid] = union(
            this.bindings[source.uuid],
            destinations.map(node => node.uuid));
        return true;
    }

    /**
     * Remove bindings between the source
     * and destinations.
     * @param source
     *        the source uuid
     * @param destinations
     *        the destination uuid_s
     * @return true iff source and destinations
     *        are registered
     */
    unbind(source, ...destinations) {
        return this.unbindAll(source, destinations);
    }

    /**
     * Remove bindings between the source
     * and destinations.
     * @param source
     *        the source uuid
     * @param destinations
     *        the destination uuid_s
     * @return true iff source and destinations
     *        are registered
     */
    unbindAll(source, destinations) {
        if (!hasProp(this.nodes, source.uuid))
            return false;
        for (let d of destinations) {
            if (!hasProp(this.nodes), d.uuid)
                return false;
        }
        this.bindings[source.uuid] = difference(
            this.bindings[source.uuid],
            destinations.map(node => node.uuid));
        return true;
    }

    /**
     * Get the node keyed by uuid.
     * @param uuid
     *        the node's uuid
     * @return
     *        the node keyed by uuid
     */
    nodeFromUuid(uuid) {
        return hasProp(this.nodes, uuid) ? this.nodes[uuid] : null;
    }

    /**
     * Get the state of the node keyed
     * by uuid.
     * @param uuid
     *        the node's uuid
     * @return
     *        the node's state
     */
    getNodeState(uuid) {
        return this.nodeFromUuid(uuid).getState();
    }

    /**
     * Should be called when a node's data changes.
     * Recursively updates bound nodes asynchronously.
     * @param node
     *        the node uuid
     * @return
     *        a Promise for the update
     */
    update(node) {
        let uuid = node.uuid;
        return new Promise((resolve, reject) => {
            resolve(this._terminalsFrom(uuid));
        })
        .map(uuid => this._update(uuid))
        .all()
        .caught(e => console.warn(e));
    }

    /**
     * Updates terminal node keyed by uuid, recursively
     * updating dirty nodes when necessary.
     * @param uuid
     *        the terminal uuid
     * @return
     *        a Promise for the update
     */
    _update(uuid) {
        let node = this.nodeFromUuid(uuid);
        // to avoid infinite recursion
        node.markDirty(false);

        // wrap in a promise
        return new Promise((resolve, reject) => {
            // update dirty dependencies first
            Promise.filter(
                this.inputs[uuid],
                id => this.nodeFromUuid(id).isDirty()
            ).map(id => {
                return this._update(id);
            })
            .all()
            // then update node
            .then(res => {
                let args = this.inputs[uuid].map(
                    id => this.getNodeState(id)
                );
                // console.log(args);
                // supporting asynchronous setState() functions
                Promise.resolve(node.setState(...args))
                .then(resolve())
                .caught(e => reject(e));
            });
        });
    }

    /**
     * Get terminal nodes from node keyed by uuid
     * @param uuid
     *        the node uuid
     * @return
     *        the nodes in a topological ordering
     */
    _terminalsFrom(uuid) {
        const visited = new Set();
        const stack = [uuid];
        // const sorted = [];
        const terminals = [];

        // Depth-first search from uuid
        while (stack.length > 0) {
            let current = stack.pop();
            let terminal = true;
            visited.add(current);
            for (let child of this.bindings[current]) {
                if (!visited.has(child)) {
                    terminal = false;
                    stack.push(child);
                    this.nodeFromUuid(child).markDirty(true);
                }
            }
            if (terminal)
                terminals.push(current);
            // sorted.push(current);
        }
        // console.log(terminals);
        return terminals;
    }

}

var FlowGraph = new _FlowGraph();
export default FlowGraph;