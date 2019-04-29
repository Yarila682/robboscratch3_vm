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
         this.sound_flag=0;
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
         this.ledMatrixState[7]=0;
         this.ledMatrixState[6]=0;
         this.ledMatrixState[5]=0;
         this.ledMatrixState[4]=0;
         this.ledMatrixState[3]=0;
         this.ledMatrixState[2]=0;
         this.ledMatrixState[1]=0;
         this.ledMatrixState[0]=0;
         this.text_timer=Date.now();
         this.text_long=0;
         this.text_char=0;
         this.sounds=[
33,35,37,39,41,44,46,49,52,55,58,62,
65, 69, 73, 78, 82, 87, 93, 98, 104, 110, 117, 123,
131, 139, 147, 156, 165, 175, 185, 196, 208, 220, 233, 247,
262, 277, 294, 311, 330, 349, 370, 392, 415, 440, 466, 494,
523, 554, 587, 622, 659, 698, 740, 784, 831, 880, 932, 988,
1047, 1109, 1175, 1245, 1319, 1397, 1480, 1568, 1661, 1760, 1865, 1976,
2093, 2217, 2349, 2489, 2637, 2794, 2960, 3136, 3322, 3520, 3729, 3951];
         this.TEXT_MASS={};
         this.TEXT_MASS.H=[127,8,8,127,0];
         this.TEXT_MASS.I=[65,127,65,0];
         this.TEXT_MASS.U=[63,64,64,63,0];
         this.TEXT_MASS.A=[126,9,9,126,0];
         this.TEXT_MASS.B=[123,73,73,54,0];
         this.TEXT_MASS.C=[62,65,65,65,0];
         this.TEXT_MASS.D=[127,65,65,62,0];
         this.TEXT_MASS.E=[127,73,73,65,0];
         this.TEXT_MASS.F=[127,9,9,1,0];
         this.TEXT_MASS.G=[62,65,81,50,0];
         this.TEXT_MASS.J=[32,64,64,63,0];
         this.TEXT_MASS.K=[127,12,18,97,0];
         this.TEXT_MASS.L=[127,64,64,64,0];
         this.TEXT_MASS.O=[62,65,65,62,0];
         this.TEXT_MASS.M=[127,2,4,2,127,0];
         this.TEXT_MASS.N=[127,2,8,16,127,0];
         this.TEXT_MASS.P=[127,9,9,6,0];
         this.TEXT_MASS.Q=[62,65,81,33,94,0];
         this.TEXT_MASS.R=[127,25,41,70,0];
         this.TEXT_MASS.S=[70,73,73,49,0];
         this.TEXT_MASS.T=[1,1,127,1,1,0];
         this.TEXT_MASS.V=[31,32,	64,	32,	31,0];
         this.TEXT_MASS.W=[63,	64,	48,	64,	63,	0];
         this.TEXT_MASS.X=[99,	20,	8,	20,	99,	0];
         this.TEXT_MASS.Y=[3,	4,	120,	4,	3,	0];
         this.TEXT_MASS.Z=[97,	81,	73,	69,	67,	0];
         this.TEXT_MASS.a=[32,	84,	84,	120,	0];
         this.TEXT_MASS.b=[127,	72,	72,	48,	0];
         this.TEXT_MASS.c=[56,	68,	68,	40,	0];
         this.TEXT_MASS.d=[48,	72,	72,	127,	0];
         this.TEXT_MASS.e=[56,	84,	84,	24,	0];
         this.TEXT_MASS.f=[126,	9,	9,	0];
         this.TEXT_MASS.g=[24,	164,	164,	124,	0];
         this.TEXT_MASS.h=[127,	8,	8,	112,	0];
         this.TEXT_MASS.i=[122,	0];
         this.TEXT_MASS.j=[128,	125,	0];
         this.TEXT_MASS.k=[127,	8,	20,	98,	0];
         this.TEXT_MASS.l=[63,	64,	0];
         this.TEXT_MASS.m=[124,	4,	124,	4,	120,	0];
         this.TEXT_MASS.o=[56,	68,	68,	56,	0];
         this.TEXT_MASS.n=[124,	4,	4,	120,	0];
         this.TEXT_MASS.p=[252,	36,	36,	24,	0];
         this.TEXT_MASS.q=[24,	36,	36,	248,	0];
         this.TEXT_MASS.r=[	124,	8,	4,	4,	0];
         this.TEXT_MASS.s=[72,	84,	84,	36,	0];
         this.TEXT_MASS.t=[4,	62,	68,	68,	0];
         this.TEXT_MASS.u=[60,	64,	64,	124,	0];
         this.TEXT_MASS.v=[28,	32,	64,	32,	28,	0];
         this.TEXT_MASS.w=[60,	64,	48,	64,	60,	0];
         this.TEXT_MASS.x=[108,	16,	16,	108,	0];
         this.TEXT_MASS.y=[28,	160,	160,	124,	0];
         this.TEXT_MASS.z=[100,	84,	84,	76,	0];
         this.TEXT_MASS[' ']=[0];
         this.TEXT_MASS['а']=[32,	84,	84,	120,	0];
         this.TEXT_MASS['б']=[124,	84,	84,	32,	0];
         this.TEXT_MASS['в']=[124,	84,	84,	40,	0];
         this.TEXT_MASS['г']=[124,	4,	4,	0];
         this.TEXT_MASS['д']=[192,	124,	68,	124,	192,	0];
         this.TEXT_MASS['е']=[56,	84,	84,	24,	0];
         this.TEXT_MASS['ё']=[120,	165,	164,	165,	152,	0];
         this.TEXT_MASS['ж']=[108,	16,	124,	16,	108,	0];
         this.TEXT_MASS['з']=[40,	68,	84,	40,	0];
         this.TEXT_MASS['и']=[124,	32,	16,	8,	124,	0];
         this.TEXT_MASS['й']=[124,	33,	17,	9,	124,	0];
  this.TEXT_MASS['к']=[124,	16,	40,	68,	0];
         this.TEXT_MASS['л']=[64,	56,	4,	124,	0];
         this.TEXT_MASS['м']=[124,	8,	16,	8,	124,	0];
         this.TEXT_MASS['н']=[124,	16,	124,	0];
         this.TEXT_MASS['о']=[56,	68,	68,	56,	0];
         this.TEXT_MASS['п']=[124,	4,	4,	124,	0];
         this.TEXT_MASS['р']=[124,	20,	20,	8,	0];
         this.TEXT_MASS['с']=[56,	68,	68,	40,	0];
         this.TEXT_MASS['т']=[4,	124,	4,	0];
         this.TEXT_MASS['у']=[76,	80,	60,	0];
         this.TEXT_MASS['ф']=[24,	36,	124,	36,	24,	0];
         this.TEXT_MASS['х']=[108,	16,	16,	108,	0];
         this.TEXT_MASS['ц']=[124,	64,	124,	192,	0];
         this.TEXT_MASS['ч']=[124,	64,	124,	192,	0];
         this.TEXT_MASS['ш']=[124,	64,	124,	64,	124,	0];
         this.TEXT_MASS['щ']=[124,	64,	124,	64,	124,	192,	0];
         this.TEXT_MASS['ъ']=[4,	124,	80,	32,	0];
         this.TEXT_MASS['ы']=[124,	80,	32,	0,	124,	0];
         this.TEXT_MASS['ь']=[124,	80,	32,	0];
         this.TEXT_MASS['э']=[84,	84,	56,	0];
         this.TEXT_MASS['ю']=[124,	16,	56,	68,	56,	0];
         this.TEXT_MASS['я']=[72,	52,	124,	0];
         this.TEXT_MASS['А']=[126,	9,	9,	126,	0];
         this.TEXT_MASS['Б']=[127,	73,	73,	49,	0];
         this.TEXT_MASS['В']=[127,	73,	73,	54,	0];
         this.TEXT_MASS['Г']=[127,	1,	1,	1,	0];
         this.TEXT_MASS['Д']=[224,	63,	33,	63,	224,	0];
         this.TEXT_MASS['Е']=[127,	73,	73,	65,	0];
         this.TEXT_MASS['Ё']=[127,	73,	73,	65,	0];
         this.TEXT_MASS['Ж']=[119,	8,	127,	8,	119,	0];
         this.TEXT_MASS['З']=[73,	73,	73,	54,	0];
         this.TEXT_MASS['И']=[127,	16,	8,	4,	127,	0];
         this.TEXT_MASS['Й']=[127,	16,	9,	4,	127,	0];
         this.TEXT_MASS['К']=[127,	8,	20,	99,	0];
         this.TEXT_MASS['Л']=[124,	2,	1,	127,	0];
         this.TEXT_MASS['М']=[127,	2,	4,	2,	127,	0];
         this.TEXT_MASS['Н']=[127,	8,	8,	127,	0];
         this.TEXT_MASS['О']=[62,	65,	65,	62,	0];
         this.TEXT_MASS['П']=[127,	1,	1,	127,	0];
         this.TEXT_MASS['Р']=[127,	9,	9,	6,	0];
         this.TEXT_MASS['С']=[62,	65,	65,	34,	0];
         this.TEXT_MASS['Т']=[1,	1,	127,	1,	1,	0];
         this.TEXT_MASS['У']=[39,	72,	72,	63,	0];
         this.TEXT_MASS['Ф']=[14,	17,	127,	17,	14,	0];
         this.TEXT_MASS['Х']=[99,	20,	8,	20,	99,	0];
         this.TEXT_MASS['Ц']=[127,	64,	64,	127,	192,	0];
         this.TEXT_MASS['Ч']=[15,	8,	8,	127,	0];
         this.TEXT_MASS['Ш']=[127,	64,	127,	64,	127,	0];
         this.TEXT_MASS['Щ']=[127,	64,	127,	64,	127,	192,	0];
         this.TEXT_MASS['Ъ']=[1,	127,	72,	72,	48,	0];
         this.TEXT_MASS['Ы']=[127,	72,	48,	0,	127,	0];
         this.TEXT_MASS['ь']=[127,	72,	48,	0];
         this.TEXT_MASS['Э']=[65,	73,	42,	28,	0];
         this.TEXT_MASS['Ю']=[127,	8,	62,	65,	62,	0];
         this.TEXT_MASS['Я']=[70,	41,	25,	126,	0];
         this.TEXT_MASS['+']=[8,	28,	8,	0];
         this.TEXT_MASS['-']=[8,	8,	8,	0];
         this.TEXT_MASS['!']=[95,	0];
         this.TEXT_MASS['0']=[62,	65,	65,	62,	0];
         this.TEXT_MASS['1']=[66,	127,	64,	0];
         this.TEXT_MASS['2']=[98,	81,	73,	70,	0];
         this.TEXT_MASS['3']=[34,	65,	73,	54,	0];
         this.TEXT_MASS['4']=[24,	20,	18,	255,	16,	0];
         this.TEXT_MASS['5']=[79,	137,	137,	113,	0];
         this.TEXT_MASS['6']=[62,	73,	73,	50,	0];
         this.TEXT_MASS['7']=[1,	121,	5,	3,	0];
         this.TEXT_MASS['8']=[119,	73,	73,	119,	0];
         this.TEXT_MASS['9']=[38,	73,	73,	62,	0];
         this.TEXT_MASS['(']=[62,	65,	0];
         this.TEXT_MASS[')']=[65,	62,	0];
         this.TEXT_MASS['*']=[8,	0];
         this.TEXT_MASS['/']=[16,	8,	4,	0];
         this.TEXT_MASS[',']=[128,	224,	96,	0];
         this.TEXT_MASS['.']=[96,	96,	0];
         this.doing=Date.now();
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
            otto_move_servo_hand:this.otto_move_servo_hand,
            otto_text:this.otto_text
//            robot_motors_off:this.robot_motors_off,
        };
    }
    otto_move_servo(args,util){
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
          case 2: //left leg
          {
            this.block_time = Date.now() + 2.3 * (Number(args.SERVO_SPEED) + 0.4) * 350 * Math.max(Math.abs(this.pos_ll - Number(args.SERVO_DIST))) / 180;
            this.pos_ll=Number(args.SERVO_DIST);
          break;
          }
          case 3: //right leg
          {
            this.block_time = Date.now() + 2.3 * (Number(args.SERVO_SPEED) + 0.4) * 350 * Math.max(Math.abs(this.pos_rl - Number(args.SERVO_DIST))) / 180;
            this.pos_rl=Number(args.SERVO_DIST);
          break;
          }
          case 0: //left foot
          {
            this.block_time = Date.now() + 2.3 * (Number(args.SERVO_SPEED) + 0.4) * 350 * Math.max(Math.abs(this.pos_lf - Number(args.SERVO_DIST))) / 180;
            this.pos_lf=Number(args.SERVO_DIST);
          break;
          }
          case 1://right foot
          {
            this.block_time = Date.now() + 2.3 * (Number(args.SERVO_SPEED) + 0.4) * 350 * Math.max(Math.abs(this.pos_rf - Number(args.SERVO_DIST))) / 180;
            this.pos_rf=Number(args.SERVO_DIST);
          break;
          }
          case 4://left hand
          {
            this.block_time = Date.now() + 2.3 * (Number(args.SERVO_SPEED) + 0.4) * 350 * Math.max(Math.abs(this.pos_lh - Number(args.SERVO_DIST))) / 180;
            this.pos_lh=Number(args.SERVO_DIST);
          break;
          }
          case 5://right hand
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

    otto_move_servo_foot(args,util) {
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

    otto_move_servo_hand(args,util){
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
      this.runtime.OCA.one_led(7 - Number(args.MATRIX_STOLB),Number(args.MATRIX_STROK),Number(args.ON_OFF));
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

    otto_text(args,util){
      if(Date.now()-this.doing>100)
      {this.text_char=0;this.text_long=0;
      this.ledMatrixState[0]=0;this.ledMatrixState[1]=0;this.ledMatrixState[2]=0;this.ledMatrixState[3]=0;this.ledMatrixState[4]=0;this.ledMatrixState[5]=0;this.ledMatrixState[6]=0;this.ledMatrixState[7]=0;}
      this.doing=Date.now();
      if(this.text_timer<Date.now())
      {
          this.ledMatrixState[7] = (this.ledMatrixState[7]>>1)+((this.TEXT_MASS[args.OTTO_TEXT[this.text_char]][this.text_long]>>0)&1)*128;
          this.ledMatrixState[6] = (this.ledMatrixState[6]>>1)+((this.TEXT_MASS[args.OTTO_TEXT[this.text_char]][this.text_long]>>1)&1)*128;
          this.ledMatrixState[5] = (this.ledMatrixState[5]>>1)+((this.TEXT_MASS[args.OTTO_TEXT[this.text_char]][this.text_long]>>2)&1)*128;
          this.ledMatrixState[4] = (this.ledMatrixState[4]>>1)+((this.TEXT_MASS[args.OTTO_TEXT[this.text_char]][this.text_long]>>3)&1)*128;
          this.ledMatrixState[3] = (this.ledMatrixState[3]>>1)+((this.TEXT_MASS[args.OTTO_TEXT[this.text_char]][this.text_long]>>4)&1)*128;
          this.ledMatrixState[2] = (this.ledMatrixState[2]>>1)+((this.TEXT_MASS[args.OTTO_TEXT[this.text_char]][this.text_long]>>5)&1)*128;
          this.ledMatrixState[1] = (this.ledMatrixState[1]>>1)+((this.TEXT_MASS[args.OTTO_TEXT[this.text_char]][this.text_long]>>6)&1)*128;
          this.ledMatrixState[0] = (this.ledMatrixState[0]>>1)+((this.TEXT_MASS[args.OTTO_TEXT[this.text_char]][this.text_long]>>7)&1)*128;//args.TEXT[this.text_char]
          this.runtime.OCA.all_led(this.ledMatrixState);
          if(this.TEXT_MASS[args.OTTO_TEXT[this.text_char]].length-1==this.text_long){//args.OTTO_TEXT[this.text_char]
            this.text_char++;
            this.text_long=0;
          }   // конец символа и перевод
          else {
            this.text_long++;
          }
          if(args.OTTO_TEXT.length!=this.text_char){
            this.text_timer=Date.now()+(args.TEXT_SPEED)*40;
            util.yield();
          }
          else {
            this.text_long=0;
            this.text_char=0;
          }
      }
      else {
            util.yield();
           }
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
      if(this.sound_flag==0)
        {

        this.sound_time = setTimeout(()=>{this.sound_flag=2;},args.NOTE_DURA * 250);
        this.sound_flag=1;
        this.runtime.OCA.play_sound(this.sounds[Number(args.NOTE_TYPE)],Number(args.NOTE_DURA));
        util.yield();
        }
        else if(this.sound_flag==1)
        {
        util.yield();
        }
        else {
        this.sound_flag=0;
        }
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
