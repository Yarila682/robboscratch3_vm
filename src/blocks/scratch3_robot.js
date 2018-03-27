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

        this.power_in_percent = 50;
        this.power = Math.round(this.power_in_percent* 0.63);
        this.power_left = this.power;
        this.power_right = this.power;
        this.motors_on_interval = null;
        this.motors_off_interval = null;
        this.need_to_stop = false;
        this.robot_direction = null;
        this.time = Date.now();
        this.time_delta = null;
    }

    /**
     * Retrieve the block primitives implemented by this package.
     * @return {object.<string, Function>} Mapping of opcode to Function.
     */
    getPrimitives () {
        return {
            robot_motors_on_for_seconds: this.robot_motors_on_for_seconds,
            robot_motors_on: this.robot_motors_on,
            robot_motors_off:this.robot_motors_off,
            robot_set_direction_to:this.robot_set_direction_to

        };
    }

    getMonitored () {
        return {

        };
    }

    robot_motors_on_for_seconds (args, util) {


      //let power_in_percent = 50; //Мощность в процетах.


      //let power = Math.round(power_in_percent * 0.63);

        let power_left = this.power_left;
        let power_right = this.power_right;

        var execution_time = Number(args.SECONDS) * 1000;



        if ((execution_time != 0) && (typeof (execution_time) != 'undefined')){

          clearInterval(this.motors_off_interval);

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

    robot_motors_on(args, util){


      let power_left = this.power_left;
      let power_right = this.power_right;

      clearInterval(this.motors_off_interval);
      clearInterval(this.motors_on_interval);
      this.need_to_stop = false;


      console.log(`this.runtime.RCA.robot_motors_on(${power_left},${power_right})  Time: ${Date.now() - this.time}`);

    //    this.runtime.RCA.setRobotPower(power_left,power_right,0);

    this.motors_on_interval =   setInterval(function(runtime,self){

      if (!self.need_to_stop){

          console.log(`Motors on interval Time: ${Date.now() - self.time}`);
          runtime.RCA.setRobotPower(power_left,power_right,0);

      }else{

           runtime.RCA.setRobotPower(0,0,0);

      }


    }, 0,this.runtime,this);

    }

    robot_motors_off(args, util){

      console.log(`Robot stop!`);

  // setTimeout(function(runtime,self){
  //
  //     console.log(`Robot send power stop!`);
  //
  //    runtime.RCA.setRobotPower(0,0,0);
  //
  // },0,this.runtime,this);

    //  this.runtime.RCA.setRobotPower(0,0,0);
      clearInterval(this.motors_on_interval);
      clearInterval(this.motors_off_interval);

      this.need_to_stop = true;

      this.motors_off_interval =   setInterval(function(runtime,self){

        if (self.need_to_stop){


            runtime.RCA.setRobotPower(0,0,0);
        }


      }, 0,this.runtime,this);


    }


    robot_set_direction_to(args, util){

          console.log(`robot_set_direction_to`);

          this.robot_direction = args.ROBOT_DIRECTION;

          switch (this.robot_direction) {
            case "direction_forward":

                this.power = Math.round(this.power_in_percent * 0.63);
                this.power_left = this.power;
                this.power_right = this.power;

              break;

              case "direction_backward":

                this.power = Math.round(this.power_in_percent * 0.63) + 64;
                this.power_left = this.power;
                this.power_right = this.power;

              break;

              case "direction_left":

                this.power = Math.round(this.power_in_percent * 0.63);
                this.power_left =   this.power + 64;
                this.power_right =  this.power;

              break;

              case "direction_right":

                this.power = Math.round(this.power_in_percent * 0.63);
                this.power_left =   this.power;
                this.power_right =  this.power + 64;

              break;

            default:

          }

    }

    }

    module.exports = Scratch3RobotBlocks;
