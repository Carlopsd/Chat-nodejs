//Preparacióon del server
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

//Obtener la respuesta en forma de json
app.use(express.json());
app.use(express.urlencoded({extended:true}));

//Sockets
const {Server} =require('socket.io');
const { isBooleanObject } = require('util/types');
const io = new Server(server);


//Define una carpeta estatica para los archivos a usar
app.use(express.static('public'));

//Se manda el html que se usará
app.get("/", (req,res)=>{
    res.sendFile(__dirname + '/public/index.html');
});


//Variabes para el control de los usuarios conectados
let userName;
let users=[];
let n=-1;

//Uso de sockets para mandar y recibir datos
io.on('connection',(socket)=>{

    //Socket para el menu principal
    socket.on('input name',(user)=>{
        userName=user;
        if(! users.includes(`${userName}`)){
            users.push(userName.trim());
            n+=1;
            socket.emit('show correct')

        }else{
            console.log('socket: input name')
            socket.emit('show error')
        }   
    });

    // Socket para el chat
    users.forEach((i,index) => {
        console.log(`Un usuario ${users[n]} se ha conectado al chat`)
    
        if(index== n){
            socket.on('chat message', (msg)=>{
                io.emit('chat message',msg, users[index]);
                console.log(users)
            });

            socket.on("disconnect",()=>{
                console.log(`El usuario ${users[index]} se ha desconectado`)
                users[index]="";
                clearUsers()
                console.log(users)
            });
        }
    });
});


// Funcion para borrar en caso de que se desconecten los usuarios
function clearUsers(){
    let i=0
    users.forEach(item=>{
        if(item==''){
            i+=1
        }
    })
    if(i==users.length){
        users=[];
        n=-1;
        console.log(users)
    }
}


server.listen(8080, ()=>{
    console.log("Ejecutandose en el puerto 8080")
})