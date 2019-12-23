const Cast = require('../util/cast');
const MathUtil = require('../util/math-util');
const Timer = require('../util/timer');
//const Robot_command = require('../robot/robot_command');

const MOTORS_ON_DELTA = 50;
const DEGREE_RATIO = 5.19;

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
        this.need_to_stop = true; //false
        this.robot_direction = 'direction_forward';
        this.time = Date.now();
        this.motors_on_time_delta = null;

        this.motors_on_time1 = Date.now();
        this.motors_on_time2 = Date.now();

        this.motors_on_loop_need = null;

        this.robot_motors_on_for_seconds_timeout = null;
        this.robot_motors_on_for_seconds_timeout_stop = null;

        this.command_sent = false;

        this.a_command_unblock_interval = null;

        this.set_direction_block_step = 1;

        this.is_motors_on_active = false;

        this.time_sent1 = Date.now();
        this.time_sent2 = Date.now();
        this.time_sent3 = Date.now();

       this.robot_motors_on_for_seconds_end_timeout = null;


        this.runtime.RCA.registerRobotIsScratchduinoCallback(() => {

          this.power_left =  63;
          this.power_right =  63;

        });

        this.runtime.RCA.registerRobotIsRobboCallback(() => {

          this.power_left  =  Math.round(this.power_in_percent_left * 0.63);
          this.power_right =  Math.round(this.power_in_percent_right * 0.63);

          
        });
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
            robot_claw_state:this.robot_claw_state,
            robot_reset_trip_meters: this.robot_reset_trip_meters,
            robot_get_rgb_sensor_data: this.robot_get_rgb_sensor_data,
            robot_is_current_color:this.robot_is_current_color


        };
    }

    getMonitored () {
        return {

        };
    }

  robot_motors_on_for_seconds (args, util) {

      clearTimeout(this.robot_motors_on_for_seconds_end_timeout);

       this.robot_motors_on_for_seconds_end_timeout = setTimeout(() => {
          this.runtime.RCA.setRobotPower(0,0,0);
       }, 40);

      this.is_motors_on_active = false;
      if (util.stackFrame.timer) {
          const timeElapsed = util.stackFrame.timer.timeElapsed();
          if (timeElapsed < util.stackFrame.duration * 1000) {
              util.yield();
          }
          else {
              if (!this.runtime.RCA.isRobotReadyToAcceptCommand()){
                  this.runtime.RCA.block_A_CommandQueue();
                  util.yield();
                  return;
              }
              else{      
                  util.stackFrame.timer = undefined;
                  clearTimeout(this.robot_motors_on_for_seconds_end_timeout);
                  this.runtime.RCA.setRobotPower(0,0,0);
                  this.runtime.RCA.unblock_A_CommandQueue();
              }
          }
      }
      else {
          if (!this.runtime.RCA.isRobotReadyToAcceptCommand()){
                  this.runtime.RCA.block_A_CommandQueue();
                  util.yield();
                  return;
          }
          util.stackFrame.timer = new Timer();
          util.stackFrame.timer.start();
          util.stackFrame.duration = Cast.toNumber(args.SECONDS);
          if (util.stackFrame.duration <= 0) {
              return;
          }
          clearInterval(this.motors_on_interval);
          this.runtime.RCA.setRobotPower(this.power_left,this.power_right,0);
          this.runtime.RCA.unblock_A_CommandQueue();
          util.yield();
      }
  }

    robot_motors_on(args, util){

    //  console.trace("Trace: ");

    //  this.runtime.enableProfiling((frame) => {

    //         console.warn("frame: ");
    //         console.warn(frame);
    //     });


      

      let power_left = this.power_left;
      let power_right = this.power_right;

      clearTimeout(this.robot_motors_on_for_seconds_timeout_stop);

      clearInterval(this.motors_off_interval);
      clearInterval(this.motors_on_interval);
      this.need_to_stop = false;

      this.is_motors_on_active = true;

      // this.motors_on_time2 = Date.now();

      // let motors_on_time_delta = this.motors_on_time2 - this.motors_on_time1;

      // console.log(`motors_on_time_delta: ${motors_on_time_delta}`);

      // if ((this.motors_on_time2 - this.motors_on_time1) <= MOTORS_ON_DELTA ){

      //       this.motors_on_loop_need = false;

      // }else{

      //       this.motors_on_loop_need = true;

      // }

      // this.motors_on_time1 = Date.now();


       this.motors_on_loop_need = true;

      /**
         We depends on hardware response time. This way we need to sync blocks runtime with hardware. 
         So here we block "a command (which only returns telemetry)", sync block with hardware (with isRobotReadyToSendCommand()) and use only "c command (motion and telemetry)". 
      **/

      //this.runtime.RCA.block_A_CommandQueue(); 


    //  console.log(`this.runtime.RCA.robot_motors_on(${power_left},${power_right})  Time: ${Date.now() - this.time}`);




       this.command_sent = false;

      if (this.runtime.RCA.isRobotReadyToAcceptCommand()){

           this.runtime.RCA.setRobotPower(this.power_left,this.power_right,0);
           this.command_sent = true;
          // this.time_sent1 = Date.now();
           this.runtime.RCA.unblock_A_CommandQueue();
           clearInterval(this.a_command_unblock_interval);
          
          
      
      }else{

         this.runtime.RCA.block_A_CommandQueue();  
         
        //  if ( this.a_command_unblock_interval == null){

        //       this.a_command_unblock_interval = setInterval(() => {

        //         //if (this.command_sent){

        //           this.runtime.RCA.unblock_A_CommandQueue();
        //           clearInterval(this.a_command_unblock_interval);
        //           this.a_command_unblock_interval = null;

        //         //}
        //       },0);
        //   }

         util.yield();
        

      }
       
    // this.is_motors_on_active = true;
    // this.motors_on_interval =   setInterval((runtime,self) => {

    

    //   if (!self.need_to_stop){

    //     if (self.motors_on_loop_need){

     

    //       if (runtime.RCA.isRobotReadyToSendCommand()){

    //          runtime.RCA.setRobotPower(self.power_left,self.power_right,0);
    //         // console.log(`power_left: ${self.power_left} power_right: ${self.power_right}`);
    //          this.command_sent = true;
    //          this.runtime.RCA.unblock_A_CommandQueue();
    //          this.time_sent1 = Date.now();
      
    //       }else{

    //           this.runtime.RCA.block_A_CommandQueue(); 
    //           this.command_sent = false;

    //       }

    //     }



    //   }else{

    //        runtime.RCA.setRobotPower(0,0,0);

    //   }


    // }, 0,this.runtime,this);

    }

    robot_motors_off(args, util){

    // console.log(`Robot stop!`);

  // setTimeout(function(runtime,self){
  //
  //     console.log(`Robot send power stop!`);
  //
  //    runtime.RCA.setRobotPower(0,0,0);
  //
  // },0,this.runtime,this);

    //  this.runtime.RCA.setRobotPower(0,0,0);


    //  this.time_sent2 = Date.now();

     // console.log(`motors on_off delta: ${this.time_sent2 - this.time_sent1}`);

    


      clearInterval(this.motors_on_interval);
      clearInterval(this.motors_off_interval);

      this.need_to_stop = true;

      this.is_motors_on_active = false;


    if (this.runtime.RCA.isRobotReadyToAcceptCommand()){

          //console.log(`Robot stop!`);

           this.runtime.RCA.setRobotPower(0,0,0);
           this.command_sent = true;
          // this.time_sent3 = Date.now();
          // console.log(`motors on_off delta after power: ${this.time_sent3 - this.time_sent1}`);
           this.runtime.RCA.unblockPowerCommand();
           this.runtime.RCA.unblock_A_CommandQueue();
           clearInterval(this.a_command_unblock_interval);
          
          
      
      }else{

         this.runtime.RCA.block_A_CommandQueue();  
         this.runtime.RCA.blockPowerCommand();
         
         util.yield();
        

      }


     // this.runtime.RCA.setRobotPower(0,0,0);

     // this.runtime.RCA.unblock_A_CommandQueue(); 

      //  this.time_sent3 = Date.now();

      // console.log(`motors on_off delta after power: ${this.time_sent3 - this.time_sent1}`);

      // this.time_sent2 = Date.now();

      // console.log(`motors on_off delta: ${this.time_sent2 - this.time_sent1}`);

      // this.motors_off_interval =   setInterval(function(runtime,self){
      //
      //   if (self.need_to_stop){
      //
      //
      //       runtime.RCA.setRobotPower(0,0,0);
      //   }
      //
      //
      // }, 0,this.runtime,this);


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

        //  console.log(`robot_set_direction_to`);

          // if (this.set_direction_block_step == 1){

          //    this.robot_direction = args.ROBOT_DIRECTION;

          //    this.update_power_using_direction(this.robot_direction);


          //   //синхронизируем с блоком motors on //нужно дождаться пока motors on не отправит пакет с выставленным здесь направлением
          //   //если motors on  не работает, мы не ждём
            
          //    if (this.is_motors_on_active){


          //     this.command_sent = false; 
          //     this.set_direction_block_step = 2;
          //     util.yield(); 

          //    }
             

          // }else if (this.set_direction_block_step == 2){ //баг, если прерываем блок между двумя шагами

          //   if  ((!this.command_sent) && (this.is_motors_on_active) ) {

          //       util.yield();

          //    }else{

          //       this.set_direction_block_step = 1;

          //    }

          // }

          this.time_sent1 = Date.now();
          this.time_sent3 = this.time_sent1 - this.time_sent2;

          //console.log(`time sent delta: ${this.time_sent3} robot_direction: ${args.ROBOT_DIRECTION}`);

          this.time_sent2 = Date.now();


           this.robot_direction = args.ROBOT_DIRECTION;

            this.update_power_using_direction(this.robot_direction);

            if (this.is_motors_on_active){

                if (this.runtime.RCA.isRobotReadyToAcceptCommand()){

                      
                   this.activate_robot_power();
                   this.runtime.RCA.unblock_A_CommandQueue();  
          
                  
                  }else{

                    //return;

                    this.runtime.RCA.block_A_CommandQueue();  
                    util.yield();
                    

                  }

            }
      

    }


    activate_robot_power(){

        this.runtime.RCA.setRobotPower(this.power_left,this.power_right,0);
           
    }

    robot_get_sensor_data(args, util){

      //    console.log(`robot_get_sensor_data`);

          var sensor = args.ROBOT_SENSORS;
          var sensor_data = null;

          switch (sensor) {
            case "sensor1":

            sensor_data = this.runtime.RCA.getSensorData(0);

              break;

           case "sensor2":

                sensor_data = this.runtime.RCA.getSensorData(1);

              break;

          case "sensor3":

                sensor_data = this.runtime.RCA.getSensorData(2);

              break;

          case "sensor4":

                sensor_data = this.runtime.RCA.getSensorData(3);

                 break;

         case "sensor5":

                sensor_data = this.runtime.RCA.getSensorData(4);

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

    robot_get_rgb_sensor_data(args){

      //    console.log(`robot_get_rgb_sensor_data   sensor: ${args.ROBOT_SENSORS_FOR_RGB} color: ${args.RGB_VALUES} `);

          let sensor_id = Number(args.ROBOT_SENSORS_FOR_RGB.replace("sensor","")) - 1;

          let rgb_array = this.runtime.RCA.getColorCorrectedRawValues(sensor_id);

          switch (args.RGB_VALUES) {

            case "red":

                  return rgb_array[0];

              break;

          case "green":

                  return rgb_array[1];

            break;

          case "blue":

                    return rgb_array[2];

              break;

            default:

                  return -1; // TODO: правильно обрабатывать

          }


    }

    robot_is_current_color(args){

    //   console.log(`robot_is_current_color   sensor: ${args.ROBOT_SENSORS_FOR_RGB} color: ${args.COLORS} `);

       let sensor_id = Number(args.ROBOT_SENSORS_FOR_RGB.replace("sensor","")) - 1;

       let color = args.COLORS;

       let current_color = this.runtime.RCA.colorFilter(sensor_id,true);

       if ((color == "unknown") && (Array.isArray(current_color))){

          return true;

       }else if (color == current_color){

           return true;

       }else{

         return false;

       }

    }

    check_value_out_of_range(value,low,high){

        return (value > high)?high:((value < low)?low:value);

    }

    robot_set_motors_left_right_power_and_direction_separately(args, util){

                     // this.runtime.RCA.setRobotPower(0,0,0);
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

     if (this.is_motors_on_active){

                if (this.runtime.RCA.isRobotReadyToAcceptCommand()){

                      
                   this.activate_robot_power();
                   this.runtime.RCA.unblock_A_CommandQueue();  
          
                  
                  }else{

                    this.runtime.RCA.block_A_CommandQueue();  
                    util.yield();
                    

                  }

            }


    }

    check_65535(steps){

          return (steps > 65535)?65535:((steps < 0)?0:steps);

    }

    calculate_steps_delta(){

        let leftPath = this.runtime.RCA.getLeftPath();
        let rightPath = this.runtime.RCA.getRightPath();

        return  ((leftPath > rightPath)?leftPath:rightPath )  - this.stepsInitValue;



      //  return  this.runtime.RCA.getLeftPath()  - this.stepsInitValue; // TODO: проверить на 65535

    }

    calculate_steps_delta_left(){



            return  this.runtime.RCA.getLeftPath()  - this.stepsInitValueLeft; // TODO: проверить на 65535

    }

    calculate_steps_delta_right(){



      return  this.runtime.RCA.getRightPath()  - this.stepsInitValueRight; // TODO: проверить на 65535

    }

    robot_motors_on_for_steps(args, util){

     // console.log(`robot_motors_on_for_steps`);


      // var steps =   this.check_65535(args.STEPS);
      //
      //
      //
      // if (steps != 0){
      //
      //   let power_left = this.power_left;
      //   let power_right = this.power_right;
      //
      //   this.runtime.RCA.setRobotPowerAndStepLimits(power_left,power_right,steps,0);
      //
      //
      //
      // }else return;


    //  clearInterval(this.motors_off_interval);
    // this.runtime.RCA.setRobotPower(0,0,0);

    this.is_motors_on_active = false;

      clearTimeout(this.robot_motors_on_for_seconds_timeout_stop);

      if ((util.stackFrame.steps != null) && (typeof(util.stackFrame.steps) != 'undefined') ) {

        var stepsDeltaLeft  =  this.calculate_steps_delta_left();
        var stepsDeltaRight =  this.calculate_steps_delta_right();

        if (  (stepsDeltaLeft < util.stackFrame.steps  ) && (stepsDeltaRight < util.stackFrame.steps) && (!this.need_to_stop) ) {  // TODO: сделать корректную проверку для робота без энкодеров

          // console.warn(`robot_motors_on_for_steps steps: ${util.stackFrame.steps} stepsDeltaLeft: ${stepsDeltaLeft} stepsDeltaRight: ${stepsDeltaRight}`);

            util.yield();

          } else{


            //   console.warn(`robot_motors_on_for_steps  exit function steps: ${util.stackFrame.steps} stepsDeltaLeft: ${stepsDeltaLeft} stepsDeltaRight: ${stepsDeltaRight}`);

                util.stackFrame.steps = null;

                //this.need_to_stop = true; //for robot_set_direction_to //modified_by_Yaroslav


          }
      } else {


            clearInterval(this.motors_on_interval);

            if (!this.runtime.RCA.isRobotReadyToAcceptCommand()){

                // console.warn(`robot_motors_on_for_steps not ready to accept command`);
                this.runtime.RCA.block_A_CommandQueue(); 
                util.yield();
                return;

            }else{
               
               this.runtime.RCA.unblock_A_CommandQueue(); 

            }

          //console.error(`robot_motors_on_for_steps 1`);
  

          util.stackFrame.steps = this.check_65535(args.STEPS);

          this.stepsInitValueLeft  =  this.runtime.RCA.getLeftPath();
          this.stepsInitValueRight =  this.runtime.RCA.getRightPath();


          if (util.stackFrame.steps <= 0) {

              return;
          }

          // console.log(`robot_motors_on_for_steps 2`);

          this.need_to_stop = false;
          this.runtime.RCA.setRobotPowerAndStepLimits(this.power_left,this.power_right,util.stackFrame.steps,0);





          util.yield();
      }




    }

    robot_turnright(args, util){


    //   clearInterval(this.motors_on_interval);
    // //  clearInterval(this.motors_off_interval);
    //  this.runtime.RCA.setRobotPower(0,0,0);
    //
    //
    //
    //       var steps = this.check_65535(Math.round(args.DEGREES / DEGREE_RATIO));
    //
    //       if (steps != 0){
    //
    //       let power_left =   Math.round(30 * 0.63);
    //       let power_right =  Math.round(30 * 0.63) + 64;
    //
    //       this.runtime.RCA.setRobotPowerAndStepLimits(power_left,power_right,steps,0);
    //
    //       }


    this.is_motors_on_active = false;

    clearTimeout(this.robot_motors_on_for_seconds_timeout_stop);


    if ((util.stackFrame.steps != null) && (typeof(util.stackFrame.steps) != 'undefined')) {

      //  const stepsDelta =  this.calculate_steps_delta();

      var stepsDeltaLeft  =  this.calculate_steps_delta_left();
      var stepsDeltaRight =  this.calculate_steps_delta_right();

      if (  (stepsDeltaLeft < util.stackFrame.steps  ) && (stepsDeltaRight < util.stackFrame.steps)  && (!this.need_to_stop) ) { // TODO: сделать корректную проверку для робота без энкодеров

      //      console.log(`robot_turnright stepsDeltaLeft: ${stepsDeltaLeft} stepsDeltaRight: ${stepsDeltaRight}`);


        //  util.stackFrame.steps_counter++;

          util.yield();

        } else{

          //    console.log(`robot_turnright exit function stepsDeltaLeft: ${stepsDeltaLeft} stepsDeltaRight: ${stepsDeltaRight}`);

              util.stackFrame.steps = null;

              //this.need_to_stop = true; //for robot_set_direction_to //modified_by_Yaroslav

        }
    } else {


           if (!this.runtime.RCA.isRobotReadyToAcceptCommand()){

                this.runtime.RCA.block_A_CommandQueue(); 
                util.yield();
                return;

            }else{
               
               this.runtime.RCA.unblock_A_CommandQueue(); 

            }

        util.stackFrame.steps = this.check_65535(Math.round(args.DEGREES / DEGREE_RATIO))
        this.stepsInitValueLeft  =  this.runtime.RCA.getLeftPath();
        this.stepsInitValueRight =  this.runtime.RCA.getRightPath();
      //  util.stackFrame.steps_counter = 0;


        clearInterval(this.motors_on_interval);
        // //  clearInterval(this.motors_off_interval);
      //  this.runtime.RCA.setRobotPower(0,0,0);

        if (util.stackFrame.steps <= 0) {

            return;
        }



        let power_left =   Math.round(30 * 0.63);
        let power_right =  Math.round(30 * 0.63) + 64;

        this.runtime.RCA.setRobotPowerAndStepLimits(power_left,power_right, util.stackFrame.steps ,0);
      //  util.stackFrame.steps_counter++;


          this.need_to_stop = false;

        util.yield();
    }


    }

    robot_turnleft(args, util){

          //   clearInterval(this.motors_on_interval);
          // //  clearInterval(this.motors_off_interval);
          //  this.runtime.RCA.setRobotPower(0,0,0);
          //
          // var steps = this.check_65535(Math.round(args.DEGREES / DEGREE_RATIO));
          //
          // if (steps != 0){
          //
          // let power_left =   Math.round(30 * 0.63) + 64;
          // let power_right =  Math.round(30 * 0.63);
          //
          // this.runtime.RCA.setRobotPowerAndStepLimits(power_left,power_right,steps,0);
          //
          // }

          this.is_motors_on_active = false;

          clearTimeout(this.robot_motors_on_for_seconds_timeout_stop);


          if ((util.stackFrame.steps != null) && (typeof(util.stackFrame.steps) != 'undefined') ) {

            //  const stepsDelta =  this.calculate_steps_delta();

            var stepsDeltaLeft  =  this.calculate_steps_delta_left();
            var stepsDeltaRight =  this.calculate_steps_delta_right();

            if (  (stepsDeltaLeft < util.stackFrame.steps  ) && (stepsDeltaRight < util.stackFrame.steps)  && (!this.need_to_stop) ) { // TODO: сделать корректную проверку для робота без энкодеров

            //      console.log(`robot_turnleft stepsDeltaLeft: ${stepsDeltaLeft} stepsDeltaRight: ${stepsDeltaRight}`);


              //  util.stackFrame.steps_counter++;

                util.yield();

              } else{

              //      console.log(`robot_turnleft exit function stepsDeltaLeft: ${stepsDeltaLeft} stepsDeltaRight: ${stepsDeltaRight}`);

                    util.stackFrame.steps = null;

                    //this.need_to_stop = true; //for robot_set_direction_to //modified_by_Yaroslav

              }
          } else {

              if (!this.runtime.RCA.isRobotReadyToAcceptCommand()){

                this.runtime.RCA.block_A_CommandQueue(); 
                util.yield();
                return;

              }else{
               
               this.runtime.RCA.unblock_A_CommandQueue(); 

              }

              util.stackFrame.steps = this.check_65535(Math.round(args.DEGREES / DEGREE_RATIO))
              this.stepsInitValueLeft  =  this.runtime.RCA.getLeftPath();
              this.stepsInitValueRight =  this.runtime.RCA.getRightPath();
            //  util.stackFrame.steps_counter = 0;


              clearInterval(this.motors_on_interval);
              // //  clearInterval(this.motors_off_interval);
            //  this.runtime.RCA.setRobotPower(0,0,0);

              if (util.stackFrame.steps <= 0) {

                  return;
              }



              let power_left =   Math.round(30 * 0.63) + 64;
              let power_right =  Math.round(30 * 0.63);

              this.runtime.RCA.setRobotPowerAndStepLimits(power_left,power_right, util.stackFrame.steps ,0);
            //  util.stackFrame.steps_counter++;


              this.need_to_stop = false;

              util.yield();
          }

    }

    robot_set_motors_power(args, util){

      //this.runtime.RCA.setRobotPower(0,0,0);

      let power = this.check_value_out_of_range(args.POWER,0,100);

        this.power_in_percent_left    =   power;
        this.power_in_percent_right   =   power;

    //  console.log(`robot_set_motors_power power_in_percent_left: ${this.power_in_percent_left} power_in_percent_right: ${this.power_in_percent_right}`);

        this.update_power_using_direction(this.robot_direction);

         if (this.is_motors_on_active){

                if (this.runtime.RCA.isRobotReadyToAcceptCommand()){

                      
                   this.activate_robot_power();
                   this.runtime.RCA.unblock_A_CommandQueue();  
          
                  
                  }else{

                    this.runtime.RCA.block_A_CommandQueue();  
                    util.yield();
                    

                  }

            }


    }

    robot_set_motors_power_left_right_separately(args, util){

                   //   this.runtime.RCA.setRobotPower(0,0,0);
      this.power_in_percent_left    =   this.check_value_out_of_range(args.POWER_LEFT,0,100);
      this.power_in_percent_right   =   this.check_value_out_of_range(args.POWER_RIGHT,0,100);

    //  console.log(`robot_set_motors_power_left_right_separately power_in_percent_left: ${this.power_in_percent_left} power_in_percent_right: ${this.power_in_percent_right}`);

      this.update_power_using_direction(this.robot_direction);

       if (this.is_motors_on_active){

                if (this.runtime.RCA.isRobotReadyToAcceptCommand()){

                      
                   this.activate_robot_power();
                   this.runtime.RCA.unblock_A_CommandQueue();  
          
                  
                  }else{

                    this.runtime.RCA.block_A_CommandQueue();  
                    util.yield();
                    

                  }

            }


    }

    robot_start_button_pressed(args, util){

        return (this.runtime.RCA.getButtonStartPushed() == 'true')?true:false;

    }

    robot_turn_led_on(args, util){

    //   console.log(`robot_turn_led_on led_position: ${args.ROBOT_POSITION}`);

       if (!this.runtime.RCA.isRobotReadyToAcceptCommand()){ 

              this.runtime.RCA.block_A_CommandQueue();  //not ready right now 
              util.yield();
              return;
                    

        }


        //here we ready

        this.runtime.RCA.unblock_A_CommandQueue(); 

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

    //  console.log(`robot_turn_led_off led_position: ${args.ROBOT_POSITION}`);
      
      if (!this.runtime.RCA.isRobotReadyToAcceptCommand()){ 

              this.runtime.RCA.block_A_CommandQueue();  //not ready right now 
              util.yield();
              return;
                    

        }


        //here we ready

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

      this.runtime.RCA.unblock_A_CommandQueue(); 


    }

    robot_reset_trip_meters(args, util){

  //    console.log(`robot_reset_trip_meters`);

      this.runtime.RCA.resetTripMeters();

    }

    robot_claw_closed(args, util){

  //    console.log(`robot_claw_closed degrees: ${args.CLAW_CLOSED_PERCENT}`);

        var degrees = this.check_value_out_of_range(args.CLAW_CLOSED_PERCENT,0,100);

        if (!this.runtime.RCA.isRobotReadyToAcceptCommand()){ 

              this.runtime.RCA.block_A_CommandQueue();  //not ready right now 
              util.yield();
              return;
                    

        }


        //here we ready
         this.runtime.RCA.setClawDegrees(degrees,0);

        this.runtime.RCA.unblock_A_CommandQueue(); 

    }

    robot_claw_state(args, util){

    //    console.log(`robot_claw_state state: ${args.CLAW_STATES}`);

       if (!this.runtime.RCA.isRobotReadyToAcceptCommand()){ 

              this.runtime.RCA.block_A_CommandQueue();  //not ready right now 
              util.yield();
              return;
                    

        }


        //here we ready

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

        this.runtime.RCA.unblock_A_CommandQueue(); 



    }

    }

    module.exports = Scratch3RobotBlocks;
