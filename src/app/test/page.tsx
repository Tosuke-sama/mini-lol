"use client";
import { useEffect,useState,useRef, use } from "react";
import {chatMessage} from "../../type/interface"
import yasuo from './yasuo.png'
import * as PIXI from 'pixi.js';
import { setInterval } from "timers";
export default function Test() {
    let [isConnect,setIsConnect] = useState(false)
    let [msg,setMsg] = useState("")
    let [playquene,setPlayquene] = useState<{[key: string]: chatMessage}>({})
    let renderNode = new Map()
    const texture = PIXI.Texture.from('/yasuo.png');
    const app = new PIXI.Application({ 
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: 0x666666,
        resolution: window.devicePixelRatio || 1,
     });
     let moveX = 0;
    let moveY = 0;
    const ws = new WebSocket("ws://192.168.124.126:4000")
    useEffect(()=>{
        ws.onerror = () => {
            console.error("ws connecting failed!!!");
          };
          ws.onclose = () => {  
            setIsConnect(false)
            console.log("ws closed!!!");
            ws.send(JSON.stringify({del:msg}));
          }
        ws.onopen = () => {
            setIsConnect(true)
            console.log("ws connected!!!");
          };
        ws.addEventListener( "message", (data) => {
            console.log("服务器消息",data)
            setPlayquene(JSON.parse(data.data))
        })
        
      
            
    },[])
    let i = 0
    useEffect(()=>{
        for (let key in playquene){
            console.log(playquene)
            console.log(key)
            if(key === msg) continue;
            let player = renderNode.get(key)
            console.log(player)
            if(player){
                app.ticker.add(() => {
                    if(Math.abs(player.x - playquene[key].x)>10)
                    player.x += moveX;
                    if(Math.abs(player.y - playquene[key].y) >10)
                    player.y += moveY;
                  });
            }else{
                console.log(i++)
                let newPlayer = new PIXI.Sprite(texture);
                renderNode.set(key,newPlayer)
                newPlayer.anchor.set(0.5);
                newPlayer.scale.set(0.1);
                newPlayer.x = playquene[key].x;
                newPlayer.y = playquene[key].y;
                console.log(newPlayer)
                app.stage.addChild(newPlayer);
                app.renderer.render(app.stage);
            }            
        }
        
        
    },[playquene])
    
    const handleMsg = () => {
        if(isConnect){
            ws.send(JSON.stringify({reg:msg}));
            console.log("发送成功")
            render()
        }
    }
    const handleChange = (e:any) => {
        setMsg(e.target.value)
        
    }
    function generateUniqueId() {
        return Date.now().toString();
      }
      function render(){
        const sprite = new PIXI.Sprite(texture);
        sprite.anchor.set(0.5);
        sprite.scale.set(0.1);
        sprite.x = app.screen.width / 2;
        sprite.y = app.screen.height / 2;
        let targetX = sprite.x ;
        let targetY = sprite.y;
       
         app.view.addEventListener('click', (event) => {
           // 处理点击事件的代码
           console.log('Global Clicked!', event.x, event.y);
           sprite.x > event.x ? moveX = -1 : moveX = 1;
           sprite.y > event.y ? moveY = -1 : moveY = 1;
           targetX = event.x;
           targetY = event.y;
           let message ={
               name:msg,
               x:event.x,
               y:event.y
           }
           ws.send(JSON.stringify(message));
         });
         app.ticker.add(() => {
           if(Math.abs(sprite.x - targetX)>10)
           sprite.x += moveX;
           if(Math.abs(sprite.y - targetY) >10)
           sprite.y += moveY;
         });
        app.stage.addChild(sprite);
        document.body.appendChild(app.view);
      }
   
    
    return (<div id="main">
        <input type="text"  onChange={handleChange} />
        <button onClick={handleMsg}> 参战确认</button>
        {/* <h1>测试socket.io</h1>
        <canvas ref={canvasRef}  width="300" height="300" id="canvas"></canvas>
        <div> { Connect.map((item,index) => ( <p key={index}> {item.message}</p>)  )}</div>
        <input type="text" onChange={handleChange} />
        <button onClick={handleMsg}> 点击我发送消息</button> */}
    </div>
    )
}