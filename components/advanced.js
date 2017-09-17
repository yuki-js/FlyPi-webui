const network = require("../js/network")


const motorConfigSize=network.motorConfigSize;
const motorLength=network.motorLength

module.exports=require("./advanced.html")({
  data(){
    return {
      motors:[],
      stat:{}
    }
  },
  methods:{
    changeVal(motorIndex,e){
      this.motors[motorIndex].value=e.target.value
      network.reduceSendingMotVal(this.motors)

    },
    toggleStabilization(){
      
    },
    getMotors(){
      network.send([6])
      network.socket.on("message",(packet)=>{
        if(typeof(packet)=="string"){
          const pkt=JSON.parse(packet)
          if(pkt.msgBytes.length===40){
            //status message
            let buf = Buffer.from(pkt.msgBytes)

            const show= {
                type:"status",
                accX:buf.readFloatLE(0).toString().substr(0,6),
                accY:buf.readFloatLE(4).toString().substr(0,6),
                accZ:buf.readFloatLE(8).toString().substr(0,6),
                gyroX:buf.readFloatLE(12).toString().substr(0,6),
                gyroY:buf.readFloatLE(16).toString().substr(0,6),
                gyroZ:buf.readFloatLE(20).toString().substr(0,6),
                motors:[],
                yaw:buf.readInt8(32),
                pitch:buf.readInt8(33),
                roll:buf.readInt8(34),
                thro:buf.readUInt8(35),
                armed:buf.readUInt8(36),
              }
            for(let i = 0;i<=7;i++){
              const v= buf.readUInt8(i+24);
              show.motors[i] = v
              this.motors[i]&&(this.motors[i].value =v)
            }
            show.radX=-Math.atan2(show.accY,Math.sqrt(show.accX*show.accX+show.accZ*show.accZ))
            show.radY=-Math.atan2(show.accZ,Math.sqrt(show.accX*show.accX+show.accY*show.accY))
            this.stat=show
          }else if(pkt.msgBytes.length===motorConfigSize*motorLength){
            let data = Buffer.from(pkt.msgBytes)
            this.motors=[]
            for(let i=0;i<motorLength;i++){
              this.motors.push({
                pin:data.readUInt8(motorConfigSize*i,true),
                name:data.slice(motorConfigSize*i+1,motorConfigSize*i+17).toString().split("\0")[0],
                type:(data.readUInt8(motorConfigSize*i+17,true)|0).toString(2),
                value:0
              });
            }

          }
        }
        
      })
    }

  },
  mounted(){
    network.socket.on("open",()=>this.getMotors())
  }
})