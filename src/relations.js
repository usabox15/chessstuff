/*
Copyright 2020 Yegor Bitensky

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/


class ActionsRelation {
    /*
    Relation between whether piece and squares or square and pieces by piece action.
    Piece actions:
        ActionsRelation.MOVE;
        ActionsRelation.ATTACK;
        ActionsRelation.XRAY;
        ActionsRelation.COVER (protect);
        ActionsRelation.CONTROL (prevent opponent king move to).
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
        /*
        Params:
            target {whether some kind of piece or square instance};
            relatedName {string} - related items attribute (relate name).
        */

        this._target = target;
        this._relatedName = relatedName;
        this.refresh();
    }

    _checkKind(kind, except=null) {
        /*
        Check whether piece action kind is valid or not.
        Params:
            kind {string} - piece action kind;
            except {string} - additional valid value.
        */

        if (!this.#allKinds.includes(kind) && except != kind) {
            throw Error(`Wrong relation kind (${kind}) passed`);
        }
    }

    refresh(kind='all') {
        /*
        Refersh action kind values.
        Params:
            kind {string} - piece action kind.
        */

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
        /*
        Add action kind value.
        Params:
            kind {string} - piece action kind;
            item {whether some kind of piece or square instance} - action value;
            relate {boolean} - need to add target to relate action.
        */

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
        /*
        Remove action kind value.
        Params:
            kind {string} - piece action kind;
            item {whether some kind of piece or square instance} - action value;
            relate {boolean} - need to remove target from relate action.
        */

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
        /*
        Check whether particular action kind includes item.
        Params:
            kind {string} - piece action kind;
            item {whether some kind of piece or square instance} - action value.
        */

        this._checkKind(kind);
        if (!this[kind]) {
            return false;
        }
        return this[kind].filter(i => i.theSame(item)).length != 0;
    }
}


class PieceSquares extends ActionsRelation {
    constructor(target, relatedName) {
        /*
        Params:
            target {whether some kind of piece or square instance};
            relatedName {string} - related items attribute (relate name).
        */

        super(target, relatedName);
    }

    limit(kind, acceptedNames) {
        /*
        Limit some kind of Piece actions squares by Array of accepted square names.
        Params:
            kind {string} - piece action kind;
            acceptedNames {Array} - accepted square names.
        */

        this._checkKind(kind);
        if (!this[kind]) {
            return;
        }
        for (let square of this[kind].filter(square => !acceptedNames.includes(square.name.value))) {
            square[this._relatedName].remove(kind, this._target, false);
        }
        this[kind] = this[kind].filter(square => acceptedNames.includes(square.name.value));
        if (this[kind].length == 0) {
            this[kind] = null;
        }
    }
}


module.exports = {
    ActionsRelation: ActionsRelation,
    PieceSquares: PieceSquares
};
