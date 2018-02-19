const adapter = require('./adapter');
const mutationAdapter = require('./mutation-adapter');
const xmlEscape = require('../util/xml-escape');
const MonitorRecord = require('./monitor-record');
const Clone = require('../util/clone');
const {Map} = require('immutable');

/**
 * @fileoverview
 * Store and mutate the VM block representation,
 * and handle updates from Scratch Blocks events.
 */

class Blocks {
    constructor () {
        /**
         * All blocks in the workspace.
         * Keys are block IDs, values are metadata about the block.
         * @type {Object.<string, Object>}
         */
        this._blocks = {};

        /**
         * All top-level scripts in the workspace.
         * A list of block IDs that represent scripts (i.e., first block in script).
         * @type {Array.<String>}
         */
        this._scripts = [];

        /**
         * Runtime Cache
         * @type {{inputs: {}, procedureParamNames: {}, procedureDefinitions: {}}}
         * @private
         */
        this._cache = {
            /**
             * Cache block inputs by block id
             * @type {object.<string, !Array.<object>>}
             */
            inputs: {},
            /**
             * Cache procedure Param Names by block id
             * @type {object.<string, ?Array.<string>>}
             */
            procedureParamNames: {},
            /**
             * Cache procedure definitions by block id
             * @type {object.<string, ?string>}
             */
            procedureDefinitions: {}
        };

    }

    /**
     * Blockly inputs that represent statements/branch.
     * are prefixed with this string.
     * @const{string}
     */
    static get BRANCH_INPUT_PREFIX () {
        return 'SUBSTACK';
    }

    /**
     * Provide an object with metadata for the requested block ID.
     * @param {!string} blockId ID of block we have stored.
     * @return {?object} Metadata about the block, if it exists.
     */
    getBlock (blockId) {
        return this._blocks[blockId];
    }

    /**
     * Get all known top-level blocks that start scripts.
     * @return {Array.<string>} List of block IDs.
     */
    getScripts () {
        return this._scripts;
    }

    /**
      * Get the next block for a particular block
      * @param {?string} id ID of block to get the next block for
      * @return {?string} ID of next block in the sequence
      */
    getNextBlock (id) {
        const block = this._blocks[id];
        return (typeof block === 'undefined') ? null : block.next;
    }

    /**
     * Get the branch for a particular C-shaped block.
     * @param {?string} id ID for block to get the branch for.
     * @param {?number} branchNum Which branch to select (e.g. for if-else).
     * @return {?string} ID of block in the branch.
     */
    getBranch (id, branchNum) {
        const block = this._blocks[id];
        if (typeof block === 'undefined') return null;
        if (!branchNum) branchNum = 1;

        let inputName = Blocks.BRANCH_INPUT_PREFIX;
        if (branchNum > 1) {
            inputName += branchNum;
        }

        // Empty C-block?
        const input = block.inputs[inputName];
        return (typeof input === 'undefined') ? null : input.block;
    }

    /**
     * Get the opcode for a particular block
     * @param {?object} block The block to query
     * @return {?string} the opcode corresponding to that block
     */
    getOpcode (block) {
        return (typeof block === 'undefined') ? null : block.opcode;
    }

    /**
     * Get all fields and their values for a block.
     * @param {?object} block The block to query.
     * @return {?object} All fields and their values.
     */
    getFields (block) {
        return (typeof block === 'undefined') ? null : block.fields;
    }

    /**
     * Get all non-branch inputs for a block.
     * @param {?object} block the block to query.
     * @return {?Array.<object>} All non-branch inputs and their associated blocks.
     */
    getInputs (block) {
        if (typeof block === 'undefined') return null;
        let inputs = this._cache.inputs[block.id];
        if (typeof inputs !== 'undefined') {
            return inputs;
        }

        inputs = {};
        for (const input in block.inputs) {
            // Ignore blocks prefixed with branch prefix.
            if (input.substring(0, Blocks.BRANCH_INPUT_PREFIX.length) !==
                Blocks.BRANCH_INPUT_PREFIX) {
                inputs[input] = block.inputs[input];
            }
        }

        this._cache.inputs[block.id] = inputs;
        return inputs;
    }

    /**
     * Get mutation data for a block.
     * @param {?object} block The block to query.
     * @return {?object} Mutation for the block.
     */
    getMutation (block) {
        return (typeof block === 'undefined') ? null : block.mutation;
    }

    /**
     * Get the top-level script for a given block.
     * @param {?string} id ID of block to query.
     * @return {?string} ID of top-level script block.
     */
    getTopLevelScript (id) {
        let block = this._blocks[id];
        if (typeof block === 'undefined') return null;
        while (block.parent !== null) {
            block = this._blocks[block.parent];
        }
        return block.id;
    }

    /**
     * Get the procedure definition for a given name.
     * @param {?string} name Name of procedure to query.
     * @return {?string} ID of procedure definition.
     */
    getProcedureDefinition (name) {
        const blockID = this._cache.procedureDefinitions[name];
        if (typeof blockID !== 'undefined') {
            return blockID;
        }

        for (const id in this._blocks) {
            if (!this._blocks.hasOwnProperty(id)) continue;
            const block = this._blocks[id];
            if (block.opcode === 'procedures_definition') {
                const internal = this._getCustomBlockInternal(block);
                if (internal && internal.mutation.proccode === name) {
                    this._cache.procedureDefinitions[name] = id; // The outer define block id
                    return id;
                }
            }
        }

        this._cache.procedureDefinitions[name] = null;
        return null;
    }

    /**
     * Get names of parameters for the given procedure.
     * @param {?string} name Name of procedure to query.
     * @return {?Array.<string>} List of param names for a procedure.
     */
    getProcedureParamNamesAndIds (name) {
        const cachedNames = this._cache.procedureParamNames[name];
        if (typeof cachedNames !== 'undefined') {
            return cachedNames;
        }

        for (const id in this._blocks) {
            if (!this._blocks.hasOwnProperty(id)) continue;
            const block = this._blocks[id];
            if (block.opcode === 'procedures_prototype' &&
                block.mutation.proccode === name) {
                const names = JSON.parse(block.mutation.argumentnames);
                const ids = JSON.parse(block.mutation.argumentids);
                this._cache.procedureParamNames[name] = [names, ids];
                return this._cache.procedureParamNames[name];
            }
        }

        this._cache.procedureParamNames[name] = null;
        return null;
    }

    duplicate () {
        const newBlocks = new Blocks();
        newBlocks._blocks = Clone.simple(this._blocks);
        newBlocks._scripts = Clone.simple(this._scripts);
        return newBlocks;
    }
    // ---------------------------------------------------------------------

    /**
     * Create event listener for blocks and variables. Handles validation and
     * serves as a generic adapter between the blocks, variables, and the
     * runtime interface.
     * @param {object} e Blockly "block" or "variable" event
     * @param {?Runtime} optRuntime Optional runtime to forward click events to.
     */
    blocklyListen (e, optRuntime) {
        // Validate event
        if (typeof e !== 'object') return;
        if (typeof e.blockId !== 'string' && typeof e.varId !== 'string') {
            return;
        }
        const stage = optRuntime.getTargetForStage();

        // UI event: clicked scripts toggle in the runtime.
        if (e.element === 'stackclick') {
            if (optRuntime) {
                optRuntime.toggleScript(e.blockId, {stackClick: true});
            }
            return;
        }

        // Block create/update/destroy
        switch (e.type) {
        case 'create': {
            const newBlocks = adapter(e);
            // A create event can create many blocks. Add them all.
            for (let i = 0; i < newBlocks.length; i++) {
                this.createBlock(newBlocks[i]);
            }
            break;
        }
        case 'change':
            this.changeBlock({
                id: e.blockId,
                element: e.element,
                name: e.name,
                value: e.newValue
            }, optRuntime);
            break;
        case 'move':
            this.moveBlock({
                id: e.blockId,
                oldParent: e.oldParentId,
                oldInput: e.oldInputName,
                newParent: e.newParentId,
                newInput: e.newInputName,
                newCoordinate: e.newCoordinate
            });
            break;
        case 'delete':
            // Don't accept delete events for missing blocks,
            // or shadow blocks being obscured.
            if (!this._blocks.hasOwnProperty(e.blockId) ||
                this._blocks[e.blockId].shadow) {
                return;
            }
            // Inform any runtime to forget about glows on this script.
            if (optRuntime && this._blocks[e.blockId].topLevel) {
                optRuntime.quietGlow(e.blockId);
            }
            this.deleteBlock(e.blockId);
            break;
        case 'var_create':
            // New variables being created by the user are all global.
            // Check if this variable exists on the current target or stage.
            // If not, create it on the stage.
            // TODO create global and local variables when UI provides a way.
            if (optRuntime.getEditingTarget()) {
                if (!optRuntime.getEditingTarget().lookupVariableById(e.varId)) {
                    stage.createVariable(e.varId, e.varName, e.varType);
                }
            } else if (!stage.lookupVariableById(e.varId)) {
                // Since getEditingTarget returned null, we now need to
                // explicitly check if the stage has the variable, and
                // create one if not.
                stage.createVariable(e.varId, e.varName, e.varType);
            }
            break;
        case 'var_rename':
            stage.renameVariable(e.varId, e.newName);
            // Update all the blocks that use the renamed variable.
            if (optRuntime) {
                const targets = optRuntime.targets;
                for (let i = 0; i < targets.length; i++) {
                    const currTarget = targets[i];
                    currTarget.blocks.updateBlocksAfterVarRename(e.varId, e.newName);
                }
            }
            break;
        case 'var_delete':
            stage.deleteVariable(e.varId);
            break;
        }
    }

    // ---------------------------------------------------------------------

    /**
     * Reset all runtime caches.
     */
    resetCache () {
        this._cache.inputs = {};
        this._cache.procedureParamNames = {};
        this._cache.procedureDefinitions = {};
    }

    /**
     * Block management: create blocks and scripts from a `create` event
     * @param {!object} block Blockly create event to be processed
     */
    createBlock (block) {
        // Does the block already exist?
        // Could happen, e.g., for an unobscured shadow.
        if (this._blocks.hasOwnProperty(block.id)) {
            return;
        }
        // Create new block.
        this._blocks[block.id] = block;
        // Push block id to scripts array.
        // Blocks are added as a top-level stack if they are marked as a top-block
        // (if they were top-level XML in the event).
        if (block.topLevel) {
            this._addScript(block.id);
        }

        this.resetCache();
    }

    /**
     * Block management: change block field values
     * @param {!object} args Blockly change event to be processed
     * @param {?Runtime} optRuntime Optional runtime to allow changeBlock to change VM state.
     */
    changeBlock (args, optRuntime) {
        // Validate
        if (['field', 'mutation', 'checkbox'].indexOf(args.element) === -1) return;
        const block = this._blocks[args.id];
        if (typeof block === 'undefined') return;
        const wasMonitored = block.isMonitored;
        switch (args.element) {
        case 'field':
            // Update block value
            if (!block.fields[args.name]) return;
            if (args.name === 'VARIABLE' || args.name === 'LIST' ||
                args.name === 'BROADCAST_OPTION') {
                // Get variable name using the id in args.value.
                const variable = optRuntime.getEditingTarget().lookupVariableById(args.value);
                if (variable) {
                    block.fields[args.name].value = variable.name;
                    block.fields[args.name].id = args.value;
                }
            } else {
                // Changing the value in a dropdown
                block.fields[args.name].value = args.value;

                if (!optRuntime){
                    break;
                }

                const flyoutBlock = block.shadow && block.parent ? this._blocks[block.parent] : block;
                if (flyoutBlock.isMonitored) {
                    optRuntime.requestUpdateMonitor(Map({
                        id: flyoutBlock.id,
                        params: this._getBlockParams(flyoutBlock)
                    }));
                }
            }
            break;
        case 'mutation':
            block.mutation = mutationAdapter(args.value);
            break;
        case 'checkbox': {
            block.isMonitored = args.value;
            if (!optRuntime) {
                break;
            }

            const isSpriteSpecific = optRuntime.monitorBlockInfo.hasOwnProperty(block.opcode) &&
                optRuntime.monitorBlockInfo[block.opcode].isSpriteSpecific;
            block.targetId = isSpriteSpecific ? optRuntime.getEditingTarget().id : null;
            
            if (wasMonitored && !block.isMonitored) {
                optRuntime.requestRemoveMonitor(block.id);
            } else if (!wasMonitored && block.isMonitored) {
                optRuntime.requestAddMonitor(MonitorRecord({
                    // @todo(vm#564) this will collide if multiple sprites use same block
                    id: block.id,
                    targetId: block.targetId,
                    spriteName: block.targetId ? optRuntime.getTargetById(block.targetId).getName() : null,
                    opcode: block.opcode,
                    params: this._getBlockParams(block),
                    // @todo(vm#565) for numerical values with decimals, some countries use comma
                    value: ''
                }));
            }
            break;
        }
        }

        this.resetCache();
    }

    /**
     * Block management: move blocks from parent to parent
     * @param {!object} e Blockly move event to be processed
     */
    moveBlock (e) {
        if (!this._blocks.hasOwnProperty(e.id)) {
            return;
        }

        // Move coordinate changes.
        if (e.newCoordinate) {
            this._blocks[e.id].x = e.newCoordinate.x;
            this._blocks[e.id].y = e.newCoordinate.y;
        }

        // Remove from any old parent.
        if (typeof e.oldParent !== 'undefined') {
            const oldParent = this._blocks[e.oldParent];
            if (typeof e.oldInput !== 'undefined' &&
                oldParent.inputs[e.oldInput].block === e.id) {
                // This block was connected to the old parent's input.
                oldParent.inputs[e.oldInput].block = null;
            } else if (oldParent.next === e.id) {
                // This block was connected to the old parent's next connection.
                oldParent.next = null;
            }
            this._blocks[e.id].parent = null;
        }

        // Has the block become a top-level block?
        if (typeof e.newParent === 'undefined') {
            this._addScript(e.id);
        } else {
            // Remove script, if one exists.
            this._deleteScript(e.id);
            // Otherwise, try to connect it in its new place.
            if (typeof e.newInput === 'undefined') {
                // Moved to the new parent's next connection.
                this._blocks[e.newParent].next = e.id;
            } else {
                // Moved to the new parent's input.
                // Don't obscure the shadow block.
                let oldShadow = null;
                if (this._blocks[e.newParent].inputs.hasOwnProperty(e.newInput)) {
                    oldShadow = this._blocks[e.newParent].inputs[e.newInput].shadow;
                }
                this._blocks[e.newParent].inputs[e.newInput] = {
                    name: e.newInput,
                    block: e.id,
                    shadow: oldShadow
                };
            }
            this._blocks[e.id].parent = e.newParent;
        }
        this.resetCache();
    }


    /**
     * Block management: run all blocks.
     * @param {!object} runtime Runtime to run all blocks in.
     */
    runAllMonitored (runtime) {
        Object.keys(this._blocks).forEach(blockId => {
            if (this.getBlock(blockId).isMonitored) {
                const targetId = this.getBlock(blockId).targetId;
                runtime.addMonitorScript(blockId, targetId ? runtime.getTargetById(targetId) : null);
            }
        });
    }

    /**
     * Block management: delete blocks and their associated scripts. Does nothing if a block
     * with the given ID does not exist.
     * @param {!string} blockId Id of block to delete
     */
    deleteBlock (blockId) {
        // @todo In runtime, stop threads running on this script.

        // Get block
        const block = this._blocks[blockId];
        if (!block) {
            // No block with the given ID exists
            return;
        }

        // Delete children
        if (block.next !== null) {
            this.deleteBlock(block.next);
        }

        // Delete inputs (including branches)
        for (const input in block.inputs) {
            // If it's null, the block in this input moved away.
            if (block.inputs[input].block !== null) {
                this.deleteBlock(block.inputs[input].block);
            }
            // Delete obscured shadow blocks.
            if (block.inputs[input].shadow !== null &&
                block.inputs[input].shadow !== block.inputs[input].block) {
                this.deleteBlock(block.inputs[input].shadow);
            }
        }

        // Delete any script starting with this block.
        this._deleteScript(blockId);

        // Delete block itself.
        delete this._blocks[blockId];

        this.resetCache();
    }

    /**
     * Keep blocks up to date after a variable gets renamed.
     * @param {string} varId The id of the variable that was renamed
     * @param {string} newName The new name of the variable that was renamed
     */
    updateBlocksAfterVarRename (varId, newName) {
        const blocks = this._blocks;
        for (const blockId in blocks) {
            let varOrListField = null;
            if (blocks[blockId].fields.VARIABLE) {
                varOrListField = blocks[blockId].fields.VARIABLE;
            } else if (blocks[blockId].fields.LIST) {
                varOrListField = blocks[blockId].fields.LIST;
            }
            if (varOrListField) {
                const currFieldId = varOrListField.id;
                if (varId === currFieldId) {
                    varOrListField.value = newName;
                }
            }
        }
    }

    /**
     * Update blocks after a sound, costume, or backdrop gets renamed.
     * Any block referring to the old name of the asset should get updated
     * to refer to the new name.
     * @param {string} oldName The old name of the asset that was renamed.
     * @param {string} newName The new name of the asset that was renamed.
     * @param {string} assetType String representation of the kind of asset
     * that was renamed. This can be one of 'sprite','costume', 'sound', or
     * 'backdrop'.
     */
    updateAssetName (oldName, newName, assetType) {
        let getAssetField;
        if (assetType === 'costume') {
            getAssetField = this._getCostumeField.bind(this);
        } else if (assetType === 'sound') {
            getAssetField = this._getSoundField.bind(this);
        } else if (assetType === 'backdrop') {
            getAssetField = this._getBackdropField.bind(this);
        } else if (assetType === 'sprite') {
            getAssetField = this._getSpriteField.bind(this);
        } else {
            return;
        }
        const blocks = this._blocks;
        for (const blockId in blocks) {
            const assetField = getAssetField(blockId);
            if (assetField && assetField.value === oldName) {
                assetField.value = newName;
            }
        }
    }

    /**
     * Helper function to retrieve a costume menu field from a block given its id.
     * @param {string} blockId A unique identifier for a block
     * @return {?object} The costume menu field of the block with the given block id.
     * Null if either a block with the given id doesn't exist or if a costume menu field
     * does not exist on the block with the given id.
     */
    _getCostumeField (blockId) {
        const block = this.getBlock(blockId);
        if (block && block.fields.hasOwnProperty('COSTUME')) {
            return block.fields.COSTUME;
        }
        return null;
    }

    /**
     * Helper function to retrieve a sound menu field from a block given its id.
     * @param {string} blockId A unique identifier for a block
     * @return {?object} The sound menu field of the block with the given block id.
     * Null, if either a block with the given id doesn't exist or if a sound menu field
     * does not exist on the block with the given id.
     */
    _getSoundField (blockId) {
        const block = this.getBlock(blockId);
        if (block && block.fields.hasOwnProperty('SOUND_MENU')) {
            return block.fields.SOUND_MENU;
        }
        return null;
    }

    /**
     * Helper function to retrieve a backdrop menu field from a block given its id.
     * @param {string} blockId A unique identifier for a block
     * @return {?object} The backdrop menu field of the block with the given block id.
     * Null, if either a block with the given id doesn't exist or if a backdrop menu field
     * does not exist on the block with the given id.
     */
    _getBackdropField (blockId) {
        const block = this.getBlock(blockId);
        if (block && block.fields.hasOwnProperty('BACKDROP')) {
            return block.fields.BACKDROP;
        }
        return null;
    }

    /**
     * Helper function to retrieve a sprite menu field from a block given its id.
     * @param {string} blockId A unique identifier for a block
     * @return {?object} The sprite menu field of the block with the given block id.
     * Null, if either a block with the given id doesn't exist or if a sprite menu field
     * does not exist on the block with the given id.
     */
    _getSpriteField (blockId) {
        const block = this.getBlock(blockId);
        if (!block) {
            return null;
        }
        const spriteMenuNames = ['TOWARDS', 'TO', 'OBJECT', 'VIDEOONMENU2',
            'DISTANCETOMENU', 'TOUCHINGOBJECTMENU', 'CLONE_OPTION'];
        for (let i = 0; i < spriteMenuNames.length; i++) {
            const menuName = spriteMenuNames[i];
            if (block.fields.hasOwnProperty(menuName)) {
                return block.fields[menuName];
            }
        }
        return null;
    }

    // ---------------------------------------------------------------------

    /**
     * Encode all of `this._blocks` as an XML string usable
     * by a Blockly/scratch-blocks workspace.
     * @return {string} String of XML representing this object's blocks.
     */
    toXML () {
        return this._scripts.map(script => this.blockToXML(script)).join();
    }

    /**
     * Recursively encode an individual block and its children
     * into a Blockly/scratch-blocks XML string.
     * @param {!string} blockId ID of block to encode.
     * @return {string} String of XML representing this block and any children.
     */
    blockToXML (blockId) {
        const block = this._blocks[blockId];
        // Encode properties of this block.
        const tagName = (block.shadow) ? 'shadow' : 'block';
        let xmlString =
            `<${tagName}
                id="${block.id}"
                type="${block.opcode}"
                ${block.topLevel ? `x="${block.x}" y="${block.y}"` : ''}
            >`;
        // Add any mutation. Must come before inputs.
        if (block.mutation) {
            xmlString += this.mutationToXML(block.mutation);
        }
        // Add any inputs on this block.
        for (const input in block.inputs) {
            if (!block.inputs.hasOwnProperty(input)) continue;
            const blockInput = block.inputs[input];
            // Only encode a value tag if the value input is occupied.
            if (blockInput.block || blockInput.shadow) {
                xmlString += `<value name="${blockInput.name}">`;
                if (blockInput.block) {
                    xmlString += this.blockToXML(blockInput.block);
                }
                if (blockInput.shadow && blockInput.shadow !== blockInput.block) {
                    // Obscured shadow.
                    xmlString += this.blockToXML(blockInput.shadow);
                }
                xmlString += '</value>';
            }
        }
        // Add any fields on this block.
        for (const field in block.fields) {
            if (!block.fields.hasOwnProperty(field)) continue;
            const blockField = block.fields[field];
            xmlString += `<field name="${blockField.name}"`;
            const fieldId = blockField.id;
            if (fieldId) {
                xmlString += ` id="${fieldId}"`;
            }
            const varType = blockField.variableType;
            if (typeof varType === 'string') {
                xmlString += ` variabletype="${varType}"`;
            }
            let value = blockField.value;
            if (typeof value === 'string') {
                value = xmlEscape(blockField.value);
            }
            xmlString += `>${value}</field>`;
        }
        // Add blocks connected to the next connection.
        if (block.next) {
            xmlString += `<next>${this.blockToXML(block.next)}</next>`;
        }
        xmlString += `</${tagName}>`;
        return xmlString;
    }

    /**
     * Recursively encode a mutation object to XML.
     * @param {!object} mutation Object representing a mutation.
     * @return {string} XML string representing a mutation.
     */
    mutationToXML (mutation) {
        let mutationString = `<${mutation.tagName}`;
        for (const prop in mutation) {
            if (prop === 'children' || prop === 'tagName') continue;
            const mutationValue = (typeof mutation[prop] === 'string') ?
                xmlEscape(mutation[prop]) : mutation[prop];
            mutationString += ` ${prop}="${mutationValue}"`;
        }
        mutationString += '>';
        for (let i = 0; i < mutation.children.length; i++) {
            mutationString += this.mutationToXML(mutation.children[i]);
        }
        mutationString += `</${mutation.tagName}>`;
        return mutationString;
    }

    // ---------------------------------------------------------------------
    /**
     * Helper to serialize block fields and input fields for reporting new monitors
     * @param {!object} block Block to be paramified.
     * @return {!object} object of param key/values.
     */
    _getBlockParams (block) {
        const params = {};
        for (const key in block.fields) {
            params[key] = block.fields[key].value;
        }
        for (const inputKey in block.inputs) {
            const inputBlock = this._blocks[block.inputs[inputKey].block];
            for (const key in inputBlock.fields) {
                params[key] = inputBlock.fields[key].value;
            }
        }
        return params;
    }

    /**
     * Helper to get the corresponding internal procedure definition block
     * @param {!object} defineBlock Outer define block.
     * @return {!object} internal definition block which has the mutation.
     */
    _getCustomBlockInternal (defineBlock) {
        if (defineBlock.inputs && defineBlock.inputs.custom_block) {
            return this._blocks[defineBlock.inputs.custom_block.block];
        }
    }

    /**
     * Helper to add a stack to `this._scripts`.
     * @param {?string} topBlockId ID of block that starts the script.
     */
    _addScript (topBlockId) {
        const i = this._scripts.indexOf(topBlockId);
        if (i > -1) return; // Already in scripts.
        this._scripts.push(topBlockId);
        // Update `topLevel` property on the top block.
        this._blocks[topBlockId].topLevel = true;
    }

    /**
     * Helper to remove a script from `this._scripts`.
     * @param {?string} topBlockId ID of block that starts the script.
     */
    _deleteScript (topBlockId) {
        const i = this._scripts.indexOf(topBlockId);
        if (i > -1) this._scripts.splice(i, 1);
        // Update `topLevel` property on the top block.
        if (this._blocks[topBlockId]) this._blocks[topBlockId].topLevel = false;
    }
}

module.exports = Blocks;
