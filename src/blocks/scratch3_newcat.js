const Cast = require('../util/cast');
const MathUtil = require('../util/math-util');
const Timer = require('../util/timer');


class Scratch3RobotBlocks {
    constructor (runtime) {
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
         this.SensorsData=[];
         this.runtime = runtime;
         this.timer=0;
         this.first_a=1;
         this.first_d=1;
         this.first_c=0;
          this.sounds=[
33,35,37,39,41,44,46,49,52,55,58,62,
65, 69, 73, 78, 82, 87, 93, 98, 104, 110, 117, 123,
131, 139, 147, 156, 165, 175, 185, 196, 208, 220, 233, 247,
262, 277, 294, 311, 330, 349, 370, 392, 415, 440, 466, 494,
523, 554, 587, 622, 659, 698, 740, 784, 831, 880, 932, 988,
1047, 1109, 1175, 1245, 1319, 1397, 1480, 1568, 1661, 1760, 1865, 1976,
2093, 2217, 2349, 2489, 2637, 2794, 2960, 3136, 3322, 3520, 3729, 3951];

            this.sound_flag=0;

            this.sound_time=Date.now();

    }

    /**
     * Retrieve the block primitives implemented by this package.
     * @return {object.<string, Function>} Mapping of opcode to Function.
     */
    getPrimitives () {
        return {
            newcat_set_ana:this.newcat_set_ana,
            newcat_set_dig:this.newcat_set_dig,
            newcat_read_ana:this.newcat_read_ana,
            newcat_read_dig:this.newcat_read_dig,
            newcat_servo:this.newcat_servo,
            newcat_play_sound:this.newcat_play_sound,
            newcat_go_dig:this.newcat_go_dig,
            newcat_go_anal:this.newcat_go_anal,
            newcat_go_sonic:this.newcat_go_sonic,
            newcat_set_hum:this.newcat_set_hum,
            newcat_set_pult:this.newcat_set_pult,
            newcat_set_text:this.newcat_set_text,
            newcat_init_lcd:this.newcat_init_lcd,
            newcat_set_kursor:this.newcat_set_kursor,
            newcat_set_shag:this.newcat_set_shag,
            newcat_shag_init:this.newcat_shag_init
        };
    }

     check_value_out_of_range(value,low,high){

        return (value > high)?high:((value < low)?low:value);

    }

    check_0_and_255(value)
    {
            return (value < 0)?0:(value > 255)?255:value;

    }
    newcat_set_shag(args,util)
    {
    if(this.first_c==0)
    {
    let time = Number(args.SPEED);
    if(time>24)time=25;
    setTimeout(()=>{this.first_c=2;},(25-time)*Number(args.SHAG));
    this.first_c=1;
    this.runtime.ACA.set_shag(Number(args.SPEED), Number(args.SHAG));
    util.yield();
    }
    else if(this.first_c==1)
    {
    util.yield();
    }
    else {
    this.first_c=0;
    }
    }
    newcat_shag_init(args,util)
    {
    this.runtime.ACA.init_shag(Number(args.PIN1),Number(args.PIN2),Number(args.PIN3),Number(args.PIN4),Number(args.SHAG_TYPE));
    }
    newcat_set_ana(args,util)
    {
    this.runtime.ACA.set_anal(Number(args.PWM_PINS), this.check_0_and_255(Number(args.NUM)));
    }
    newcat_set_dig(args,util)
    {
    this.runtime.ACA.set_dick(Number(args.PIN),Number(args.HIGH_LOW));
    }
    newcat_go_dig(args,util)
    {
    this.runtime.ACA.get_dick(Number(args.PIN));
    }
    newcat_go_anal(args,util)
    {
    this.runtime.ACA.get_anal(Number(args.PIN_ANAL));
    }
    newcat_read_ana(args,util)// TODO MB SHIT WITH THIS FILTER
    {
        return(this.runtime.ACA.get_pin(args.PIN));
    }
    newcat_read_dig(args,util)// TODO MB SHIT WITH THIS FILTER
    {
        return(this.runtime.ACA.get_pin(args.PIN));
    }
    newcat_go_sonic(args,util)
    {
    this.runtime.ACA.set_sonic(Number(args.SOSONIC),Number(args.PIN2));
    }

    newcat_servo(args,util)
    {
   // this.runtime.ACA.servo(Number(args.PIN),Number(args.ANGLE));
      let angle = Math.round(Number(args.ANGLE));
      this.runtime.ACA.servo(Number(args.PIN),this.check_value_out_of_range(angle,-180,180));
    }
    newcat_play_sound(args,util)
    {

        if(this.sound_flag==0)
        {

        let note_type =  Math.round(Number(args.NOTE_TYPE));

        this.sound_time = setTimeout(()=>{this.sound_flag=2;},args.NOTE_DURA * 250);
        this.sound_flag=1;
        this.runtime.ACA.play_sound(this.sounds[this.check_value_out_of_range(note_type,0,83)],Number(args.NOTE_DURA),Number(args.PIN));
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
    newcat_set_hum(args,util)
    {
      this.runtime.ACA.hum(Number(args.NUM),Number(args.NUM2));
    }
    newcat_set_pult(args,util)
    {
        this.runtime.ACA.pult(Number(args.NUM));
    }
    newcat_set_text(args,util)
    {
      this.runtime.ACA.set_text(args.MESSAGE);
    }
    newcat_set_kursor(args,util)
    {
      this.runtime.ACA.curse(Number(args.NUM),Number(args.STOLB));
    }
    newcat_init_lcd(args,util)
    {
      this.runtime.ACA.init_lcd();
    }
    //*/
    }
    module.exports = Scratch3RobotBlocks;
