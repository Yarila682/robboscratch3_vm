
const mqtt = require('mqtt');

var client;

class Scratch3IoTBlocks{
    constructor(runtime){
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.runtime = runtime;
        this.prefix="default_robbo_prefix/"
        this.bport = null;
        this.baddr = null;
        this.last_messages = {};
        this.options = {};
        this.delays = {};
        this.delays_for_publish = {};
        this.topics_enum = {air:'a', dis:'b', lux:'c',tem:'d', hum:'e',wind:'f',snd:'g',txt:'h'};
        this.data_sensors = {
            air: -1,
            distance: -1,
            lux: -1,
            temp: -1, 
            hum: -1
        }
        console.log(this.runtime.toString());
        try{
            console.log(this.runtime.ECA.toString());
        } catch {}
        // this.runtime.ECA.setWifi("Domru344", "89213021207");
    }
 

    /**
     * Retrieve the block primitives implemented by this package.
     * @return {object.<string, Function>} Mapping of opcode to Function.
     */
    getPrimitives(){
        return {
            iot_broker_init: this.iot_broker_init,
            iot_mess_to_topic: this.iot_mess_to_topic,
            iot_subscribe_to_topic: this.iot_subscribe_to_topic,
            iot_receive_message: this.iot_receive_message,
            iot_set_logpass: this.iot_set_logpass,
            iot_set_client_id: this.iot_set_client_id,
            iot_set_delay_for_topic: this.iot_set_delay_for_topic,
            iot_parse_data: this.iot_parse_data,
            iot_set_wifi: this.iot_set_wifi,
            iot_set_upper_treshold:this.iot_set_upper_treshold,
            iot_set_under_treshold:this.iot_set_under_treshold,
            iot_set_both_treshold:this.iot_set_both_treshold,
            //iot_event_less:this.iot_event_less,
            //iot_event_more:this.iot_event_more,
            iot_set_prefix:this.iot_set_prefix,
            iot_connection_status: this.iot_connection_status,
            iot_connection_log: this.iot_connection_log,
            iot_set_delay_for_publish: this.iot_set_delay_for_publish
        };
    }

    getHats () {
        return {
            iot_event_less: {
                restartExistingThreads: true
            },
            iot_event_more: {
                restartExistingThreads: true
            }
           
        };
    }

    iot_set_prefix(args){
        this.prefix=args.PREFIX;
        }

    iot_broker_init(args){
        this.baddr = args.BADDR;
        this.bport = args.BPORT;
        console.log("baddr = " + this.baddr + "; bport = " + this.bport);
        // client = mqtt.connect("mqtt://" + this.baddr + ":" + this.bport + "/");\


        this.options.port = args.BPORT;
        this.options.host = args.BADDR;
        this.options.hostname = args.BADDR;
        //this.options.protocol = 'wss';
        //this.options.protocol = 'tls';
        //this.options.protocol = 'mqtts';
        //this.options.defaultProtocol = 'tls';

        this.options.protocol = args.BPROTCOL;

        this.options.path = "/mqtt";
        
        console.log("Trying to connect with this options:\n" + JSON.stringify(this.options));

        this.runtime.IOT.client = mqtt.connect(this.options);

        if (this.runtime.IOT.client !== 'undefined'){
            this.runtime.IOT.client.on( "error", (error) => {


                console.error(`Connect error: ${error}`);
            } )
        }
        return;
        //return {"baddr": this.baddr, "bport": this.bport};
    }
    iot_mess_to_topic(args){
        if(this.runtime.IOT.client == undefined){
            console.error("this.runtime.IOT.client is undefined!!!");
        }else{
            let topic = this.prefix+args.TNAME;

            let msg = args.MESSAGE.toString();

            console.log(msg);
            console.log(typeof(msg));


            console.log("mess_to_topic.args" + args + "; <baddr, bport> = <" + topic + ", " + msg + ">");
            this.runtime.IOT.client.publish(topic, msg);
        }
        return;
    }
    iot_subscribe_to_topic(args){
        if(this.runtime.IOT.client == undefined){
            console.error("this.runtime.IOT.client is undefined!!!");
        }else{
            console.log("subscribe_to_topic.args" + args);
            let topic = this.prefix+args.TNAME;
            this.runtime.IOT.client.subscribe(topic, function(err){
                if(err) console.error(err);
                else console.log("Subscribed to " + topic);
            });
            this.runtime.IOT.client.on('message', (topic, message)=>{
                console.log("From topic " + topic + ": " + message.toString());
                // console.log(typeof(topic));
                // console.log(typeof(message));
                this.last_messages[topic] = message.toString();
                console.log("this.last_messages." + topic + " = " + this.last_messages[topic]);

                if (typeof(this.last_messages[this.prefix+args.TNAME]) !== 'undefined'){
       
                    if(this.last_messages[this.prefix+args.TNAME].startsWith('-')) {

                        this.runtime.startHats('iot_event_less',{
                            TNAME: args.TNAME
                        });
                    }
                 } 

                 if (typeof(this.last_messages[this.prefix+args.TNAME]) !== 'undefined'){
       
                    if(this.last_messages[this.prefix+args.TNAME].startsWith('+')) {

                        this.runtime.startHats('iot_event_more',{
                            TNAME: args.TNAME
                        });
                    }
                 } 

               
                   
            });
        }
        return;
    }
    iot_receive_message(args){
        let topic = this.prefix+args.TNAME;
        console.log(this.last_messages[topic]);
        return this.last_messages[topic]==undefined?"":this.last_messages[topic];
    }
    iot_set_logpass(args){
        this.options.username = args.UNAME;
        this.options.password = args.PASS;
        console.log(args.UNAME + "; " + args.PASS);
    }
    iot_set_client_id(args){
        this.options.clientId = args.ID;
        console.log(args.ID);
    }
    // iot_set_delay_for_topic(args){
    //     this.delays[args.TNAME] = args.DELAY;
    //     console.log(this.delays[args.TNAME]);
    //     return;
    // }
    iot_trigger_on_topic(args){
        return false;
    }
    iot_parse_data(args){
        let msg = this.last_messages[args.TNAME];
        if(msg == undefined || msg.split("#").length!=11) return;
        console.log("msg: " + msg);
        let splited = msg.toString().split("#").reduce((i, a) => {
                this.data_sensors[Object.keys(this.data_sensors)[i]] = Number(a);
                return i+1;
            }, 0);
        console.log("Parsed msg:" + this.data_sensors.toString());
    }
    iot_set_wifi(args){
        if(this.runtime.ECA != undefined){
            this.runtime.ECA.setWifi(args.SSID, args.PASS);
            console.log("Setting SSID:" + args.SSID + "; PASS: " + args.PASS);
        } else {
            console.log(this.runtime.toString());
            console.error("Esp disconnected");
        }
    }

    iot_set_delay_for_topic(args){
        this.delays[args.TNAME] = args.DELAY;
        let lim =+args.DELAY+1;
        let mess = "" + lim +'b'+this.topics_enum[args.TNAME];
        console.log(mess);
        this.runtime.IOT.client.publish(this.prefix+"opt", mess);
        return;
    }
    iot_set_under_treshold(args){
      console.log(args.TNAME);
      let lim=+args.TRESH
      if(lim>256*256-1)
      lim=256*256-1
      else
      lim=lim<<16
      let mess = "" + lim +'c'+this.topics_enum[args.TNAME];
      console.log(mess);
      client.publish(this.prefix+"opt", mess);
      return;
    }
    iot_set_upper_treshold(args){
      console.log(args.TNAME);
      let lim=+args.TRESH
      if(lim>256*256-1)
      lim=256*256-1
      let mess = "" + lim +'c'+this.topics_enum[args.TNAME];
      console.log(mess);
      this.runtime.IOT.client.publish(this.prefix+"opt", mess);
      return;
    }
    iot_set_both_treshold(args){
      console.log(args.TNAME);
      let lim=+args.TRESH
      if(lim>256*256-1)
      lim=256*256-1
      else
      lim=lim<<16
      let lim2=+args.TRESH2
      if(lim2>256*256-1)
      lim2=256*256-1
      console.log(lim);
      console.log(lim<<16);
      console.log(lim2);
      lim=parseInt(lim) + parseInt(lim2);
      let mess = "" + (lim)+'c'+this.topics_enum[args.TNAME];
      console.log(mess);
      this.runtime.IOT.client.publish(this.prefix+"opt", mess);
      return;
    }
    //TODO:DELETE - or +
    iot_event_less(args){
     if (typeof(this.last_messages[this.prefix+args.TNAME]) !== 'undefined'){
       
        if(this.last_messages[this.prefix+args.TNAME].startsWith('-')) return true;
     } 
      
      return false; 
    }
    iot_event_more(args){
      
     if (typeof(this.last_messages[this.prefix+args.TNAME]) !== 'undefined'){
            
            if ( this.last_messages[this.prefix+args.TNAME].startsWith('+')) return true;     
        }

    
     return false; 
    }

    iot_connection_status(args) {
        if (this.runtime.IOT.client === undefined || this.runtime.IOT.client === null) {
            return this.runtime.IOT.connectionStatus = false;
        }
        return this.runtime.IOT.connectionStatus = this.runtime.IOT.client.connected;
    }

    iot_connection_log(args) {
        if (this.runtime.IOT.client === undefined || this.runtime.IOT.client === null) {
            return this.runtime.IOT.connectionLog = "Client is undefined!";
        }
        if (this.runtime.IOT.client.connected) {
            return this.runtime.IOT.connectionLog = "Client is connected!";
        }
        return this.runtime.IOT.connectionLog;
    }

    iot_set_delay_for_publish(args) {
        this.delays_for_publish[this.prefix + args.TNAME] = args.DELAY;
        return;
    }
}

module.exports = Scratch3IoTBlocks;