const Cast = require('../util/cast');
const MathUtil = require('../util/math-util');
const Timer = require('../util/timer');


class Scratch3RobotBlocks {
    constructor (runtime) {
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
         this.runtime = runtime;
         this.pos_ll=90;
         this.pos_rl=90;
         this.pos_lf=90;
         this.pos_rf=90;
         this.pos_lh=90;
         this.pos_rh=90;
         this.matrix="0000000000000000000000000000000000000000000000000000000000000000";
         this.block_time=Date.now();
         this.sound_time=Date.now();
         this.ledMatrixState= [];
      //  this.power = Math.round(this.power_in_percent* 0.63);
      this.flag=1;
    }

    /**
     * Retrieve the block primitives implemented by this package.
     * @return {object.<string, Function>} Mapping of opcode to Function.
     */
    getPrimitives () {
        return {
            otto_move_servo:this.otto_move_servo,
            otto_matrix_pix:this.otto_matrix_pix,
            otto_matrix_all_pix:this.otto_matrix_all_pix,
            otto_led:this.otto_led,
            otto_play_sound:this.otto_play_sound,
            otto_distance:this.otto_distance,
            otto_hearing:this.otto_hearing,
            otto_move_servo_foot:this.otto_move_servo_foot,
            otto_move_servo_hand:this.otto_move_servo_hand
//            robot_motors_off:this.robot_motors_off,
        };
    }
    otto_move_servo(args,util)
    {
      if(this.block_time<Date.now())
      {
        if(this.flag==1)
        {
        if(Number(args.SERVO_DIST)>179)
          args.SERVO_DIST="180";
        if(Number(args.SERVO_DIST)<0)
          args.SERVO_DIST="0";
        this.runtime.OCA.move_servo_one(Number(args.OTTO_SERVO),Number(args.SERVO_DIST),Number(args.SERVO_SPEED));

        switch(Number(args.OTTO_SERVO))
        {
          case 0:
          {
            this.block_time = Date.now() + 2.3 * (Number(args.SERVO_SPEED) + 0.4) * 350 * Math.max(Math.abs(this.pos_ll - Number(args.SERVO_DIST))) / 180;
            this.pos_ll=Number(args.SERVO_DIST);
          break;
          }
          case 1:
          {
            this.block_time = Date.now() + 2.3 * (Number(args.SERVO_SPEED) + 0.4) * 350 * Math.max(Math.abs(this.pos_rl - Number(args.SERVO_DIST))) / 180;
            this.pos_rl=Number(args.SERVO_DIST);
          break;
          }
          case 2:
          {
            this.block_time = Date.now() + 2.3 * (Number(args.SERVO_SPEED) + 0.4) * 350 * Math.max(Math.abs(this.pos_lf - Number(args.SERVO_DIST))) / 180;
            this.pos_lf=Number(args.SERVO_DIST);
          break;
          }
          case 3:
          {
            this.block_time = Date.now() + 2.3 * (Number(args.SERVO_SPEED) + 0.4) * 350 * Math.max(Math.abs(this.pos_rf - Number(args.SERVO_DIST))) / 180;
            this.pos_rf=Number(args.SERVO_DIST);
          break;
          }
          case 4:
          {
            this.block_time = Date.now() + 2.3 * (Number(args.SERVO_SPEED) + 0.4) * 350 * Math.max(Math.abs(this.pos_lh - Number(args.SERVO_DIST))) / 180;
            this.pos_lh=Number(args.SERVO_DIST);
          break;
          }
          case 5:
          {
            this.block_time = Date.now() + 2.3 * (Number(args.SERVO_SPEED) + 0.4) * 350 * Math.max(Math.abs(this.pos_rh - Number(args.SERVO_DIST))) / 180;
            this.pos_rh=Number(args.SERVO_DIST);
          break;
          }
        }
        this.flag=0;
        util.yield();
        }
        else {
          this.flag=1;
        }
      }
      else
      {
            util.yield();
      }
  }
    otto_move_servo_foot(args,util)
    {
      if(Number(args.OTTO_LF)>179)
      args.OTTO_LF="180";
      if(Number(args.OTTO_LF)<0)
      args.OTTO_LF="0";
      if(Number(args.OTTO_RF)>179)
      args.OTTO_RF="180";
      if(Number(args.OTTO_RF)<0)
      args.OTTO_RF="0";
      if(Number(args.OTTO_LL)>179)
      args.OTTO_LL="180";
      if(Number(args.OTTO_LL)<0)
      args.OTTO_LL="0";
      if(Number(args.OTTO_RL)>179)
      args.OTTO_RL="180";
      if(Number(args.OTTO_RL)<0)
      args.OTTO_RL="0";
      if(this.block_time<Date.now())
      {
        if(this.flag==1)
        {
        this.runtime.OCA.move_servo_foot(Number(args.OTTO_LF),Number(args.OTTO_RF),Number(args.OTTO_LL),Number(args.OTTO_RL),Number(args.SERVO_SPEED));
        this.block_time = Date.now() + 2.3 * (Number(args.SERVO_SPEED) + 0.4) * 350 * Math.max(Math.abs(this.pos_ll - Number(args.OTTO_LL)), Math.abs(this.pos_rl - Number(args.OTTO_RL)), Math.abs(this.pos_lf - Number(args.OTTO_LF)), Math.abs(this.pos_rf - Number(args.OTTO_RF))) / 180;
        this.pos_ll=Number(args.OTTO_LL);
        this.pos_rl=Number(args.OTTO_RL);
        this.pos_lf=Number(args.OTTO_LF);
        this.pos_rf=Number(args.OTTO_RF);
        this.flag=0;
        util.yield();
        }
        else {
          this.flag=1;
        }
      }
      else
      {
            util.yield();
      }
    }
    otto_move_servo_hand(args,util)
    {
      if(Number(args.OTTO_LH)>179)
      args.OTTO_LH="180";
      if(Number(args.OTTO_LH)<0)
      args.OTTO_LH="0";
      if(Number(args.OTTO_RH)>179)
      args.OTTO_RH="180";
      if(Number(args.OTTO_RH)<0)
      args.OTTO_RH="0";
        if(this.block_time<Date.now())
        {
          if(this.flag==1)
          {
          this.runtime.OCA.move_servo_hand(Number(args.OTTO_LH),Number(args.OTTO_RH),Number(args.SERVO_SPEED));
          this.block_time = Date.now() + 2.3 * (Number(args.SERVO_SPEED) + 0.4) * 350 * Math.max(Math.abs(this.pos_lh - Number(args.OTTO_LH)), Math.abs(this.pos_rh - Number(args.OTTO_RH))) / 180;
          this.pos_lh=Number(args.OTTO_LH);
          this.pos_rh=Number(args.OTTO_RH);
          this.flag=0;
          util.yield();
          }
          else {
            this.flag=1;
          }
        }
        else
        {
              util.yield();
        }
    }
    otto_matrix_pix(args,util){
      this.runtime.OCA.one_led(Number(args.MATRIX_STROK),Number(args.MATRIX_STOLB),Number(args.ON_OFF));
    }

    otto_matrix_all_pix(args,util){
  //    console.warn(args.MATRIX);
      const symbol = Cast.toString(args.MATRIX);
      const first =symbol.slice(0,32);
      const second = symbol.slice(32);
      const reducer = (accumulator, c, index) => {
          const value = (c === '0') ? accumulator : accumulator + Math.pow(2, index);
          return value;
      };
      const hex1 = first.split('').reduce(reducer, 0);
      const hex2 = second.split('').reduce(reducer, 0);
      //console.warn(hex);
          this.ledMatrixState[7] = hex1 & 0xFF;
          this.ledMatrixState[6] = (hex1 >> 8) & 0xFF;
          this.ledMatrixState[5] = (hex1 >> 16) & 0xFF;
          this.ledMatrixState[4] = (hex1 >> 24) & 0xFF;
          this.ledMatrixState[3] = hex2 & 0xFF;
          this.ledMatrixState[2] = (hex2 >> 8) & 0xFF;
          this.ledMatrixState[1] = (hex2 >> 16) & 0xFF;
          this.ledMatrixState[0] = (hex2 >> 24) & 0xFF;

              this.runtime.OCA.all_led(this.ledMatrixState);
    }

    otto_led(args,util){
      //console.warn("HUI IS HUI!?");
      if(args.ON_OFF_R<1)
      args.ON_OFF_R=0;
      if(args.ON_OFF_G<1)
      args.ON_OFF_G=0;
      if(args.ON_OFF_B<1)
      args.ON_OFF_B=0;
      if(args.ON_OFF_R>254)
      args.ON_OFF_R=255;
      if(args.ON_OFF_G>254)
      args.ON_OFF_G=255;
      if(args.ON_OFF_B>254)
      args.ON_OFF_B=255;
      this.runtime.OCA.nose(args.ON_OFF_R,args.ON_OFF_G,args.ON_OFF_B);
    }

    otto_play_sound(args,util){
      //    console.warn(args.NOTE_TYPE);
        if(Number(args.NOTE_TYPE)<1)
        this.runtime.OCA.play_sound(0,Number(args.NOTE_DURA));
        else if(Number(args.NOTE_TYPE)>4094)
        this.runtime.OCA.play_sound(4095,Number(args.NOTE_DURA));
        else
        this.runtime.OCA.play_sound(Number(args.NOTE_TYPE),Number(args.NOTE_DURA));
    }

    otto_distance(args,util){
      return  this.runtime.OCA.get_dist();
    }

    otto_hearing(args,util){
      return  this.runtime.OCA.get_sound();
    }

    otto_move_walk(args,util)
    {

       util.yield();
        this.runtime.OCA
    }
    robot_motors_off(args, util){
      console.log(`Robot stop!`);
      clearInterval(this.motors_on_interval);
      clearInterval(this.motors_off_interval);
      this.need_to_stop = true;
      this.runtime.RCA.setRobotPower(0,0,0);
    }


    }

    module.exports = Scratch3RobotBlocks;
