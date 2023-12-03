//Class for storing data of iot blocks. Used at runtime
class StateIOTBlock {
    constructor() {

        this._connection_status = false;
        this._connection_log = "";

        this._client = null;
    }

    get connectionLog() {
        return this._connection_log;
    }
    get connectionStatus() {
        return this._connection_status;
    }
    get client(){
        return this._client;
    }

    set connectionStatus(newValue) {
        this._connection_status = newValue;
    }
    set connectionLog(newValue) {
        this._connection_log = newValue;
    }
   
    set client(newValue){
        this._client = newValue;
    }
}

module.exports = StateIOTBlock;