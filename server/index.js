const net = require("net")
const engine=require("engine.io")
const finalhandler = require('finalhandler')
const http = require("http")

var serve = require('serve-static')('../', {'index': ['index.html', 'index.htm']})

let isConnectingWithFly=false

const staticServer=http.createServer((req,res)=>{
  serve(req,res,finalhandler(req,res))
})
staticServer.listen(4000,()=>{
  console.info("Listening on port 4000.waiting for connection...")
})
const cliSv=engine.attach(staticServer)
const flySock=null
cliSv.on("connection",(cliSock)=>{
  console.info("Accepted engine.io connection")
  if(isConnectingWithFly){
    flySock = net.connect(33400,"flypi.local", () => {
      console.info("Connected to Fly Pi server");
      isConnectingWithFly=true
    });
  }
  flySock.on("error",()=>{
    isConnectingWithFly=false
    cliSock.send(JSON.stringify({
      error:true
    }))
  })

  flySock.on("data",data=>{
    cliSock.send(JSON.stringify({
      msgBytes:[...data]
    }))
  })
  flySock.on("close",()=>{
    isConnectingWithFly=false
    cliSock.send(JSON.stringify({
      close:true
    }))
    cliSock.close()
  })
  cliSock.on("close",()=>{
    isConnectingWithFly=false
    flySock.end()
  })
  cliSock.on("message",(data)=>{
    if(data instanceof Buffer){

    }else{
      data = JSON.parse(data)
      if(data.msgBytes&&data.msgBytes.length){
        const buf=Buffer.from(data.msgBytes)
        flySock.write(buf)
      }
    }
  })
 

})

