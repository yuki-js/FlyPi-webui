const network = require("../js/network")

module.exports=require("./option.html")({
  data(){
    return {
      sensorEnabled:true,
      sensorIntv:0,
      pwmFreq:334,

      kp:1.3,
      ki:1.3,
      kd:1.3,
      xCal:0,
      yCal:0,
      zCal:0,
      yawScale:1,
      pitchScale:1,
      rollScale:1,
      throScale:1,
      motorCal:[],
      accelSamples:30
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
        this.throScale
      ];
      for(let i=0;i<network.motorLength;i++){
        floatToWrite.push(0)
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
    }
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

