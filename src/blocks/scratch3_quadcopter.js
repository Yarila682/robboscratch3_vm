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
          this.x = this.runtime.QCA.get_coord("X");// координата по х
          this.nowx=0;
          this.y =this.runtime.QCA.get_coord("Y");//y
          this.nowy=0;
          this.z = this.runtime.QCA.get_coord("Z");//z
          this.nowz=0;
          this.defz= 0.3;//ВЫСОТА ВЗЛЁТА
          this.yaw =this.runtime.QCA.get_coord("W"); //угол относительно начального положения
          this.noww=0;
          this.direction = 0;//отвечает за движение при установленной команде copter_set_direction
          this.fack = 0;//отвечает за задержку и инициализацию при задержке
          this.delta= 0.05;
          this.speed= 1;
            }

    /**
     * Retrieve the block primitives implemented by this package.
     * @return {object.<string, Function>} Mapping of opcode to Function.
     */
    getPrimitives () {
        return {

            copter_fly_up: this.copter_fly_up,
            copter_land:this.copter_land,
            copter_stop:this.copter_stop,
            copter_status:this.copter_status,
            copter_fly_distance:this.copter_fly_distance,
            copter_fly_time:this.copter_fly_time,
            copter_fly_for_time_with_speed:this.copter_fly_for_time_with_speed,
            copter_change_x_by:this.copter_change_x_by,
            copter_change_y_by:this.copter_change_y_by,
            copter_change_z_by:this.copter_change_z_by,
            copter_x_coord:this.copter_x_coord,
            copter_y_coord:this.copter_y_coord,
            copter_z_coord:this.copter_z_coord,
            copter_fly_for_seconds_to_coords:this.copter_fly_for_seconds_to_coords,
            copter_fly_to_coords:this.copter_fly_to_coords,
            copter_rotate:this.copter_rotate,
            copter_set_direction:this.copter_set_direction,
            copter_direction:this.copter_direction
        };
    }

    getMonitored () {
        return {

        };
    }

    /*OK*/
    copter_fly_up(args,util){
      // if(this.fack==0)
      //   {
      //     this.runtime.QCA.fly_up(this.defz);
      //     this.nowz= this.runtime.QCA.get_coord("Z");
      //     this.fack = 1;
      //     util.yield();
      //   }
      //   else if(this.fack!= 2) {
      //     this.nowz= this.runtime.QCA.get_coord("Z");
      //     if(Math.abs(this.nowz-this.defz)<this.delta)
      //     this.fack=2;
      //     util.yield();
      //   }
      // this.z=this.defz;
      // this.fack=0;

      this.runtime.QCA.fly_up(this.defz);

    }
    /*OK*/
    copter_land(){

            this.runtime.QCA.copter_land();

    }
    /*BAD*/
    copter_stop(){

    }

    /*BAD*/
    copter_status(args, util){

    }
    //vx vy yaw heigh
    //x y height ya

    /*OK*/
    copter_fly_distance(args, util){
      if(this.fack==0)
      {
        this.x = this.x + args.CENTIMETERS * Math.cos((this.yaw+this.dir) * Math.PI / 180);
        this.y = this.y + args.CENTIMETERS * Math.sin((this.yaw+this.dir) * Math.PI / 180);
      this.runtime.QCA.move_to_coord(this.x,this.y,this.z,0);
      this.fack=1;
      util.yield();
      }

      else if(this.fack == 1)
      {
      this.nowx= this.runtime.QCA.get_coord("X");
      this.nowy=this.runtime.QCA.get_coord("Y");
      if((Math.abs(this.nowx-this.x)<this.delta) && (Math.abs(this.nowy-this.y)<this.delta))
        {
          this.fack=2;
        }
      else {
          util.yield();
        }
      }

      this.fack=0;
    }

    /*OK*/
    copter_fly_time(args, util){
    if(this.fack==0)
    {
    let vx =  this.speed* Math.cos((this.yaw+this.dir) * Math.PI / 180);
    let vy =  this.speed* Math.sin((this.yaw+this.dir) * Math.PI / 180);
    this.runtime.QCA.move_with_speed(vx,vy,0,this.z);
    this.fack=1;
    let time_to_fly = args.SECONDS*1000;
    setTimeout(() => { this.fack = 2; }, time_to_fly);
    util.yield();
    }
    else if ( this.fack != 2)
    {
    util.yield();
    }
    this.x=this.runtime.QCA.get_coord("X");
    this.y=this.runtime.QCA.get_coord("Y");
    this.runtime.QCA.move_with_speed(0,0,0,this.z);
    this.fack=0;
    }


    /*OK TODO ОГРАНИЧИТЬ СКОРОСТЬ*/
    copter_fly_for_time_with_speed(args, util){
      if(this.fack==0)
      {
      let vx =  args.X_SPEED;
      let vy =  args.Y_SPEED;
      this.runtime.QCA.move_with_speed(vx,vy,0,this.z);
      this.fack=1;
      let time_to_fly = args.SECONDS*1000;
      setTimeout(function() { this.fack = 2; }, time_to_fly);
      util.yield();
      }
      else if ( this.fack != 2)
      {
      util.yield();
      }
      this.runtime.QCA.move_with_speed(0,0,0,this.z);
      this.fack=0;
    }


/*OK*/
    copter_change_x_by(args, util){
      if(this.fack==0)
      {
      this.x = this.x + args.DISTANCE_DELTA;
      this.runtime.QCA.move_to_coord(this.x,this.y,this.z,0);
      this.fack = 1;
      util.yield();
      }
      else if(this.fack != 2)
      {
        this.nowx = this.runtime.QCA.get_coord("X");
        if(Math.abs(this.nowx-this.x)<this.delta);
        this.fack=2;
        util.yield();
      }
      this.runtime.QCA.move_with_speed(0,0,0,this.z);
      this.fack=0;
    }

    copter_change_y_by(args, util){
      if(this.fack==0)
      {
      this.y = this.y + args.DISTANCE_DELTA;
      this.runtime.QCA.move_to_coord(this.x,this.y,this.z,0);
      this.fack = 1;
      util.yield();

      }
      else if(this.fack != 2)
      {
        this.nowy = this.runtime.QCA.get_coord("Y");
        if(Math.abs(this.nowy-this.y)<this.delta)
        this.fack=2;
        util.yield();
      }
      this.runtime.QCA.move_with_speed(0,0,0,this.z);
      this.fack=0;
    }

    copter_change_z_by(args, util){
      if(this.fack==0)
      {
      this.z = this.z + args.DISTANCE_DELTA;
      this.runtime.QCA.move_to_coord(this.x,this.y,this.z,0);
      this.fack = 1;
      util.yield();
      }
      else if(this.fack != 2)
      {
        this.nowz = this.runtime.QCA.get_coord("X");
        if(Math.abs(this.nowz-this.z)<this.delta)
        this.fack=2;
        util.yield();
      }
      this.runtime.QCA.move_with_speed(0,0,0,this.z);
      this.fack=0;
    }

    copter_x_coord(args, util){
      return this.runtime.QCA.get_coord("X");
    }

    copter_y_coord(args, util){
     return this.runtime.QCA.get_coord("Y");
    }

    copter_z_coord(args, util){
     return this.runtime.QCA.get_coord("Z");
    }

    copter_fly_for_seconds_to_coords(args, util){

      if(this.fack==0)
      {
      let vx = (args.X_COORD-this.x)/args.SECONDS;
      let vy = (args.Y_COORD-this.y)/args.SECONDS;
      let vz = (args.Z_COORD-this.z)/args.SECONDS;
      //TODO
      //СДЕЛАТЬ ОГРАНИЧЕНИЯ НА ПАРАМЕТРЫ, ВЫЯСНИТЬ МАКС СКОРОСТЬ
      this.runtime.QCA.move_with_speed(vx,vy,vz,this.yaw);
      this.fack=1;
      let time_to_fly = args.SECONDS*1000;
      setTimeout(function() { this.fack = 2; }, time_to_fly);
      util.yield();
      }
      else if ( this.fack != 2)
      {
      util.yield();
      }
      this.runtime.QCA.move_with_speed(0,0,0,this.z);
      this.fack=0;
    }

    copter_fly_to_coords(args, util){
        if(this.fack==0)
        {
          this.x = args.X_COORD;
          this.y = args.Y_COORD;
          this.z = args.Z_COORD;
        this.runtime.QCA.move_to_coord(this.x,this.y,this.z,0);
        this.fack=1;
        util.yield();
        }
        else if(this.fack != 2)
        {
          this.nowx = this.runtime.QCA.get_coord("X");
          if((Math.abs(this.nowx-this.x)<this.delta)&&(Math.abs(this.nowy-this.y)<this.delta)&&(Math.abs(this.nowz-this.z)<this.delta))
          this.fack=2;
          util.yield();
        }
        this.runtime.QCA.move_with_speed(0,0,0,this.z);
        this.fack=0;
      }

    copter_rotate(args, util){
      {
          if(this.fack==0)
          {
          this.yaw += args.DEGREES;
          this.runtime.QCA.move_to_coord(this.x,this.y,this.z,args.DEGREES);
          this.fack=1;
          util.yield();
          }
          else if(this.fack != 2)
          {
            this.noww = this.runtime.QCA.get_coord("W");
            if(Math.abs(this.noww-this.yaw)<this.delta)
            this.fack=2;
            util.yield();
          }
          this.runtime.QCA.move_with_speed(0,0,0,this.z);
          this.fack=0;
        }
    }
    copter_set_direction(args, util){
      switch (args.COPTER_DIRECTIONS) {
        case 'direction_forward':
          this.dir = 0;
        break;
        case 'direction_right':
          this.dir = 90;
        break;
        case 'direction_backward':
          this.dir = 180;
        break;
        case 'direction_left':
          this.dir = 270;
        break;
      }
    }

    copter_direction(args, util){
    return this.runtime.QCA.get_coord("W");
    }
  }

    module.exports = Scratch3QuadcopterBlocks;
