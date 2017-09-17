const network = require("../js/network")
const Buffer = require("buffer").Buffer

const motorConfigSize=network.motorConfigSize;
const motorLength=network.motorLength

module.exports=require("./expert.html")({
  data(){
    return {
      sendFormat:"hex",
      sendData:"",
      receiveFormat:"auto",
      packets:[]
    }
  },
  methods:{
    send(){
      let arr = null;
      let sendData= this.sendData
      switch(this.sendFormat){
        case "hex":
          arr=network.transform.hex2arr(network.transform.removeSpace(sendData))
          break;
        case "bin":
          arr=network.transform.binStr2arr(network.transform.removeSpace(sendData))
          break;
        case "ascii":
          arr=network.transform.ascii2arr(sendData)
          break;
        default:
          return ;
      }
      
      network.send(arr)
      
    },
    clearLog(){
      this.packets=[];
    },
    subscribe(){
      network.socket.on("message",(packet)=>{
        if(typeof(packet)=="string"){
          const pkt=JSON.parse(packet)
          if(this.receiveFormat=="auto"){
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
                show.motors[i] = buf.readUInt8(i+24);
              }
              show.radX=-Math.atan2(show.accY,Math.sqrt(show.accX*show.accX+show.accZ*show.accZ))
              show.radY=-Math.atan2(show.accZ,Math.sqrt(show.accX*show.accX+show.accY*show.accY))
              this.packets.unshift(show)
            }else if(pkt.msgBytes.length===motorConfigSize*motorLength){
              const firstData = [];
              let data = Buffer.from(pkt.msgBytes)

              for(let i=0;i<motorLength;i++){
                firstData.push({
                  pin:data.readUInt8(motorConfigSize*i,true),
                  name:data.slice(motorConfigSize*i+1,motorConfigSize*i+17).toString().split("\0")[0],
                  type:(data.readUInt8(motorConfigSize*i+17,true)|0).toString(2)
                });
              }
              this.packets.unshift({motorConfig:firstData})
              console.log(this.packets)
            }else{
              this.packets.unshift({raw:network.transform.arr2hex(pkt.msgBytes,true)})
              
            }
          }else{
            switch(this.receiveFormat){
              case "ascii":
                this.packets.unshift({ascii:network.transform.arr2ascii(pkt.msgBytes)})
                break
              default:
                this.packets.unshift({raw:network.transform.arr2hex(pkt.msgBytes,true)})
            }
          }
          if(this.packets.length>30){
            this.packets.pop()
          }
        }
      })
      
    }
  },
  mounted(){
    this.subscribe()

  }
})










