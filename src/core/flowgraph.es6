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
        // uuid --> node
        this.nodes = {};
        // uuid --> [uuid]
        this.bindings = {};
        // uuid --> [uuid]
        this.inputs = {};
        // [Promise]
        this._queue = [];
        this._processing = null;
    }

    /**
     * Associate a node uuid with the node
     * within the flow graph.
     * @param node
     *        the node
     * @return
     *        true iff the node doesn't already
     *        exist in the store.
     */
    register(node) {
        let uuid = node.uuid;
        if (hasProp(this.nodes, uuid))
            return false;
        this.nodes[uuid] = node;
        this.bindings[uuid] = [];
        this.inputs[uuid] = [];
        return true;
    }

    /**
     * Create a one-way data binding between
     * the source and each of the destinations.
     * @param source
     *        the source node
     * @param destinations
     *        the destination nodes
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
     *        the source node
     * @param destinations
     *        the destination nodes
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
     *        the source node
     * @param destinations
     *        the destination nodes
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
     *        the source node
     * @param destinations
     *        the destination nodes
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
     *        the node to update
     * @return
     *        a Promise for the update
     */
    update(node) {
        let uuid = node.uuid;
        let p = new Promise((resolve, reject) => {
            resolve(this._terminalsFrom(uuid));
        })
        .map(uuid => this._update(uuid))
        .all()
        .caught(e => console.warn(e));
        return p;
    }

    /**
     * Synchronous version of update(node).
     * Assumes setState() implementations on
     * dependent nodes are synchronous.
     * @param node
     *        the node to update
     */
    updateSync(node) {
        let uuid = node.uuid;
        this._terminalsFrom(uuid).forEach(
            id => this._updateSync(id)
        );
    }

    /**
     * Synchronous version of _updateSync(node).
     * Assumes setState() implementations on
     * dependent nodes are synchronous.
     * @param node
     *        the node to update
     * @api private
     */
    _updateSync(uuid) {
        let node = this.nodeFromUuid(uuid);
        node.markDirty(false);
        this.inputs[uuid].filter(
            id => this.nodeFromUuid(id).isDirty()
        )
        .forEach(id => this._updateSync(id));
        let args = this.inputs[uuid].map(
            id => this.getNodeState(id)
        );
        node.setState(...args);
    }

    /**
     * Set the input order for a node. Used for
     * ensuring correct ordering of arguments for
     * transformers.
     * @param node
     *        the dependent node
     * @param inputs
     *        the input nodes
     */
    setInputs(node, ...inputs) {
        this.inputs[node] = inputs.map(n => n.uuid);
    }

    /**
     * Updates terminal node keyed by uuid, recursively
     * updating dirty nodes when necessary.
     * @param uuid
     *        the terminal uuid
     * @return
     *        a Promise for the update
     * @api private
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
     *        the terminal nodes
     * @api private
     */
    _terminalsFrom(uuid) {
        const visited = new Set();
        const stack = [uuid];
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
        }
        return terminals;
    }

}

var FlowGraph = new _FlowGraph();
export default FlowGraph;