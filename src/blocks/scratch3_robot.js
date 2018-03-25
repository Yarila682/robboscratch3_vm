const Cast = require('../util/cast');
const MathUtil = require('../util/math-util');
const Timer = require('../util/timer');
//const Robot_command = require('../robot/robot_command');

class Scratch3RobotBlocks {
    constructor (runtime) {
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.runtime = runtime;
    //    this.robot_command = new Robot_command();
    }

    /**
     * Retrieve the block primitives implemented by this package.
     * @return {object.<string, Function>} Mapping of opcode to Function.
     */
    getPrimitives () {
        return {
            robot_motors_on_for_seconds: this.robot_motors_on_for_seconds

        };
    }

    getMonitored () {
        return {

        };
    }

    robot_motors_on_for_seconds (args, util) {


      let power_in_percent = 50; //Мощность в процетах.


      let power = Math.round(power_in_percent * 0.63);

        let power_left = power;
        let power_right = power;

        var execution_time = Number(args.SECONDS) * 1000;



        if ((execution_time != 0) && (typeof (execution_time) != 'undefined')){


          for(var j = 0; j < execution_time / 200 ; j++){
             setTimeout(function(runtime){

              console.log(`this.runtime.RCA.setRobotPower(${power_left},${power_right})`);
              runtime.RCA.setRobotPower(power_left,power_right,0);
            }, 200 * j,this.runtime);
          }

          setTimeout(function(runtime){

           console.log(`Robot stop!`);
           runtime.RCA.setRobotPower(0,0,0);
         }, execution_time,this.runtime);

        }







    }

    }

    module.exports = Scratch3RobotBlocks;
