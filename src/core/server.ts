import * as http from "http";
import * as path from "path";
import * as fs from "fs";
import { WebSocketServer,WebSocket } from "ws";
interface chatMessage{
    name:string,
    x:number,
    y:number,
}
const httpServer = http.createServer((req,res)=>{

})
const clients = new Set();
const wsServer = new WebSocketServer({server:httpServer})
let playquene: { [key: string]: chatMessage } = {}
wsServer.on("connection", (ws) => {
    console.log("连接成功");
    console.log(wsServer.clients.size);
    clients.add(ws)
    ws.on("message", (msg) => {
      console.log( msg.toString());
      if(msg.toString()!="Hello World!"){
        let data = JSON.parse(msg.toString())
        if(data.reg){
            playquene[data.reg] = {
                name:data.name,
                x:0,
                y:0
            } 
        }
        else if(data.del){
            delete playquene[data.del]
        }
        else if(data.name){
            playquene[data.name] = {
                name:data.name,
                x:data.x,
                y:data.y
            }
        }
      }
      const text = JSON.stringify(playquene)
        broadcast(text)
        // console.log(chatContent)
        // ws.send(text);
    });
    ws.on("close", () => {
        console.log("连接断开");

        clients.delete(ws)
      });
  });
  function broadcast(message:string){
    clients.forEach((client:any) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
  }
  function generateUniqueId() {
    return Date.now().toString();
  }
  httpServer.listen(4000,()=>{
    console.log("服务已开启")
  })