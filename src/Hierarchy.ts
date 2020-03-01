import * as _ from 'lodash';

type TraverseOption = "left"|"right"|"root";
type TraversePath = [TraverseOption, TraverseOption, TraverseOption];
type HierarchyHandler = (h: Hierarchy) => any;
type HierarchyMarker = (h: Hierarchy) => boolean;


/**
 * Describes Hierarchies on abstract level. May be used as any hierarchy.
 */
export class Hierarchy{
    constructor(
        public mark: any,
        /**
         * Mark may be sufficient or insufficient. If mark is insufficient it
         * notes that older marks must be specified to map a mark to hierarchy
         */
        public sufficient = true
    ) {
    }
    
    children: Hierarchy[] = [];
    parent: Hierarchy = this;
    root: Hierarchy = this;
    generation = 0;

    public traverse(
        cb:            HierarchyHandler,
        traversePath:  TraversePath  = ["root", "left", "right"],
        stopCriteria:  HierarchyMarker = () => false
    ) {
        validateOrder(traversePath);

        const pathCode = traversePath
            .join('')
            .replace("left", "1")
            .replace("right", "2")
            .replace("root", "0")
        ;

        this._traverse(cb, pathCode, stopCriteria)

    }

    public getParentBranch() {
        const branch: Hierarchy[] = [];
        if (this === this.root) return branch;
        let i = this.parent;
        while (i !== i.parent) { branch.push(i); i = i.parent; }
        branch.push(i);
        return _.reverse(branch);
    }

    public getAncestorsUntil(h: Hierarchy) {
        if (h.root === this) return [];
        if (h.root !== this.root) throw new Error("Internal Error: getAncestorsUntil\
 cannot search for hierarchies with distinct roots");

        const branch: Hierarchy[] = [];

        if (h === this) return branch;

        let i = this.parent;

        while (i !== h && i !== this.root) {
            branch.push(i);
            i = i.parent;
        }
        branch.push(i);

        if (i === this.root && this.root !== h)
            throw new Error('Internal Error: getAncestorsUntil got a hierarchy that is not an ancestor');

        return _.reverse(branch);
    }

    public contains(h: Hierarchy): boolean {
        if (h.root !== this.root) return false;
        if (this === h) return true;
        let branch;
        try {
            branch = h.getAncestorsUntil(this);
        } catch (error) {
            return false;
        }
        return !!branch.length;
    }
    public belongs(h: Hierarchy): boolean {
        if (h.root !== this.root) return false;
        const branch = this.getAncestorsUntil(h);
        return !!branch.length;
    }

    public addChild(h: Hierarchy): void {
        if (this.contains(h)) throw new Error("Internal Error: Adding know subhierarchy");
        this.children.push(h);
        h.generation = this.generation + 1;
        h.parent = this;
        h.root = this.root;
    }

    public getParentsDepth(d: number): Hierarchy[] {
        if (d < 0) throw new Error("Internal Error: Must give positive value for depth");
        if (!d) return [];
        const retVal = [];
        let i = this.parent;
        d--;
        while (d && i !== i.root) {
            retVal.push(i);
            i = i.parent;
            d--;
        }
        retVal.push(i);
        return _.reverse(retVal);
    }

    /**
     * Gets parenting subbranch which inludes the leaf - this
     * in which all elements but first have insufficient mark
     */
    public getMinimalSufficientMark(): Hierarchy[] {
        if (this.sufficient) return [this];
        let i: Hierarchy = this.parent;
        let retVal: Hierarchy[] = [this];
        while (!i.sufficient && i.root !== i) {
            retVal = [...retVal, i];
            i = i.parent;
        }
        if (i.sufficient) retVal.push(i);
        return _.reverse(retVal);
    }

    /**
     * Get path from this to child
     */
    public getPathToChild(h: Hierarchy): Hierarchy[] {
        if (!this.contains(h)) return [];

        const branch = h.getAncestorsUntil(this);

        return [...branch, h];
    }

    public isBranch(hs: Hierarchy[]): boolean {
        hs = Array.from(new Set(hs));
        const contained = hs.slice().map(h => this.contains(h));
        if (contained.includes(false)) return false;
        hs.sort((h1, h2) => h1.generation - h2.generation);

        for (let i = 0; i < hs.length - 1; i++) {
            const cur = hs[i];
            const next = hs[i + 1];
            if (!cur.children.includes(next)) return false;
        }
        return true;
    }

    public isOnBranch(hs: Hierarchy[]): boolean {
        hs = Array.from(new Set(hs));
        const contained = hs.slice().map(h => this.contains(h));
        if (contained.includes(false)) return false;
        hs.sort((h1, h2) => h1.generation - h2.generation);

        for (let i = 0; i < hs.length - 1; i++) {
            const cur = hs[i];
            const next = hs[i + 1];
            if (!cur.contains(next)) return false;
        }
        return true;

    }

    public isRoot() { return !this.generation; }
    public isLeaf() { return !!!this.children.length; }
    public sameRoot(h: Hierarchy) { return this.root === h.root; }
    private _traverse(
        cb:            HierarchyHandler,
        pathCode:  string,
        stopCriteria?: HierarchyMarker
    ) {
        const handleThis = () => {
            if (stopCriteria && stopCriteria(this)) return;
            cb(this);
        }

        switch (pathCode) {
            case "012":
                handleThis()
                for (const child of this.children) child._traverse(cb, pathCode, stopCriteria);
                break;

            case "021":
                handleThis()
                for (const child of _.reverse(this.children)) child._traverse(cb, pathCode, stopCriteria);
                break;

            case "102":
                if (this.children.length) {
                    this.children[0]._traverse(cb, pathCode, stopCriteria);
                }
                handleThis()
                for (const right of this.children.slice(1))
                    right._traverse(cb, pathCode, stopCriteria);
                break;

            case "120":
                for (const child of this.children)
                    child._traverse(cb, pathCode, stopCriteria);
                handleThis()
                break;

            case "210":
                for (const child of _.reverse(this.children))
                    child._traverse(cb, pathCode, stopCriteria);
                handleThis()
                break;

            case "201":
                if (this.children.length) {
                    (_.nth(this.children, -1) as Hierarchy)._traverse(cb, pathCode, stopCriteria);
                }
                handleThis()
                for (const left of _.reverse(this.children).slice(1) )
                    left._traverse(cb, pathCode, stopCriteria);
                break;

        }
    }
}

function validateOrder(order: TraversePath) {
    if (
        order.length !== 3
        || !order.includes('left')
        || !order.includes("right")
        || !order.includes("root")
    ) throw new Error("Internal Error: Traveslas path must specify left right and root each once.")
}
