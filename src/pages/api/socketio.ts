import { NextApiRequest } from "next";
import { Server as ServerIO } from "socket.io";
import { Server as NetServer } from "http";
import { NextApiResponseServerIO } from "../type/next";

export const config = {
    api: {
        bodyParser: false,
    },
};
let chatContent:String[] = ["初始化"];

const handle = async (req: NextApiRequest, res: NextApiResponseServerIO) => {
    console.log("接受到请求");
    if (!res.socket.server.io) {
        console.log("创建服务");
        const httpServer: NetServer = res.socket.server as any;
        const io = new ServerIO(httpServer, {
            path: "/api/socketio",
        });
        res.socket.server.io = io;
        res.socket.server.io.on("connection",(socket)=>{
           socket.emit("chatContent",chatContent)
           socket.on("chat",(msg)=>{
                chatContent.push(msg)
                socket.emit("chatContent",chatContent)
                console.log(msg)
            })
        })
    }
    res.end();
};

export default handle;
