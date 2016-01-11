# Ciril

**This library is under active development, so bugs may exist and the API is likely to change significantly.**

### Why?

Complex applications contain many sources of data which interact and must be kept consistent as data changes. Ciril provides a way to create bindings between data stores to make sure updating any one store keeps other stores up to date. Optionally, data can be functionally transformed between nodes, allowing the application to use computed values from data.

### Usage

Create a data node:

```javascript
var ciril = require('ciril'),
    DataNode = ciril.DataNode;
// create data node with initial state 1.
var n1 = new DataNode(1);
// create another data node with no initial state.
var n2 = new DataNode();
```

Link the nodes via a transformer:

```javascript
n1.transform(function(x) {
    return 2 * x;
})
.bind(n2); // n1 -> 2*x -> n2
```

Update the nodes, returning a [Promise](http://bluebirdjs.com/docs/why-promises.html):

```javascript
n1.update()
.then(function(res){
    console.log(n1.getState()); // 1
    console.log(n2.getState()); // 2
});
```

Synchronize nodes through cyclic bindings:

```javascript
n2.transform(function(x) {
    return x / 2;
}).bind(n1); // n1 -> 2*x -> n2 -> x/2 -> n1
n2.setState(4);
n2.update()
.then(function(res){
    console.log(n1.getState()); // 2
    console.log(n2.getState()); // 4
});
```

### Caveats

#### Synchronization
Multiple can be synchronized so that changing one's data updates the rest. This is done by cyclically binding the nodes. Ciril doesn't update a node's state more than once during a given update pass. As such, it is up to the user to make sure that composing the transformations in a cycle yields the identity to make sure data is consistent at the end of the pass. It is possible that in the future, we will provide the option to check consistency in cycles at runtime to help debug consistency issues.
