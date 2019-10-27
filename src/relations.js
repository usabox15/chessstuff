class ActionsRelation {
    /*
    Relation between whether piece and squares or square and pieces by piece action.
    There are piece actions:
      - ActionsRelation.MOVE;
      - ActionsRelation.ATTACK;
      - ActionsRelation.XRAY;
      - ActionsRelation.COVER (protect);
      - ActionsRelation.CONTROL (move or attack).
    There are create params:
      - target [whether some kind of piece or square instance];
      - relatedName [string] (related attribute name of target).
    */

    static MOVE = 'move';
    static ATTACK = 'attack';
    static XRAY = 'xray';
    static COVER = 'cover';
    static CONTROL = 'control';

    #allKinds = [
        ActionsRelation.MOVE,
        ActionsRelation.ATTACK,
        ActionsRelation.XRAY,
        ActionsRelation.COVER,
        ActionsRelation.CONTROL
    ];

    constructor(target, relatedName) {
        this._target = target;
        this._relatedName = relatedName;
        this.refresh();
    }

    _checkKind(kind, except=null) {
        if (!this.#allKinds.includes(kind) && except != kind) {
            throw Error(`Wrong relation kind (${kind}) passed`);
        }
    }

    refresh(kind='all') {
        this._checkKind(kind, 'all');
        let kinds = kind === 'all' ? this.#allKinds : [kind];
        for (let kind of kinds) {
            if (this[kind]) {
                for (let item of this[kind]) {
                    item[this._relatedName].remove(kind, this._target, false);
                }
            }
            this[kind] = null;
        }
    }

    add(kind, item, relate=true) {
        this._checkKind(kind);
        if (this[kind]) {
            this[kind].push(item);
        }
        else {
            this[kind] = [item];
        }
        if (relate) {
            item[this._relatedName].add(kind, this._target, false);
        }
    }

    remove(kind, item, relate=true) {
        this._checkKind(kind);
        if (this[kind]) {
            this[kind] = this[kind].filter(i => !i.theSame(item));
            if (this[kind].length == 0) {
                this[kind] = null;
            }
        }
        if (relate) {
            item[this._relatedName].remove(kind, this._target, false);
        }
    }

    includes(kind, item) {
        this._checkKind(kind);
        if (!this[kind]) {
            return false;
        }
        return this[kind].filter(i => i.theSame(item)).length != 0;
    }
}


class PieceSquares extends ActionsRelation {
    constructor(target, relatedName) {
        super(target, relatedName);
    }

    limit(kind, acceptedNames) {
        // limit some kind of Piece actions squares by Array of accepted square names
        this._checkKind(kind);
        if (this[kind]) {
            this[kind] = this[kind].filter(square => acceptedNames.includes(square.name.value));
            for (let square of this[kind].filter(square => !acceptedNames.includes(square.name.value))) {
                square[this._relatedName].remove(kind, this._target, false);
            }
        }
    }
}


module.exports = {
    ActionsRelation: ActionsRelation,
    PieceSquares: PieceSquares
};
