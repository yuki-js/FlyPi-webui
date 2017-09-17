const Vue=require("vue/dist/vue");
require("../scss/normalize.css")
require("../scss/style.scss")

const network = require("./network")

const vm = exports.vm=new Vue({
  el:"#app",
  data:{
    tabName:"controller"
  },
  methods:{
    changeTab(tabComponentName){
      this.tabName=tabComponentName
      
    }
  },
  created(){
    network.connect().then(()=>{
      network.socket.on("close",()=>{
        alert("Socket connection was disconnected.")
      })
      network.socket.on("message",(m)=>{
        if(m.error){
          alert("an error occured")
        }
      })
    })
  },
  components:{
    controller:require("../components/controller.js"),
    advanced:require("../components/advanced.js"),
    options:require("../components/option.js"),
    expert:require("../components/expert.js")
  }

});
