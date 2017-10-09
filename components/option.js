const network = require("../js/network")
const motorConfigSize=network.motorConfigSize;
const motorLength=network.motorLength

module.exports=require("./option.html")({
  data(){
    return {
      sensorEnabled:true,
      sensorIntv:50,
      pwmFreq:1000,

      kp:10,
      ki:2,
      kd:5,
      xCal:0,
      yCal:0,
      zCal:0,
      yawScale:1,
      pitchScale:1,
      rollScale:1,
      throScale:1,
      motorCal:[],
      xGyroCal:0,
      yGyroCal:0,
      zGyroCal:0,

      motors:[]
    }
  },
  methods:{
    sendOpt(){
      if(this.sensorIntv>255||this.sensorIntv<0){
        this.sensorIntv=0
      }
      let pwmFreqHigh=(this.pwmFreq|0)>>8
      let pwmFreqLow=(this.pwmFreq|0)&0b11111111
      network.send([3,this.sensorEnabled|0,this.sensorIntv|0,pwmFreqLow,pwmFreqHigh])
    },
    sendParam(){
      const buf = Buffer.allocUnsafe(77)
      buf.writeUInt8(4,0)

      const floatToWrite = [
        this.kp,
        this.ki,
        this.kd,
        this.xCal,
        this.yCal,
        this.zCal,
        this.yawScale,
        this.pitchScale,
        this.rollScale,
        this.throScale,
        this.xGyroCal,
        this.yGyroCal,
        this.zGyroCal,
      ];
      for(let i=0;i<motorLength;i++){
        floatToWrite.push(this.motors[i].calib)
      }
      let cur=0;
      while(cur<floatToWrite.length){
        buf.writeFloatLE(floatToWrite[cur],cur*4+1)
        cur++
      }
      buf.writeUInt8(this.accelSamples|0,cur*4+1)

      const intArrToSend = [];
      for(let v of buf.values()){
        intArrToSend.push(v)
      }
      network.send(intArrToSend)
    },
    getMotors(){
      network.send([6])
      network.socket.on("message",(packet)=>{
        if(typeof(packet)=="string"){
          const pkt=JSON.parse(packet)
          if(pkt.msgBytes.length===motorConfigSize*motorLength){
            let data = Buffer.from(pkt.msgBytes)
            this.motors=[]
            for(let i=0;i<motorLength;i++){
              this.motors.push({
                pin:data.readUInt8(motorConfigSize*i,true),
                name:data.slice(motorConfigSize*i+1,motorConfigSize*i+17).toString().split("\0")[0],
                type:(data.readUInt8(motorConfigSize*i+17,true)|0).toString(2),
                calib:0
              });
            }

          }
        }
        
      })
    },
  },
  mounted(){

  },
  watch:{
    sensorIntv(){
      if(this.sensorIntv>255||this.sensorIntv<0){
        this.sensorIntv=0
      }
    }
  }
})

