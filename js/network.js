const io = require("engine.io-client")

exports.send=(byteArr)=>{
  console.log(byteArr)
  if(!exports.connected){
    throw new Error("not connected yet!")
  }
  
  exports.socket.send(JSON.stringify({
    msgBytes:byteArr
  }))
}
exports.transform={
  hex2arr(hex){//no space
    const arr =[];
    for(let i=0;i<hex.length;i+=2){
      const num=parseInt(hex[i]+hex[i+1],16);
      if(num<0||num>255){
        throw new Error("number is out of range")
      }
	    arr.push(num)
    }
    return arr
  },
  binStr2arr(bin){//string consisted of 0 and 1
    if(bin.length%8){
      throw new Error("binStr2arr can only parse octet bit string.")
    }
    const arr=[];
    for(let i =0;i<bin.length;i+=8){
      const num=parseInt(bin.substr(i,8),2)
      if(num<0||num>255){
        throw new Error("number is out of range")
      }
      arr.push(num)
    }
    return arr
  },
  ascii2arr(str){
    const arr=[]
    for(let i = 0;i<str.length;i++){
      const num=(str.charCodeAt(i))|0
      if(num<0||num>255){
        throw new Error("number is out of range")
      }
      arr.push(num)
    }
    return arr
  },
  arr2hex(arr,space=false){
    let str=""
    for(let i = 0;i<arr.length;i++){
      const num=arr[i]|0
      if(num<0||num>255){
        throw new Error("number is out of range")
      }
      str+=("0"+num.toString(16)).slice(-2)
      if(space){
        str+=" "
      }
    }
    return str
  },
  arr2ascii(arr){
    return String.fromCharCode.apply(String,arr);
  },
  removeSpace(str){
    return str.replace(/\s+/g, '')
  }
}

exports.events=new (require("eventemitter3"))()

exports.connect = ()=>new Promise((resolve,reject)=>{
  const sock=exports.socket = io()
  sock.on("open",()=>{
    exports.connected = true;
    resolve()
  })
  sock.on("error",()=>{
    if(!exports.connected){
      reject()
    }
    exports.connected=false;
  })

  //debug
  sock.on("message",(a)=>{
    console.log(a)
  })
  
})

exports.parse=(byteArr)=>{
  
}
exports.sendYPRT=(yaw,pitch,roll,thro)=>{

}
exports.motValTimer=null;
exports.lastMotVal=[]
exports.reduceSendingMotVal=motors=>{
  if(exports.motValTimer){
    exports.lastMotVal=motors;
  }else{
    exports.sendMotorValue(motors);


    
    exports.motValTimer=setTimeout(()=>{
      exports.motValTimer=null;
      if(exports.lastMotVal.length){
        exports.sendMotorValue(exports.lastMotVal)
        exports.lastMotVal=[];
      }
    },150)
  }
  
}
exports.sendMotorValue=(motors)=>{
  const toSend = [5];
  for(let i=0;i<exports.motorLength;i++){
    toSend.push(motors[i].value|0)
  }
  exports.send(toSend)
}



exports.motorConfigSize=19;
exports.motorLength = 8;
