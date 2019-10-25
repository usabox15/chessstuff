class ActionsRelation {
    /*
    Relation between whether piece and squares or square and pieces by piece action.
    */

    #allKinds = ['move', 'attack', 'xray', 'cover', 'control'];

    constructor(target) {
        this.target = target;
        this.refresh();
    }

    refresh(kind='all') {
        let kinds = kind === 'all' ? this.#allKinds : [kind];
        for (let kind of kinds) {
            if (this[kind]) {
                for (let item of this[kind]) {
                    item[this._getRelatedName(item)].remove(kind, this.target, false);
                }
                this[kind] = null;
            }
        }
    }

    add(kind, item, relate=true) {
        if (this[kind]) {
            this[kind].push(item);
        }
        else {
            this[kind] = [item];
        }
        if (relate) {
            item[this._getRelatedName(item)].add(kind, this.target, false);
        }
    }

    remove(kind, item, relate=true) {
        if (this[kind]) {
            this[kind] = this[kind].filter(i => !i.theSame(item));
            if (this[kind].length == 0) {
                this[kind] = null;
            }
        }
        if (relate) {
            item[this._getRelatedName(item)].remove(kind, this.target, false);
        }
    }

    includes(kind, item) {
        if (!this[kind]) {
            return false;
        }
        return this[kind].filter(i => i.theSame(item)).length != 0;
    }

    _getRelatedName(item) {
        return item instanceof Piece ? 'squares' : 'pieces';
    }
}


class PieceSquares extends ActionsRelation {
    constructor(target) {
        super(target);
    }

    limit(kind, acceptedNames) {
        // limit some kind of Piece actions squares by Array of accepted square names
        if (this[kind]) {
            this[kind] = this[kind].filter(square => acceptedNames.includes(square.name.value));
            for (let square of this[kind].filter(square => !acceptedNames.includes(square.name.value))) {
                square[this._getRelatedName(square)].remove(kind, this.target, false);
            }
        }
    }
}


module.exports = {
    ActionsRelation: ActionsRelation,
    PieceSquares: PieceSquares
};
