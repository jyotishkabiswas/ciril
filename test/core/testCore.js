var chai = require('chai'),
    expect = chai.expect;

var Ciril = require('../..'),
    FlowNode = Ciril.FlowNode,
    Transformer = Ciril.Transformer;

describe('#Ciril', function () {

    var node;
    var node2;
    var xf;
    var xf2;

    before(function (done) {
        Ciril.clear(false);
        node = new FlowNode();
        done();
    })

    describe('FlowNode.*', function () {
        it('Nodes should be registered on creation', function (done) {
            expect(Ciril.nodeFromUuid(node.uuid)).to.equal(node);
            expect(node.isRegistered()).to.be.true;
            done();
        });

        it('getNodeState() should return current node state.', function (done) {
            node.setState(1);
            expect(Ciril.getNodeState(node.uuid)).to.equal(node.getState());
            done();
        });

        it('Nodes bindings should be recorded in both directions', function (done) {
            xf = new Transformer(function(x) {
                return 2 * x;
            });
            node2 = node.bind(xf).bind(1);
            xf2 = node2.transform(function (x) {
                return x / 2;
            });
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
            node.setState(1);
            return node.update().then(function () {
                expect(node.getState()).to.equal(1);
                expect(node2.getState()).to.equal(4);
                xf.bindInputs(node).bind(node2);
                return node.update()
            }).then(function () {
                expect(node.getState()).to.equal(1);
                expect(node2.getState()).to.equal(2);
            });
        });
    });

    describe(".*", function () {
        it('Desynchronized nodes should not update', function () {
            Ciril.desynchronize(node, xf, node2, xf2);
            node2.setState(8);
            return node2.update().then(function () {
                expect(node.getState()).to.equal(1);
                expect(node2.getState()).to.equal(8);
            });
        });

        it('Removing a node should delete it from FlowGraph', function (done) {
            node.remove();
            expect(Ciril._nodes.get(node.uuid)).to.not.exist;
            done();
        });

        it('Ciril.clear() should remove all nodes', function () {
            return Ciril.clear().then(function () {
                expect(Ciril._nodes).to.be.empty;
            });
        });
    });

    after(function () {
        return Ciril.clear();
    });

});