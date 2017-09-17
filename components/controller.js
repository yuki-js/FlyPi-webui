const network = require("../js/network")

module.exports=require("./controller.html")({
  data(){
    return {
      pitch:0,
      yaw:0,
      roll:0,
      thro:0,
      armed:false
    }
  },
  methods:{
    control(axis,diff){
      this[axis]+=diff;
      if(axis=="thro"){
        if(this.thro>255){
          this.thro=255;
        }
        if(this.thro<0){
          this.thro=0;
        }
      }else{
        if(this[axis]>127){
          this[axis]=127
        }
        if(this[axis]<-128){
          this[axis]=-128;
        }
      }
      network.send([1,this.yaw,this.pitch,this.roll,this.thro])
    },
    arm(){
      this.arm=true;
      network.send([7])
    },
    disarm(){
      this.arm=false;
      network.send([8])
    }
  }
})
