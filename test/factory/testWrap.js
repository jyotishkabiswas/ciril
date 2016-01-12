var chai = require('chai'),
    expect = chai.expect;

var Ciril = require('../..'),
    wrap = Ciril.wrap,
    FlowNode = Ciril.FlowNode,
    Transformer = Ciril.Transformer;

describe('#Ciril.wrap()', function () {

    var x;
    var y = 4;
    var z = 3;
    var obj = {
        state: {
            val: "hello"
        },
        getState : function () {
            return this.state.val;
        },
        setState: function (val) {
            this.state.val = val;
            return this;
        }
    }
    var state = {
        field: "I am a state."
    };
    var wrapped;
    var wrappedState;

    before(function (done) {
        Ciril.clear(false);
        x = new FlowNode(2);
        done()
    })

    it('Wrapper should be automatically generated during node.bind()', function () {
        expect(x.isRegistered()).to.be.true;
        y = x.bind(y);
        z = y.bind(z);
        z.bind(x);
        expect(y.isRegistered()).to.be.true;
        expect(z.isRegistered()).to.be.true;
        return z.update().then(function () {
            expect(x.getState()).to.equal(3);
            expect(y.getState()).to.equal(3);
            expect(z.getState()).to.equal(3);
        })
    });

    it('Wrapped object methods should override FlowNode methods', function (done) {
        wrapped = Ciril.wrap(obj);
        expect(wrapped instanceof FlowNode).to.be.true;
        expect(wrapped.getState()).to.equal("hello");
        wrapped.setState("goodbye");
        expect(wrapped.getState()).to.equal("goodbye");
        done();
    });

    it('Wrapper should inherit FlowNode prototype', function () {
        expect(wrapped.isRegistered()).to.be.true;
        return wrapped.setState("hi again!").update().then(function () {
            expect(wrapped.getState()).to.equal("hi again!");
        });
    });

    it('Object without state property should be directly wrapped.', function () {
        wrappedState = wrap(state);
        expect(wrappedState instanceof FlowNode);
        expect(wrappedState.getState()).to.equal(state);
        return wrappedState.setState({field: "Another state"}).update().then(function () {
            expect(wrappedState.getState().field).to.equal("Another state");
        });
    });

    after(function () {
        return Ciril.clear();
    });
});