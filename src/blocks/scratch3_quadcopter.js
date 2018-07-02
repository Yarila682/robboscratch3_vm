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
          this.delta= 0.1; //0.05
          this.speed= 1;

          this.yielded_time_start = Date.now(); //Счётчик задержки блока. При привышении yilded_max_time скипаем блок, чтобы избежать зависания системы.
          this.yielded_time_now   = Date.now();
          this.yielded_max_time = 1 * 60 * 1000;  //// TODO: сделать рассчёт через секунды требуемые на выполнение блока


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

        this.init_start_coordinates();

        this.x = this.x + Number(args.CENTIMETERS) / 100 * Math.cos((this.yaw+this.dir) * Math.PI / 180);
        this.y = this.y + Number(args.CENTIMETERS) / 100 * Math.sin((this.yaw+this.dir) * Math.PI / 180);

        this.yielded_time_start = Date.now();
        this.yielded_time_now = Date.now();

      this.runtime.QCA.move_to_coord(this.x,this.y,this.z,this.yaw);
      this.fack=1;
      util.yield();
      return;
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

        if ((this.yielded_time_now - this.yielded_time_start ) >= this.yielded_max_time){ //Нужно, чтобы избежать зависания блока.

          this.fack=2;
        //  this.yielded = 0;
        }

          this.runtime.QCA.move_to_coord(this.x,this.y,this.z,0);
          this.yielded_time_now = Date.now();
          util.yield();
          return;
        }
      }

      this.fack=0;
      this.runtime.QCA.move_with_speed(0,0,0,this.z);
    }

    /*OK*/
    copter_fly_time(args, util){
    if(this.fack==0)
    {
    let vx =  this.speed* Math.cos((this.yaw+this.dir) * Math.PI / 180);
    let vy =  this.speed* Math.sin((this.yaw+this.dir) * Math.PI / 180);
    this.runtime.QCA.move_with_speed(vx,vy,0,this.z);
    this.fack=1;
    let time_to_fly = Number(args.SECONDS)*1000;
    setTimeout(() => { this.fack = 2; }, time_to_fly);
    util.yield();
    return;
    }
    else if ( this.fack != 2)
    {
    util.yield();
    return;
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
      let vx =  Number(args.X_SPEED);
      let vy =  Number(args.Y_SPEED);
      this.z = this.runtime.QCA.get_coord("Z");

      this.runtime.QCA.move_with_speed(vx,vy,0,this.z);
      this.fack=1;
      let time_to_fly = Number(args.SECONDS*1000);
      setTimeout(() => { this.fack = 2; }, time_to_fly);
      util.yield();
      return;
      }
      else if ( this.fack != 2)
      {
      util.yield();
      return;
      }
      this.runtime.QCA.move_with_speed(0,0,0,this.z);
      this.fack=0;
    }


/*OK*/
    copter_change_x_by(args, util){
      if(this.fack==0)
      {



      this.init_start_coordinates();


      this.x = this.x + Number(args.DISTANCE_DELTA);




      this.yielded_time_start = Date.now();
      this.yielded_time_now = Date.now();

      this.runtime.QCA.move_to_coord(this.x,this.y,this.z,this.yaw);

      this.fack = 1;
      //this.yielded++;
      util.yield();
      return;
      }
      else if(this.fack != 2)
      {
        if ((this.yielded_time_now - this.yielded_time_start ) >= this.yielded_max_time){ //Нужно, чтобы избежать зависания блока.

          this.fack=2;
        //  this.yielded = 0;
        }

        this.nowx = this.runtime.QCA.get_coord("X");
        if(Math.abs(this.nowx-this.x)<this.delta);
        this.fack=2;

        this.runtime.QCA.move_to_coord(this.x,this.y,this.z,this.yaw);
      //  this.yielded++;
        this.yielded_time_now = Date.now();
        util.yield();
        return;
      }
      this.runtime.QCA.move_with_speed(0,0,0,this.z);
      this.fack=0;
    }

    copter_change_y_by(args, util){
      if(this.fack==0)
      {

      //this.yielded = 0;

      this.init_start_coordinates();


      this.y = this.y + Number(args.DISTANCE_DELTA);



      this.yielded_time_start = Date.now();
      this.yielded_time_now = Date.now();

      this.runtime.QCA.move_to_coord(this.x,this.y,this.z,this.yaw);
      this.fack = 1;
      //this.yielded++;
      util.yield();
      return;

      }
      else if(this.fack != 2)
      {

        if ((this.yielded_time_now - this.yielded_time_start ) >= this.yielded_max_time){ //Нужно, чтобы избежать зависания блока.

          this.fack=2;
        //  this.yielded = 0;
        }

        this.nowy = this.runtime.QCA.get_coord("Y");
        if(Math.abs(this.nowy-this.y)<this.delta)
        this.fack=2;

        this.runtime.QCA.move_to_coord(this.x,this.y,this.z,this.yaw);
      //  this.yielded++;
        this.yielded_time_now = Date.now();
        util.yield();
        return;
      }
      this.runtime.QCA.move_with_speed(0,0,0,this.z);
      this.fack=0;
    }

    copter_change_z_by(args, util){
      if(this.fack==0)
      {

    //  this.yielded = 0;

      this.init_start_coordinates();


      this.z = this.z + Number(args.DISTANCE_DELTA);

      console.log(`copter_change_z_by: ${this.z}`)
      this.runtime.QCA.move_to_coord(this.x,this.y,this.z,this.yaw);

    this.yielded_time_start = Date.now();
    this.yielded_time_now = Date.now();

  //    this.runtime.QCA.move_with_speed(0,0,this.yaw,this.z);
      this.fack = 1;
    //  this.yielded++;
      util.yield();
      return;
      }
      else if(this.fack != 2)
      {

        if ((this.yielded_time_now - this.yielded_time_start ) >= this.yielded_max_time){ //Нужно, чтобы избежать зависания блока.

          this.fack=2;
        //  this.yielded = 0;
        }

        this.runtime.QCA.move_to_coord(this.x,this.y,this.z,this.yaw);

        this.nowz = this.runtime.QCA.get_coord("Z");
        if(Math.abs(this.nowz-this.z)<this.delta)
        this.fack=2;
      //  this.yielded++;
        this.yielded_time_now = Date.now();
        util.yield();
        return;
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
      let vx = (Number(args.X_COORD)-this.x)/Number(args.SECONDS);
      let vy = (Number(args.Y_COORD)-this.y)/Number(args.SECONDS);
      let vz = (Number(args.Z_COORD)-this.z)/Number(args.SECONDS);
      //TODO
      //СДЕЛАТЬ ОГРАНИЧЕНИЯ НА ПАРАМЕТРЫ, ВЫЯСНИТЬ МАКС СКОРОСТЬ
      this.runtime.QCA.move_with_speed(vx,vy,this.z,this.yaw);
      this.fack=1;
      let time_to_fly = Number(args.SECONDS)*1000;
      setTimeout(() => { this.fack = 2; }, time_to_fly);
      util.yield();
      return;

      }
      else if ( this.fack != 2)
      {
      util.yield();
      return;
      }
      this.runtime.QCA.move_with_speed(0,0,0,this.z);
      this.fack=0;
    }

    copter_fly_to_coords(args, util){
        if(this.fack==0)
        {
      //    this.yielded = 0;

          this.x = Number(args.X_COORD);
          this.y = Number(args.Y_COORD);
          this.z = Number(args.Z_COORD);

          this.yielded_time_start = Date.now();
          this.yielded_time_now = Date.now();

        this.runtime.QCA.move_to_coord(this.x,this.y,this.z,0);
        this.fack=1;
      //  this.yielded++;
        util.yield();
        return;
        }
        else if(this.fack != 2)
        {
          if ((this.yielded_time_now - this.yielded_time_start ) >= this.yielded_max_time){ //Нужно, чтобы избежать зависания блока.

            this.fack=2;
          //  this.yielded = 0;
          }

          this.nowx = this.runtime.QCA.get_coord("X");
          this.nowy = this.runtime.QCA.get_coord("Y");
          this.nowz = this.runtime.QCA.get_coord("Z");

          if((Math.abs(this.nowx-this.x)<this.delta)&&(Math.abs(this.nowy-this.y)<this.delta)&&(Math.abs(this.nowz-this.z)<this.delta))
          this.fack=2;

          this.runtime.QCA.move_to_coord(this.x,this.y,this.z,0);
        //  this.yielded++;
          this.yielded_time_start = Date.now();
          util.yield();

          return;
        }
        this.runtime.QCA.move_with_speed(0,0,0,this.z);
        this.fack=0;
      }

    copter_rotate(args, util){
      {
          if(this.fack==0)
          {

        //  this.yielded = 0;

          this.init_start_coordinates();

          this.yaw += Number(args.DEGREES);



          this.yielded_time_start = Date.now();
          this.yielded_time_now = Date.now();

          this.runtime.QCA.move_to_coord(this.x,this.y,this.z, this.yaw);
          this.fack=1;
        //  this.yielded++;
          util.yield();
          return;
          }
          else if(this.fack != 2)
          {

            if ((this.yielded_time_now - this.yielded_time_start ) >= this.yielded_max_time){ //Нужно, чтобы избежать зависания блока.

              this.fack=2;
            //  this.yielded = 0;
            }


            this.runtime.QCA.move_to_coord(this.x,this.y,this.z,this.yaw);

            this.noww = Number(this.runtime.QCA.get_coord("W"));
            if(Math.abs(this.noww-this.yaw)<3)
            this.fack=2;
          //  this.yielded++;
            this.yielded_time_now = Date.now();
            util.yield();
            return;
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

    init_start_coordinates(){

      this.yaw = Number(this.runtime.QCA.get_coord("W"));
      this.x = Number(this.runtime.QCA.get_coord("X"));
      this.y = Number(this.runtime.QCA.get_coord("Y"));
      this.z = Number(this.runtime.QCA.get_coord("Z"));

    }

  }

    module.exports = Scratch3QuadcopterBlocks;
