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
            newcat_set_kursor:this.newcat_set_kursor
        };
    }

    newcat_set_ana(args,util)
    {
    this.runtime.ACA.set_anal(Number(args.PWM_PINS),Number(args.NUM));
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
    this.runtime.ACA.servo(Number(args.PIN),Number(args.ANGLE));
    }
    newcat_play_sound(args,util)
    {

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
