# Hierarchy

## Installation
`npm i @djuleayo/hierarchy`

## Description

>In memory implementation of a hierarchy. 

Objects are hierarchies. They have keys, also called nodes and other names.
Here they are called Marks. **Hierarchy** allows marks to be objects, not just
strings like in js object. It also provides set of operations custom to hierarchies.
See examples for more.

## Basic usage
```javascript
let Hierarchy = require('@djuleayo/hierarchy');

let h = new Hierarchy({
  name: 'My fancy mark',
  desription: 'This is used for...'
});

let child = new Hierarchy('subhierarchy');

h.addChild(child);

let isDescendant = child.belongs(h);
let branch = child.getParentBranch();

console.log(isDescendant, JSON.stringify(branch.map(x => x.mark), null, 2));
```

## GitHub Repository
[Check it out.](https://github.com/djuleAyo/hierarchy)