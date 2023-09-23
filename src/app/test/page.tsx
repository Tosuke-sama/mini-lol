"use client";
import { useEffect,useState,useRef, use } from "react";
import {chatMessage} from "../../type/interface"
import * as PIXI from 'pixi.js';
import {moveToRight} from "./unil"
let renderNode = new Map()
export default function Test() {
    let [isConnect,setIsConnect] = useState(false)
    let [windowSize,setWindowSize] = useState({width:0,height:0})
    let [msg,setMsg] = useState("")
    let [playquene,setPlayquene] = useState<{[key: string]: chatMessage}>({})
    const [app, setApp] = useState<PIXI.Application | null>(null); // 设置初始值为 null
    const appRef = useRef<PIXI.Application | null>(null); 

    
    const texture = PIXI.Texture.from('/yasuo.png');
    let moveX = 0;
    let moveY = 0;
    const ws = new WebSocket("ws://localhost:4000")
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
        const newApp = new PIXI.Application({ 
          width: window.innerWidth,
          height: window.innerHeight,
          backgroundColor: 0x666666,
          resolution: window.devicePixelRatio || 1,
       });
       appRef.current = newApp;
       // 将 PIXI 实例保存到组件状态
       setApp(newApp);
       return () => {
        newApp.destroy();
      };
      
            
    },[])
    useEffect(()=>{
        for (let key in playquene){
            console.log(playquene)
            console.log(key)
            if(key === msg) continue;
            let player = renderNode.get(key)
            if(player){
                app?.ticker.remove(player.animate)
                player.animate = moveToRight(player,playquene[key]);
                app?.ticker.add(player.animate);
            }else{
                let newPlayer = new PIXI.Sprite(texture);
                renderNode.set(key,newPlayer)
                newPlayer.anchor.set(0.5);
                newPlayer.scale.set(0.1);
                newPlayer.x = playquene[key].x;
                newPlayer.y = playquene[key].y;
                app?.stage.addChild(newPlayer);
            }            
        }
    },[playquene])
    //窗口监听
    window.addEventListener('resize', function () {
      const windowSize = getWindowSize();
      console.log('窗口宽度:', windowSize.width, '窗口高度:', windowSize.height);
    });
    function getWindowSize() {
    const width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    const height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    setWindowSize({ width, height })
    return { width, height };
}
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
        if(!app) return;
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
        // document.querySelector("#main")?.appendChild()
        document.body.appendChild(app.view);
      }
   
    
    return (
      <>
    <div id="main">
        <input type="text"  onChange={handleChange} />
        <button onClick={handleMsg}> 参战确认</button>
    </div>
    </>
    )
}