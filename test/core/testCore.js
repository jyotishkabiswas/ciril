var chai = require('chai'),
    expect = chai.expect;

var Ciril = require('../..'),
    FlowNode = Ciril.FlowNode,
    Transformer = Ciril.Transformer;

describe('Test binding, transform, and updates.', function () {

    Ciril.clear();
    var node = new FlowNode();
    var node2 = new FlowNode();

    it('Nodes should be registered on creation', function (done) {
        expect(Ciril.nodeFromUuid(node.uuid)).to.equal(node);
        expect(Ciril.nodeFromUuid(node2.uuid)).to.equal(node2);
        done();
    });

    it('getNodeState() should return current node state.', function (done) {
        node.setState(1);
        expect(Ciril.getNodeState(node.uuid)).to.equal(node.getState());
        expect(Ciril.getNodeState(node2.uuid)).to.not.exist;
        done();
    });

    var xf = new Transformer(function(x) {
        return 2 * x;
    });

    var xf2 = node2.transform(function (x) {
        return x / 2;
    });

    it('Nodes bindings should be recorded in both directions', function (done) {

        node.bind(xf).bind(node2);
        xf2.bind(node);
        expect(Array.from(Ciril._bindings.get(node.uuid))).to.contain(xf.uuid);
        expect(Array.from(Ciril._inputs.get(node2.uuid))).to.contain(xf.uuid);

        done();
    });

    it('Nodes should be in consistent state after update()', function () {
        return node.update()
        .then(function () {
            expect(node.getState()).to.equal(1);
            expect(node2.getState()).to.equal(2);
        });
    });

    it('Nodes should be in consistent state after updateSync()', function (done) {
        node.setState(3);
        node.updateSync();
        expect(node.getState()).to.equal(3);
        expect(node2.getState()).to.equal(6);
        done();
    });

    it('Synchronized nodes should be consistent after update()', function () {

        xf2.bind(node);
        node2.setState(4);
        return node2.update()
        .then(function () {
            expect(node.getState()).to.equal(2);
            expect(node2.getState()).to.equal(4);
        });
    });

    it('Unbound nodes should not update', function () {
        node.unbind(xf);
        xf.unbind(node2);
        return node.setState(1).update().then(function () {
            expect(node.getState()).to.equal(1);
            expect(node2.getState()).to.equal(4);
            node.bind(xf).bind(node2);
            return node.update().then(function () {
                expect(node.getState()).to.equal(1);
                expect(node2.getState()).to.equal(2);
            });
        }).then();
    });

    it('Desynchronized nodes should not update', function () {
        Ciril.desynchronize(node, xf, node2, xf2);
        node2.setState(8);
        return node2.update()
        .then(function () {
            expect(node.getState()).to.equal(1);
            expect(node2.getState()).to.equal(8);
        });
    });

    it('Removing a node should delete it from FlowGraph', function (done) {
        node.remove();
        expect(Ciril._nodes.get(node.uuid)).to.not.exist;
        done();
    });

    it('Ciril.clear() should remove all nodes', function (done) {
        Ciril.clear();
        expect(Ciril._nodes).to.be.empty;
        done();
    });

});