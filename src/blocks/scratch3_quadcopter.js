const Cast = require('../util/cast');
const MathUtil = require('../util/math-util');
const Timer = require('../util/timer');




class Scratch3QuadcopterBlocks {
    constructor (runtime) {
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.runtime = runtime;



    }

    /**
     * Retrieve the block primitives implemented by this package.
     * @return {object.<string, Function>} Mapping of opcode to Function.
     */
    getPrimitives () {
        return {

            copter_fly_up: this.copter_fly_up,
            copter_land:this.copter_land



        };
    }

    getMonitored () {
        return {

        };
    }


    copter_fly_up(){

          this.runtime.QCA.fly_up();

    }

    copter_land(){

            this.runtime.QCA.copter_land();

    }

  }

    module.exports = Scratch3QuadcopterBlocks;
