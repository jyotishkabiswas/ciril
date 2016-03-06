import Promise from 'bluebird';
import remove from 'lodash/array/remove';
import cloneDeep from 'lodash/lang/cloneDeep';
// renaming
var hasProp = require('lodash/object/has');

/**
 * Maintains bindings between various nodes, and
 * manages all node updates. The nodes themselves
 * are unaware of their bindings -- this information
 * is kept within the FlowGraph.
 *
 * The FlowGraph structure is meant for internal
 * use. The public API is exposed through the Ciril
 * object.
 */
class _FlowGraph {

    constructor() {
        // uuid --> node
        this.nodes = new Map([]);
        // uuid --> Set<uuid>
        this.bindings = new Map([]);
        // uuid --> [uuid]
        this.inputs = new Map([]);
        // Set<Promise>
        this.pending = new Set([]);
    }

    /**
     * Register the node with this FlowGraph.
     * @param node
     *        the node
     * @return
     *        true iff the node doesn't already
     *        exist in the store.
     */
    register(node) {
        if (!hasProp(node, 'uuid'))
            throw new Error('register(node): node must ' +
                'have a uuid.');
        let uuid = node.uuid;
        if (this.nodes.has(uuid))
            throw new Error('register(node): a node with ' +
                'the given uuid is already registered, ' +
                'try generating a new one.');
        this.nodes.set(uuid, node);
        this.bindings.set(uuid, new Set([]));
        this.inputs.set(uuid, []);
    }

    /**
     * Remove the given nodes from the FlowGraph.
     * Connected edges are removed as well.
     * @param nodes
     *        the nodes to remove
     */
    remove(...nodes) {
        this.removeAll(nodes);
    }

    /**
     * Remove the given nodes from the FlowGraph.
     * Connected edges are removed as well.
     * @param nodes
     *        the nodes to remove
     */
    removeAll(nodes) {
        nodes.forEach(node => {
            let uuid = node.uuid;
            this.inputs.get(uuid).map(
                id => this.nodeFromUuid(id)
            ).forEach(inp => this.unbind(inp, this));
            for (let id of this.bindings.get(uuid)) {
                let dest = this.nodeFromUuid(id);
                this.unbind(node, dest);
            }
            node.onRemove();
            this.nodes.delete(uuid);
        });
    }

    /**
     * Create a one-way data binding between
     * the source and each of the destinations.
     * @param source
     *        the source node
     * @param destinations
     *        the destination nodes
     * @return
     *        true iff source and destinations
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
        if (!this.isRegistered(source))
            throw new Error(`bindAll(...): source not registered.`)
        for (let node of destinations) {
            if (!this.isRegistered(node))
                throw new Error(`bindAll(...): destination not registered.`);
        }
        for (let node of destinations) {
            this.inputs.get(node.uuid).push(source.uuid);
            this.bindings.get(source.uuid).add(node.uuid);
            node.onBindInput(source);
            source.onBind(node);
        }
        return true;
    }

    /**
     * Bind the input nodes to the given node, in
     * the given order.
     * @param node
     *        the output node
     * @param inputs
     *        the input nodes
     */
    bindInputs(node, ...inputs) {
        this.bindAllInputs(node, inputs);
    }

    /**
     * Bind the input nodes to the given node, in
     * the given order.
     * @param node
     *        the output node
     * @param inputs
     *        the input nodes
     */
    bindAllInputs(node, inputs) {
        let uuid = node.uuid;
        let _inputs = this.inputs.get(uuid);
        if (_inputs.length > 0) {
            console.warn("bindAllInputs(...): Overwriting existing inputs");
            _inputs.map(
                id => this.nodeFromUuid(id)
            )
            .forEach(inp => this.unbind(inp, node));
        }
        for (let inp of inputs)
            this.bind(inp, node);
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
        if (!this.nodes.has(source.uuid))
            return false;
        for (let node of destinations) {
            if (!this.nodes.has(node.uuid)) {
                console.warn("unbindAll(...): Attempting to unbind unregistered node.")
                continue;
            }
            node.onUnbindInput(source);
            source.onUnbind(node);
            remove(this.inputs.get(node.uuid),
                id => id === source.uuid);
            this.bindings.get(source.uuid).delete(node.uuid);
            // remove direct reference to input state objects.
            node.state = cloneDeep(node.state);
        }
        return true;
    }

    /**
     * Create a cycle of bindings within nodes.
     * @param nodes
     *        the nodes to synchronize
     */
    synchronize(...nodes) {
        this.synchronizeAll(nodes);
    }

    /**
     * Create a cycle of bindings within nodes.
     * @param nodes
     *        a list of the nodes to synchronize
     */
    synchronizeAll(nodes) {
        if (nodes.length <= 1)
            return false;
        nodes.reduce((p, c, i, a) => {
            let next = (i + 1) % nodes.length;
            return this.bind(c, a[next]);
        });
    }

    /**
     * Inverse of this.synchronize(...nodes).
     * @param nodes
     *        the nodes to desynchronize
     */
    desynchronize(...nodes) {
        this.desynchronizeAll(nodes);
    }

    /**
     * Inverse of this.synchronizeAll(nodes).
     * @param nodes
     *        a list of the nodes to desynchronize
     */
    desynchronizeAll(nodes) {
        if (nodes.length <= 1)
            return;
        nodes.reduce((p, c, i, a) => {
            this.unbind(p, c);
            return c;
        }, nodes[nodes.length - 1]);
    }

    /**
     * Get the node keyed by uuid.
     * @param uuid
     *        the node's uuid
     * @return
     *        the node keyed by uuid
     */
    nodeFromUuid(uuid) {
        return this.nodes.has(uuid) ? this.nodes.get(uuid) : null;
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
     * @param nodes
     *        the nodes to update
     * @return
     *        a Promise for the update
     */
    update(...nodes) {
        return this.updateAll(nodes);
    }

    /**
     * Should be called when a node's data changes.
     * Recursively updates bound nodes asynchronously.
     * @param nodes
     *        the nodes to update
     * @return
     *        a Promise for the update
     */
    updateAll(nodes) {
        let p = Promise.map(nodes, node => {
            let uuid = node.uuid;
            return new Promise((resolve, reject) => {
                resolve(this._terminalsFrom(uuid));
            })
            .map(id => this._update(id))
            .all();
        })
        .all() // TODO: test with inconsistent updates
        this.pending.add(p);
        return p.then(res => this.pending.delete(p));
    }

    /**
     * Synchronous version of update(node).
     * Assumes setState() implementations on
     * dependent nodes are synchronous.
     * @param nodes
     *        the nodes to update
     */
    updateSync(...nodes) {
        this.updateAllSync(nodes);
    }

    /**
     * Synchronous version of update(node).
     * Assumes setState() implementations on
     * dependent nodes are synchronous.
     * @param nodes
     *        the nodes to update
     */
    updateAllSync(nodes) {
        nodes.forEach(node => {
            let uuid = node.uuid;
            this._terminalsFrom(uuid).forEach(
                id => this._updateSync(id)
            );
        });
    }

    /**
     * Removes all nodes and bindings. Completes
     * Pending updates first.
     * @param safe
     *        if safe, pending updates will
     *        be completed before FlowGraph is
     *        cleared.
     * @return
     *         a Promise for the clear, void if !safe
     */
    clear(safe=true) {
        if (safe) {
            // Finish remaining updates.
            return this.flush().then(res => this._clear())
            .caught(e => {
                console.warn(e.stack);
                this._clear();
            });
        } else {
            this._clear();
        }
    }

    /**
     * Return a promise for the completion of all pending
     * promises.
     * @return
     *        a promise for the completion.
     */
    flush() {
        return Promise.all(Array.from(this.pending));
    }

    /**
     * Clear this FlowGraph.
     */
    _clear() {
        this.nodes.clear();
        this.bindings.clear();
        this.inputs.clear();
        this.pending.clear();
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

        if (!node.isDirty())
            return Promise.resolve(false)

        node.markDirty(false);

        return Promise.map(
            this.inputs.get(uuid).filter(uuid => this.nodeFromUuid(uuid).isDirty()),
            id => this._update(id)
        )
        .all()
        // then update node
        .then(res => {
            let inputs = this.inputs.get(uuid)
            let changed = inputs.length > 0 ? inputs.reduce((p, uuid, i, a) => p || this.nodeFromUuid(uuid).changed) : false
            if (changed) {
                let args = inputs.map(id => this.getNodeState(id))
                // supporting asynchronous setState() functions
                return Promise.resolve(node.setState.apply(node, args))
            }
            node.changed = false
            return Promise.resolve(false)
        })
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
        let node = this.nodeFromUuid(uuid)
        if (!node.isDirty())
            return false
        node.markDirty(false)
        let upstream = this.inputs.get(uuid).filter(
            id => this.nodeFromUuid(id).isDirty()
        )
        .map(id => this._updateSync(id))
        let inputs = this.inputs.get(uuid)
        let changed = inputs.length > 0 ? inputs.reduce((p, uuid, i, a) => p || this.nodeFromUuid(uuid).changed) : false
        if (changed) {
            let args = inputs.map(id => this.getNodeState(id))
            return node.setState(...args)
        }
        node.changed = false
        return false
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
            for (let child of this.bindings.get(current)) {
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

    isRegistered(node) {
        return this.nodes.has(node.uuid);
    }

}

const FlowGraph = new _FlowGraph();
export default FlowGraph;