var express = require('express'),
    app     = express(),
    http    = require('http'),
    socketIO      = require('socket.io'),
    mongoose      = require('mongoose'),
    bodyParser    = require('body-parser');
    //http.listen(process.env.PORT || 5000);

const PORT = process.env.PORT || 3000;
const INDEX = __dirname + '/index.html';
var server = http.createServer(app);
const io = socketIO.listen(server);
server.listen(PORT);
mongoose.connect(process.env.MONGOLINK);
var people = {};
var clientUsers = [];



var userController = require('./server/controllers/user-controller.js');

io.on('connection', (socket)=> {
  console.log("Client Connected");
  socket.on('join', (username) =>{
    updatePeople(username, socket.id);
    io.emit('users-updated', clientUsers);
  });
  socket.on('disconnect', () => {
    console.log("Client Disconnected");
    delete people[socket.id];
  });
  socket.on('message', (message)=> io.emit('receive-message', message));
});
app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
    });

app.use(express.static('static'));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.use('/app', express.static(__dirname + '/app'));
app.get('/', function(req, res){
  res.sendFile(__dirname + "/index.html");
});

//User Create
app.post('/signup', userController.signup);


//functions
function updatePeople(username, id){
  var userArray = [];
  for (key in people){
    if (people[key] === username){
      return;
    }
    userArray.push(people[key]);
  }
  userArray.push(username);
  people[id] = username;
  clientUsers = userArray;
}
