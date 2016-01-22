var chai = require('chai'),
    expect = chai.expect;

var Ciril = require('../..'),
    FlowNode = Ciril.FlowNode,
    Transformer = Ciril.Transformer;


describe('Test factory methods for creating FlowNode types.', function () {
    var MyFlowClass;
    var myInstance;
    var myInstance2;
    var bound = false;
    var unbound = false;
    var inputBound = false;
    var inputUnbound = false;
    var removed = false;

    it ('Ciril.createClass() should return a subclass of FlowNode', function (done) {
        MyFlowClass = Ciril.createClass({
                setState: function () {
                    this.state = 5;
                    return "SUCCESS";
                },

                onBind: function (node) {
                    bound = true;
                },

                onUnbind: function (node) {
                    unbound = true;
                },

                onBindInput: function (input) {
                    inputBound = true;
                },

                onUnbindInput: function (input) {
                    inputUnbound = true;
                },

                onRemove: function () {
                    removed = true;
                }
            });
        expect(typeof MyFlowClass).to.equal('function');
        myInstance = new MyFlowClass(5);
        expect(myInstance instanceof MyFlowClass).to.be.true;
        expect(myInstance instanceof FlowNode).to.be.true;
        expect(myInstance.getState()).to.equal(5);
        expect(myInstance.setState()).to.equal("SUCCESS");
        done();
    });

    it ('Binding hooks should be called.', function (done) {
        myInstance2 = new MyFlowClass(5);
        expect(removed
            || bound
            || inputBound
            || unbound
            || inputUnbound).to.be.false;
        myInstance.bind(myInstance2);
        myInstance.unbind(myInstance2);
        myInstance.remove();
        expect(removed
            && bound
            && inputBound
            && unbound
            && inputUnbound).to.be.true;
        myInstance2.remove();
        done();
    });

    var OtherClass = function () {
        this.num = 0;
    };

    OtherClass.prototype = {
        increment: function () {
            this.num++;
            return this.update();
        },

        getInitialState: function () {
            return {
                val: 0
            };
        },

        getState: function () {
            return {
                val: this.num
            };
        }
    };

    OtherClass.prototype.constructor = OtherClass;

    it ('Ciril.createMixin() should return a mixin with FlowNode', function () {
        var MyMixin = Ciril.createMixin(OtherClass);
        expect(typeof MyMixin).to.equal('function');
        var instance = new MyMixin();
        expect(instance instanceof MyMixin).to.be.true;
        expect(instance instanceof OtherClass).to.be.true;
        expect(instance instanceof FlowNode).to.be.false;
        return instance.increment().then(function () {
            expect(instance.getState().val).to.equal(1);
        })
    });
});