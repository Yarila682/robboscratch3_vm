const Cast = require('../util/cast');
const MathUtil = require('../util/math-util');
const Timer = require('../util/timer');
//const Robot_command = require('../robot/robot_command');

const MOTORS_ON_DELTA = 50;
const DEGREE_RATIO = 3.2;

class Scratch3RobotBlocks {
    constructor (runtime) {
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.runtime = runtime;
    //    this.robot_command = new Robot_command();

        this.power_in_percent_left = 50;
        this.power_in_percent_right = 50;
      //  this.power = Math.round(this.power_in_percent* 0.63);
        this.power_left =   Math.round(this.power_in_percent_left * 0.63);
        this.power_right =  Math.round(this.power_in_percent_right * 0.63);
        this.motors_on_interval = null;
        this.motors_off_interval = null;
        this.need_to_stop = false;
        this.robot_direction = 'direction_forward';
        this.time = Date.now();
        this.motors_on_time_delta = null;

        this.motors_on_time1 = Date.now();
        this.motors_on_time2 = Date.now();

        this.motors_on_loop_need = null;

        this.robot_motors_on_for_seconds_timeout = null;
        this.robot_motors_on_for_seconds_timeout_stop = null;
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
            robot_set_direction_to:this.robot_set_direction_to,
            robot_set_motors_left_right_power_and_direction_separately:this.robot_set_motors_left_right_power_and_direction_separately,
            robot_get_sensor_data: this.robot_get_sensor_data,
            robot_motors_on_for_steps:this.robot_motors_on_for_steps,
            robot_turnright: this.robot_turnright,
            robot_turnleft: this.robot_turnleft,
            robot_set_motors_power:this.robot_set_motors_power,
            robot_set_motors_power_left_right_separately:this.robot_set_motors_power_left_right_separately,
            robot_start_button_pressed:this.robot_start_button_pressed,
            robot_turn_led_on:this.robot_turn_led_on,
            robot_turn_led_off:this.robot_turn_led_off,
            robot_claw_closed:this.robot_claw_closed,
            robot_claw_state:this.robot_claw_state


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
          clearTimeout(this.robot_motors_on_for_seconds_timeout);
          clearTimeout(this.robot_motors_on_for_seconds_timeout_stop);


          for(var j = 0; j < execution_time / 200 ; j++){
          this.robot_motors_on_for_seconds_timeout =    setTimeout(function(runtime){

              console.log(`this.runtime.RCA.setRobotPower(${power_left},${power_right})`);
              runtime.RCA.setRobotPower(power_left,power_right,0);
            }, 200 * j,this.runtime);
          }

        this.robot_motors_on_for_seconds_timeout_stop =   setTimeout(function(runtime){

           console.log(`Robot stop!`);
           runtime.RCA.setRobotPower(0,0,0);
         }, execution_time,this.runtime);

        }







    }

    robot_motors_on(args, util){

    //  console.trace("Trace: ");


      let power_left = this.power_left;
      let power_right = this.power_right;

      clearInterval(this.motors_off_interval);
      clearInterval(this.motors_on_interval);
      this.need_to_stop = false;

      this.motors_on_time2 = Date.now();

      if ((this.motors_on_time2 - this.motors_on_time1) <= MOTORS_ON_DELTA ){

            this.motors_on_loop_need = false;

      }else{

            this.motors_on_loop_need = true;

      }

      this.motors_on_time1 = Date.now();




      console.log(`this.runtime.RCA.robot_motors_on(${power_left},${power_right})  Time: ${Date.now() - this.time}`);

        this.runtime.RCA.setRobotPower(power_left,power_right,0);

    this.motors_on_interval =   setInterval(function(runtime,self){

        console.log(`Motors on interval1`);

      if (!self.need_to_stop){

        if (self.motors_on_loop_need){

          console.log(`Motors on interval2 Time: ${Date.now() - self.time}`);
          runtime.RCA.setRobotPower(power_left,power_right,0);

        }



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


    update_power_using_direction(direction){

      switch (direction) {

        case "direction_forward":

          //  this.power = Math.round(this.power_in_percent * 0.63);
            this.power_left   =   Math.round(this.power_in_percent_left * 0.63);
            this.power_right  =   Math.round(this.power_in_percent_right * 0.63);

          break;

          case "direction_backward":

          //  this.power = Math.round(this.power_in_percent * 0.63) + 64;
            this.power_left   =   Math.round(this.power_in_percent_left * 0.63) +  64;
            this.power_right  =   Math.round(this.power_in_percent_right * 0.63) +  64;

          break;

          case "direction_left":

          //  this.power = Math.round(this.power_in_percent * 0.63);
            this.power_left     =   Math.round(this.power_in_percent_left * 0.63) +  64;
            this.power_right    =   Math.round(this.power_in_percent_right * 0.63);

          break;

          case "direction_right":

          //  this.power = Math.round(this.power_in_percent * 0.63);
            this.power_left   =   Math.round(this.power_in_percent_left * 0.63);
            this.power_right  =   Math.round(this.power_in_percent_right * 0.63) +  64;

          break;

        default:

      }

    }

    robot_set_direction_to(args, util){

          console.log(`robot_set_direction_to`);

          this.robot_direction = args.ROBOT_DIRECTION;

          this.update_power_using_direction(this.robot_direction);



    }

    robot_get_sensor_data(args, util){

          console.log(`robot_get_sensor_data`);

          var sensor = args.ROBOT_SENSORS;
          var sensor_data = null;

          switch (sensor) {
            case "sensor1":

            sensor_data = this.runtime.RCA.getSensorData(0)[3];

              break;

           case "sensor2":

                sensor_data = this.runtime.RCA.getSensorData(1)[3];

              break;

          case "sensor3":

                sensor_data = this.runtime.RCA.getSensorData(2)[3];

              break;

          case "sensor4":

                sensor_data = this.runtime.RCA.getSensorData(3)[3];

                 break;

         case "sensor5":

                sensor_data = this.runtime.RCA.getSensorData(4)[3];

              break;

        case "sensor_trip_meter_left":

              sensor_data = this.runtime.RCA.getLeftPath();

            break;

        case "sensor_trip_meter_right":

              sensor_data = this.runtime.RCA.getRightPath();

            break;



            default:

            sensor_data = -1;

          }

      return sensor_data;

    }

    check_value_out_of_range(value,low,high){

        return (value > high)?high:((value < low)?low:value);

    }

    robot_set_motors_left_right_power_and_direction_separately(args, util){

    this.power_in_percent_left  =   (args.POWER_LEFT > 100)?100:((args.POWER_LEFT < 0)?0:args.POWER_LEFT);
    this.power_in_percent_right =   (args.POWER_RIGHT > 100)?100:((args.POWER_RIGHT < 0)?0:args.POWER_RIGHT);

    var robot_left_motor_direction = args.ROBOT_LEFT_MOTOR_DIRECTION;

    switch (robot_left_motor_direction) {

      case "direction_forward":


          this.power_left   =   Math.round(this.power_in_percent_left * 0.63);


        break;

        case "direction_backward":


          this.power_left   =   Math.round(this.power_in_percent_left * 0.63) +  64;


        break;


      default:

    }

    var robot_right_motor_direction = args.ROBOT_RIGHT_MOTOR_DIRECTION;

    switch (robot_right_motor_direction) {

      case "direction_forward":


          this.power_right   =   Math.round(this.power_in_percent_right * 0.63);


        break;

      case "direction_backward":


          this.power_right   =   Math.round(this.power_in_percent_right * 0.63) +  64;


        break;


      default:

    }


    }

    check_65535(steps){

          return (steps > 65535)?65535:((steps < 0)?0:steps);

    }

    robot_motors_on_for_steps(args, util){

      var steps =   this.check_65535(args.STEPS);

      if (steps != 0){

        let power_left = this.power_left;
        let power_right = this.power_right;

        this.runtime.RCA.setRobotPowerAndStepLimits(power_left,power_right,steps,0);



      }



    }

    robot_turnright(args, util){

          var steps = this.check_65535(Math.round(args.DEGREES / DEGREE_RATIO));

          if (steps != 0){

          let power_left =   Math.round(30 * 0.63);
          let power_right =  Math.round(30 * 0.63) + 64;

          this.runtime.RCA.setRobotPowerAndStepLimits(power_left,power_right,steps,0);

          }

    }

    robot_turnleft(args, util){

          var steps = this.check_65535(Math.round(args.DEGREES / DEGREE_RATIO));

          if (steps != 0){

          let power_left =   Math.round(30 * 0.63) + 64;
          let power_right =  Math.round(30 * 0.63);

          this.runtime.RCA.setRobotPowerAndStepLimits(power_left,power_right,steps,0);

          }

    }

    robot_set_motors_power(args, util){

      let power = this.check_value_out_of_range(args.POWER,0,100);

        this.power_in_percent_left    =   power;
        this.power_in_percent_right   =   power;

      console.log(`robot_set_motors_power power_in_percent_left: ${this.power_in_percent_left} power_in_percent_right: ${this.power_in_percent_right}`);

        this.update_power_using_direction(this.robot_direction);


    }

    robot_set_motors_power_left_right_separately(args, util){

      this.power_in_percent_left    =   this.check_value_out_of_range(args.POWER_LEFT,0,100);
      this.power_in_percent_right   =   this.check_value_out_of_range(args.POWER_RIGHT,0,100);

      console.log(`robot_set_motors_power_left_right_separately power_in_percent_left: ${this.power_in_percent_left} power_in_percent_right: ${this.power_in_percent_right}`);

      this.update_power_using_direction(this.robot_direction);


    }

    robot_start_button_pressed(args, util){

        return (this.runtime.RCA.getButtonStartPushed() == 'true')?true:false;

    }

    robot_turn_led_on(args, util){

       console.log(`robot_turn_led_on led_position: ${args.ROBOT_POSITION}`);

       switch (args.ROBOT_POSITION) {

         case 'position1':

                  this.runtime.RCA.turnLedOn(0,0);

           break;

          case 'position2':

                  this.runtime.RCA.turnLedOn(1,0);

             break;

          case 'position3':

                  this.runtime.RCA.turnLedOn(2,0);

            break;

          case 'position4':

                  this.runtime.RCA.turnLedOn(3,0);

            break;

        case 'position5':

                  this.runtime.RCA.turnLedOn(4,0);

         break;

         default:

       }

    }

    robot_turn_led_off(args, util){

      console.log(`robot_turn_led_off led_position: ${args.ROBOT_POSITION}`);

      switch (args.ROBOT_POSITION) {

        case 'position1':

                 this.runtime.RCA.turnLedOff(0,0);

          break;

         case 'position2':

                 this.runtime.RCA.turnLedOff(1,0);

            break;

         case 'position3':

                 this.runtime.RCA.turnLedOff(2,0);

           break;

         case 'position4':

                 this.runtime.RCA.turnLedOff(3,0);

           break;

       case 'position5':

                 this.runtime.RCA.turnLedOff(4,0);

        break;

        default:

      }


    }

    robot_claw_closed(args, util){

      console.log(`robot_claw_closed degrees: ${args.CLAW_CLOSED_PERCENT}`);

        var degrees = this.check_value_out_of_range(args.CLAW_CLOSED_PERCENT,0,100);

        this.runtime.RCA.setClawDegrees(degrees,0);

    }

    robot_claw_state(args, util){

        console.log(`robot_claw_state state: ${args.CLAW_STATES}`);

        switch (args.CLAW_STATES) {

          case 'claw_open':

            this.runtime.RCA.setClawDegrees(0,0);

            break;

          case 'claw_half_open':

              this.runtime.RCA.setClawDegrees(50,0);

              break;

          case 'claw_closed':

              this.runtime.RCA.setClawDegrees(100,0);

              break;

          default:

        }


    }

    }

    module.exports = Scratch3RobotBlocks;
