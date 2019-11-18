const TIME_DLYA_DEISTVIYA = 100;
class Scratch3LaboratoryBlocks {
    constructor (runtime) {
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.runtime = runtime;
        this.timer_dlya_blocka1 =  false;
        this.first_coming1 = true;
        this.timer_dlya_blocka2 =  false;
        this.first_coming2 = true;
        this.timer_dlya_blocka3 =  false;
        this.first_coming3 = true;
        this.timer_dlya_blocka4 =  false;
        this.first_coming4 = true;
        this.timer_dlya_blocka5 =  false;
        this.first_coming5 = true;
        this.timer_dlya_blocka6 =  false;
        this.first_coming6 = true;
        this.timer_dlya_blocka7 =  false;
        this.first_coming7 = true;
    }

    /**
     * Retrieve the block primitives implemented by this package.
     * @return {object.<string, Function>} Mapping of opcode to Function.
     */
    getPrimitives () {
        return {

            lab_led_turn_on: this.lab_led_turn_on,
            lab_led_turn_off: this.lab_led_turn_off,
            lab_color_led_turn_on: this.lab_color_led_turn_on,
            lab_color_led_turn_off: this.lab_color_led_turn_off,
            lab_digital_pin_set_on_off: this.lab_digital_pin_set_on_off,
            lab_digital_pin_set_pwm_value: this.lab_digital_pin_set_pwm_value,
            lab_sensor: this.lab_sensor,
            lab_button_pressed: this.lab_button_pressed,
            lab_external_sensor: this.lab_external_sensor,
            lab_analog_pin: this.lab_analog_pin,
            lab_digital_pin: this.lab_digital_pin,
            lab_play_note: this.lab_play_note



        };
    }

    getMonitored () {
        return {

        };
    }

      lab_led_turn_on(args , util){
           
       if (this.runtime.LCA.isLabReadyToAcceptCommand())
            {
             

        try {

           args.LED_NUMS = args.LED_NUMS.toString(); 
          
        } catch (error) {

          console.error("Can not convert args.LED_NUMS to String type");
          
        }
       

        switch (args.LED_NUMS) {

          case '0':

                   this.runtime.LCA.turnLedOn(0,0);

            break;

           case '1':

                   this.runtime.LCA.turnLedOn(1,0);

              break;

           case '2':

                   this.runtime.LCA.turnLedOn(2,0);

             break;

           case '3':

                   this.runtime.LCA.turnLedOn(3,0);

             break;

         case '4':

                   this.runtime.LCA.turnLedOn(4,0);

          break;

          case '5':

                    this.runtime.LCA.turnLedOn(5,0);

           break;

           case '6':

                     this.runtime.LCA.turnLedOn(6,0);

            break;

            case '7':

                      this.runtime.LCA.turnLedOn(7,0);

             break;

          default:

        }

        this.runtime.LCA.unblock_A_CommandQueue();

      }
       else{
              this.runtime.LCA.block_A_CommandQueue();  
              util.yield();
          }
      }


      lab_led_turn_off(args , util){
        
      if (this.runtime.LCA.isLabReadyToAcceptCommand())
        {
        

    //    console.log(`lab_turn_led_off led_position: ${args.LED_NUMS}`);

         try {

           args.LED_NUMS = args.LED_NUMS.toString(); 
          
        } catch (error) {

          console.error("Can not convert args.LED_NUMS to String type");
          
        }

        switch (args.LED_NUMS) {

          case '0':

                   this.runtime.LCA.turnLedOff(0,0);

            break;

           case '1':

                   this.runtime.LCA.turnLedOff(1,0);

              break;

           case '2':

                   this.runtime.LCA.turnLedOff(2,0);

             break;

           case '3':

                   this.runtime.LCA.turnLedOff(3,0);

             break;

         case '4':

                   this.runtime.LCA.turnLedOff(4,0);

          break;

          case '5':

                    this.runtime.LCA.turnLedOff(5,0);

           break;

           case '6':

                     this.runtime.LCA.turnLedOff(6,0);

            break;

            case '7':

                      this.runtime.LCA.turnLedOff(7,0);

             break;

          default:

        }
         this.runtime.LCA.unblock_A_CommandQueue();

      }
       else{
              this.runtime.LCA.block_A_CommandQueue();  
              util.yield();
          }
    }

      lab_color_led_turn_on(args,util){
        
        if (this.runtime.LCA.isLabReadyToAcceptCommand())
           {

                //  console.log(`lab_color_led_turn_on led: ${args.LED_COLORS}`);

              this.runtime.LCA.turnColorLedOn(args.LED_COLORS,0);
              this.runtime.LCA.unblock_A_CommandQueue();

           }
           else{
                  this.runtime.LCA.block_A_CommandQueue();  
                  util.yield();
               }
        }


      lab_color_led_turn_off(args,util){
       
        if (this.runtime.LCA.isLabReadyToAcceptCommand())
          {
          
          
            //  console.log(`lab_color_led_turn_off led: ${args.LED_COLORS}`);

              this.runtime.LCA.turnColorLedOff(args.LED_COLORS,0);
              this.runtime.LCA.unblock_A_CommandQueue();
          }
          else{
                  this.runtime.LCA.block_A_CommandQueue();  
                  util.yield();
              }
      }

      lab_digital_pin_set_on_off(args,util){
      
        if (this.runtime.LCA.isLabReadyToAcceptCommand())
          {
        
        //  console.log(`lab_digital_pin_set_on_off pin: ${args.LAB_DIGITAL_PIN} pin_state: ${args.LAB_DIGITAL_PIN_STATE} `);

            this.runtime.LCA.setDigitalOnOff(args.LAB_DIGITAL_PIN,args.LAB_DIGITAL_PIN_STATE,0);
            this.runtime.LCA.unblock_A_CommandQueue();
         }
          else{
                  this.runtime.LCA.block_A_CommandQueue();  
                  util.yield();
              }
        }


      lab_digital_pin_set_pwm_value(args,util){
       
        if (this.runtime.LCA.isLabReadyToAcceptCommand())
         {
          
            //  console.log(`lab_digital_pin_set_pwm_value pin: ${args.LAB_DIGITAL_PIN} pwm_value: ${args.PWM_VALUE} `);

            this.runtime.LCA.setDigitalPWM(args.LAB_DIGITAL_PIN,args.PWM_VALUE,0);
            this.runtime.LCA.unblock_A_CommandQueue();
        }
        else{
                  this.runtime.LCA.block_A_CommandQueue();  
                  util.yield();
            }
      }

      lab_sensor(args){

    //  console.log(`lab_sensor sensor: ${args.LAB_SENSOR}`);

        return   this.runtime.LCA.getSensorData(args.LAB_SENSOR);

      // switch (args.LAB_SENSOR) {
      //
      //   case "light":
      //
      //       return   this.runtime.LCA.getSensorsData().a5[0];
      //
      //     break;
      //
      //   case "sound":
      //
      //           return   this.runtime.LCA.getSensorsData().a4[0];
      //
      //       break;
      //
      //   case "slider":
      //
      //         return   this.runtime.LCA.getSensorsData().a7[0];
      //
      //       break;
      //
      //
      //   default:
      //
      // }




      }

      lab_button_pressed(args){

      //    console.log(`lab_button_pressed button number: ${args.BUTTON_NUMBER}`);

          return this.runtime.LCA.islaboratoryButtonPressed(0,Number(args.BUTTON_NUMBER));

      }

      lab_external_sensor(args){

      //  console.log(`lab_external_sensor sensor: ${args.LAB_EXTERNAL_SENSOR}`);

      //  var pin = Number(args.LAB_EXTERNAL_SENSOR.replace("A",""));

        return   this.runtime.LCA.getSensorData(args.LAB_EXTERNAL_SENSOR);

      }

      lab_analog_pin(args){

    //  console.log(`lab_analog_pin analog_pin: ${args.LAB_ANALOG_PIN}`);

    //  var pin = Number(args.LAB_ANALOG_PIN.replace("A",""));

      return   this.runtime.LCA.getSensorData(args.LAB_ANALOG_PIN);

      }

      lab_digital_pin(args){

      //  console.log(`lab_digital_pin digital_pin: ${args.LAB_DIGITAL_PIN}`);

        return this.runtime.LCA.labDigitalPinState(0,args.LAB_DIGITAL_PIN);

      }

      lab_play_note(args,util){
       
        if (this.runtime.LCA.isLabReadyToAcceptCommand())
         {
       
            //    console.log(`lab_play_note: ${args.LAB_NOTE}`);

                let note = args.LAB_NOTE;

                if (isNaN(note)) return;

                note = Math.round(args.LAB_NOTE);

                note = (note < 48)?48:note;
                note = (note  > 72)?72:note;

                note = note - 48;


                this.runtime.LCA.labPlayNote(0,note);
                this.runtime.LCA.unblock_A_CommandQueue();
          }
          else{
                  this.runtime.LCA.block_A_CommandQueue();  
                  util.yield();
          }
    }

  }

    module.exports = Scratch3LaboratoryBlocks;
