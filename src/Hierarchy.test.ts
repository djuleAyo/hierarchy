import { Hierarchy } from "./Hierarchy";
import {assert} from "chai";
import {describe, it, before, beforeEach} from 'mocha';
import * as _ from "lodash";

// tslint:disable-next-line:one-variable-per-declaration
let h: Hierarchy;
let triangle: Hierarchy;

describe("Hierarchy", () => {

    beforeEach(() => {
        h = new Hierarchy('h');
    });

    describe("getParentBranch", () => {
        it("should return [] if this is root", () => {
            assert.deepEqual(h.getParentBranch(), []);
        });
        it("should return all parents up to the root including", () => {
            const h1 = new Hierarchy(1);
            h.addChild(h1);
            const parentBranch = h1.getParentBranch();
            assert.deepEqual(parentBranch, [h]);
        });
        it("should return all parents up to the root including", () => {
            const h1 = new Hierarchy(1);
            const h2 = new Hierarchy(2);
            h.addChild(h1);
            h1.addChild(h2);

            assert.deepEqual(h2.getParentBranch(), [h, h1]);
        });
    });
    describe("getAncestorsUntil", () => {
        it("should return [] if root", () => {
            assert.deepEqual([], h.getAncestorsUntil(h));
        });
        it("should return [] if this", () => {
            const h1 = new Hierarchy(1);
            h.addChild(h1);
            assert.deepEqual([], h1.getAncestorsUntil(h1));
        });

        it("should be same as get parent branch if root is given", () => {
            const h1 = new Hierarchy(1);
            const h2 = new Hierarchy(2);
            h.addChild(h1);
            h1.addChild(h2);
            assert.deepEqual(h2.getParentBranch(), h2.getAncestorsUntil(h));
        });
        it("should throw if non parent is given", () => {
            const h1 = new Hierarchy(1);
            assert.throws(() => {
                h1.getAncestorsUntil(h);
            });
        });
    });
    describe("contains", () => {
        it("should return true for this", () => {
            assert.isTrue(h.contains(h));
        });

        it("should return true for direct child", () => {
            const h1 = new Hierarchy(1);
            h.addChild(h1);

            assert.isTrue(h.contains(h1));
        });

        it("should return true for indirect child", () => {
            const h1 = new Hierarchy(1);
            const h2 = new Hierarchy(2);
            h.addChild(h1);
            h1.addChild(h2);

            assert.isTrue(h.contains(h2));
        });

        it("should return false for non child", () => {
            const h1 = new Hierarchy(1);
            assert.isFalse(h.contains(h1));
        });
    });
    describe("belongs", () => {
        it("should return true for this", () => {
            assert.isTrue(h.contains(h));
        });

        it("should return true for direct parent", () => {
            const h1 = new Hierarchy(1);
            h.addChild(h1);
            assert.isTrue(h1.belongs(h));
        });

        it("should return true for indirect parent", () => {
            const h1 = new Hierarchy(1);
            const h2 = new Hierarchy(2);
            h.addChild(h1);
            h1.addChild(h2);

            assert.isTrue(h2.belongs(h));
        });

        it("should return false for non parent", () => {
            const h1 = new Hierarchy(1);
            assert.isFalse(h.belongs(h1));
        });

        it("should return false for child", () => {
            const h1 = new Hierarchy(1);
            assert.isFalse(h.belongs(h1));
        });
    });
    describe("addChild", () => {
        it("should maybe not be tested", () => {
            const h1 = new Hierarchy(1);
            const len = h.children.length;
            h.addChild(h1);
            assert.isTrue(h.children.length === len + 1 && h.children.includes(h1));
        });
        it("should throw if already contained", () => {
            const h1 = new Hierarchy(1);
            h.addChild(h1);
            assert.throws(() => {
                h.addChild(h1);
            });
        });
    });
    describe("getParentsDepth", () => {
        it("should accept only non negative values", () => {
            assert.throws(() => {
                h.getParentsDepth(-1);
            });
        });

        it("should return [] when 0 is given", () => {
            assert.deepEqual([], h.getParentsDepth(0));
        });

        it("should return maximum n parents", () => {
            const h1 = new Hierarchy(1);
            const h2 = new Hierarchy(2);
            h.addChild(h1);
            h1.addChild(h2);

            assert.deepEqual(h2.getParentsDepth(1), [h1]);
        });

        it("should return maximum n parents", () => {
            const h1 = new Hierarchy(1);
            const h2 = new Hierarchy(2);
            h.addChild(h1);
            h1.addChild(h2);

            assert.deepEqual(h2.getParentsDepth(2), [h, h1]);
        });
    });
    describe("getMinimalSufficientMark", () => {
        it("should return only [this] if it is sufficient", () => {
            assert.deepEqual([h], h.getMinimalSufficientMark());
        });

        it("should return all parents until one with sufficient mark", () => {
            const h1 = new Hierarchy(1, false);
            const h2 = new Hierarchy(2, false);
            h.addChild(h1);
            h1.addChild(h2);
            assert.deepEqual(h2.getMinimalSufficientMark(), [h, h1, h2]);
        });
        it("should return all parents until one with sufficient mark", () => {
            const h1 = new Hierarchy(1);
            const h2 = new Hierarchy(2, false);
            h.addChild(h1);
            h1.addChild(h2);
            assert.deepEqual(h2.getMinimalSufficientMark(), [h1, h2]);
        });
    });
    describe("getPathToChild", () => {
        it("should return [] if not child", () => {
            const h1 = new Hierarchy(1, false);
            assert.deepEqual([], h.getPathToChild(h1));
        });
        it("should return [] if not child", () => {
            const h1 = new Hierarchy(1, false);
            h.addChild(h1);
            assert.deepEqual([], h1.getPathToChild(h));

        });
        it("should contain both parent and child", () => {
            const h1 = new Hierarchy(1, false);
            h.addChild(h1);
            const path = h.getPathToChild(h1);
            assert.isTrue(path.includes(h) && path.includes(h1));
        });
    });
    describe("isBranch", () => {
        it("should return true for this", () => {
            assert(h.isBranch([h]));
        });
        it("should return true parent and son", () => {
            const h1 = new Hierarchy(1, false);
            h.addChild(h1);
            assert(h.isBranch([h, h1]));
        });

        it("should return true for a branch no matter given order", () => {
            const h1 = new Hierarchy(1, false);
            h.addChild(h1);
            assert(h.isBranch([h1, h]));
        });

        it("should return true for father son and grandson", () => {
            const h1 = new Hierarchy(1, false);
            const h2 = new Hierarchy(2, false);
            h.addChild(h1);
            h1.addChild(h2);
            assert(h.isBranch([h1, h, h2]));
        });
        it("should return false for siblings", () => {
            const h1 = new Hierarchy(1, false);
            const h2 = new Hierarchy(2, false);
            h.addChild(h1);
            h.addChild(h2);
            assert.isFalse(h.isBranch([h1, h2]));
        });
        it("should return false for unrelated hierarchies", () => {
            const h1 = new Hierarchy(1, false);
            assert.isFalse(h.isBranch([h, h1]));
        });
    });
    describe("isOnBranch", () => {
        it("should return true for this", () => {
            assert(h.isOnBranch([h]));
        });
        it("should return true parent and son", () => {
            const h1 = new Hierarchy(1, false);
            h.addChild(h1);
            assert(h.isOnBranch([h, h1]));
        });

        it("should return true for a branch no matter given order", () => {
            const h1 = new Hierarchy(1, false);
            h.addChild(h1);
            assert(h.isOnBranch([h1, h]));
        });

        it("should return true for father son and grandson", () => {
            const h1 = new Hierarchy(1, false);
            const h2 = new Hierarchy(2, false);
            h.addChild(h1);
            h1.addChild(h2);
            assert(h.isOnBranch([h1, h, h2]));
        });
        it("should return false for siblings", () => {
            const h1 = new Hierarchy(1, false);
            const h2 = new Hierarchy(2, false);
            h.addChild(h1);
            h.addChild(h2);
            assert.isFalse(h.isOnBranch([h1, h2]));
        });
        it("should return false for unrelated hierarchies", () => {
            const h1 = new Hierarchy(1, false);
            assert.isFalse(h.isOnBranch([h, h1]));
        });
        it("should return true for father and grandson", () => {
            const h1 = new Hierarchy(1, false);
            const h2 = new Hierarchy(2, false);
            h.addChild(h1);
            h1.addChild(h2);
            assert(h.isOnBranch([h, h2]));
        });
    });
    describe("isRoot", () => {
        it("should return true if is root of a hierarchy", () => {
            assert(h.isRoot());
        });
        it('should return false if it is not a root', () => {
            const h1 = new Hierarchy(1);
            h.addChild(h1);
            assert.isFalse(h1.isRoot());
        });
    });
    describe("isLeaf", () => {
        it("should return true if it has no children", () => {
            assert(h.isLeaf());
        });
        it('should return false if it has children', () => {
            const h1 = new Hierarchy(1);
            h.addChild(h1);
            assert.isFalse(h.isLeaf());
        });
    });
    describe("sameRoot", () => {
        it("should work", () => {
            const h1 = new Hierarchy(1);
            h.addChild(h1);
            assert(h.sameRoot(h1));
        });
        it("should not work", () => {
            const h1 = new Hierarchy(1);
            assert.isFalse(h.sameRoot(h1));
        });
    });

    describe("traverse", () => {
        beforeEach(() => {
            triangle = makeTriangle();
        });
        it("should work root left right itteration by default", () => {
            let order = '';
            triangle.traverse(
                (x) => order += x.mark,
            );
            assert.equal(order, "1245367");
        });
        it("should work for left root right itteration", () => {
            let order = '';
            triangle.traverse(
                (x) => order += x.mark,
                ['left', 'root', 'right']
            );
            assert.equal(order, "4251637");
        });
        it("should work for left right root itteration", () => {
            let order = '';
            triangle.traverse(
                (x) => order += x.mark,
                ['left', 'right', 'root']
            );
            assert.equal(order, "4526731");
        });
        it("should work for root right left itteration", () => {
            let order = '';
            triangle.traverse(
                (x) => order += x.mark,
                ['root', 'right', 'left']
            );
            assert.equal(order, "1376254");
        });

        it("should work for right left root itteration", () => {
            let order = '';
            triangle.traverse(
                (x) => order += x.mark,
                ['right', 'left', 'root']
            );
            assert.equal(order, "7635421");
        });
        it("should work for root right left itteration", () => {
            let order = '';
            triangle.traverse(
                (x) => order += x.mark,
                ['right', 'root', 'left']
            );
            assert.equal(order, "7361524");
        });

        it("should throw if invalid order given", () => {
            assert.throws(() => {
                triangle.traverse(
                    () => undefined,
                    ['root', 'root', 'left']
                );
            });
        });
        it("should have working stop criteria", () => {
            let order = '';
            triangle.traverse(
                (x) => order += x.mark,
                ['right', 'root', 'left'],
                () => order.length > 3
            );
            assert.equal(order, "7361");
        });
    });
});

function makeTriangle() {
    const hierarchies = [];
    const range = _.range(1, 8);
    for(const i of range) {
        hierarchies.push(new Hierarchy(i));
        if (i > 1) hierarchies[Math.floor(i / 2) - 1].addChild(hierarchies[i - 1]);
    }
    return hierarchies[0];
}