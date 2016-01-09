var chai = require('chai'),
    expect = chai.expect;

var ciril = require('..'),
    DataNode = ciril.DataNode,
    Transformer = ciril.Transformer,
    FlowGraph = ciril.FlowGraph;


describe('Basic binding, transform, and update test.', function () {
    var node = new DataNode();
    var node2 = new DataNode();

    it('Nodes should be registered on creation', function (done) {
        expect(FlowGraph.nodeFromUuid(node.uuid)).to.equal(node);
        expect(FlowGraph.nodeFromUuid(node2.uuid)).to.equal(node2);
        done();
    });

    it('FlowGraph should return current node state.', function (done) {
        node.setState(1);
        expect(FlowGraph.getNodeState(node.uuid)).to.equal(node.getState());
        expect(FlowGraph.getNodeState(node2.uuid)).to.not.exist;
        done();
    });

    it('Nodes bindings should be recorded in both directions', function (done) {
        var xf = new Transformer(function(x) {
            return 2 * x;
        });

        node.bind(xf)
        .bind(node2)
        .transform(function(x) {
            return x / 2;
        })
        .bind(node);
        expect(FlowGraph.bindings[node.uuid]).to.contain(xf.uuid);
        expect(FlowGraph.inputs[node2.uuid]).to.contain(xf.uuid);

        done();
    });

    it('Nodes should be in consistent state after update()', function () {
        return node.update()
        .then(function (res) {
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
        node2.transform(function (x) {
            return x / 2;
        })
        .bind(node);
        node2.setState(4);
        return node2.update()
        .then(function (res) {
            expect(node.getState()).to.equal(2);
            expect(node2.getState()).to.equal(4);
        });
    });

});