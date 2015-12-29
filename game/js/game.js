Game = {
    c:null,
    user:null,
    clients:{MOVE:{},CHAT:{}},
    clear: function(width, height){
        this.c.clearRect(0, 0, width, height);
    },
    drawStyle: function(stroke,fill,line){
        this.c.strokeStyle = stroke;
        this.c.fillStyle = fill;
        this.c.lineWidth = line;
    },
    drawBall: function(x,y,r){
        this.c.beginPath();
        this.c.arc(x, y, r, 0, Math.PI*2, true);
        this.c.fill();
        this.c.fillStyle = "black";
        this.c.stroke();
        this.c.closePath();
        return {x:x,y:y,r:r};
    },
    drawName: function(name, x, y){
        this.c.font = "30px Arial";
        this.c.fillText(name, x, y);
    },
    drawChat: function(text, x, y){
        this.c.fillText(text, x, y);
    },
    last:{},
    KeyDown: function(evt){
        if(document.activeElement.getAttribute('id') == 'chat') return;
        if(typeof(Game.last[evt.which]) !== 'undefined') {
            clearInterval(Game.last[evt.which]);
            delete Game.last[evt.which];
        }
        Game.last[evt.which] = setInterval(function() {
            console.log(evt.which);
            switch (evt.which) {
                case 68: // left
                    Game.user.x += Game.user.speed;
                    Game.updateUser(true);
                    break;

                case 87: // up
                    Game.user.y -= Game.user.speed;
                    Game.updateUser(false);
                    break;

                case 65: // right
                    Game.user.x -= Game.user.speed;
                    Game.updateUser(true);
                    break;

                case 83: // down
                    Game.user.y += Game.user.speed;
                    Game.updateUser(false);
                    break;

                case 32:
                    Server.send("HIT");
                    clearInterval(Game.last[evt.which]);
                    break;
            }
        },0);
    },
    KeyUp: function(evt){
        if(typeof(Game.last[evt.which]) !== 'undefined') {
            clearInterval(Game.last[evt.which]);
            delete Game.last[evt.which];
        }
    },
    PrK: function(){
        var keys = Object.keys(Game.last);
        for(var i=0;i<keys.length;i++){
            clearInterval(Game.last[keys[i]]);
        }
    },
    invokeAll: function(key){
        var keys = Object.keys(this.clients[key]);
        for(var i=0;i<keys.length;i++){
            this.clients[key][keys[i]]();
        }
    },
    updateUser: function(x){
        Server.send("MOVE " + (x?"X":"Y") + " " + (x?Game.user.x:Game.user.y));
    },
    mainLoop: function(message){
        console.log(message);
        if(message.indexOf("ERROR:") > -1){ alert(message); return; }
        var data = message.split(' ');
        if(this.user == null) {
            this.user = {
                x: parseInt(data[1]),
                y: parseInt(data[2]),
                r: 20,
                speed: 3,
                name: data[3]
            };
            document.onkeydown = Game.KeyDown;
            document.onkeyup = Game.KeyUp;
            window.onblur = Game.PrK;
            document.getElementById('chat').onkeydown = function(evt){
                if(evt.which == 13) {
                    Server.send("CHAT " + this.value.encodeBase64());
                    this.value = "";
                }
            };
        }
        this.clear(canvas.width,canvas.height);
        switch(data[0]) {
            case "MOVE":
                this.clients.MOVE[data[3]] = function () {
                    var name = data[3];
                    var x = parseInt(data[1]);
                    var y = parseInt(data[2]);
                    var r = parseInt(data[4]);
                    Game.drawName(name, x - (name.length * 8), y - (r + 15));
                    Game.drawStyle("black", r==20?"red":"grey", 5);
                    Game.drawBall(x, data[2], r);
                };
                this.lastc[data[3]] = [data[1],data[2]];
                break;
            case "CHAT":
                this.clients.CHAT[data[4]] = function () {
                    var x = parseInt(data[2]);
                    var y = parseInt(data[3]);
                    var name = data[4];
                    if(x != Game.lastc[name][0] || y != Game.lastc[name][1]){
                        delete Game.clients.CHAT[data[4]];
                        return;
                    }
                    var str = data[1].decodeBase64();
                    Game.drawChat(str, x - (str.length * 8), parseInt(y) + (20 + 30), name);
                };
                break;
            case "CLOSE":
                delete this.clients.MOVE[data[1]];
                delete this.clients.CHAT[data[1]];
                this.clear(canvas.width, canvas.height);
                break;
            case "COLLISION":
                this.user.x = parseInt(data[1]);
                this.user.y = parseInt(data[2]);
                break;
        }
        this.invokeAll('MOVE');
        this.invokeAll('CHAT');
    },
    lastc:{}
};
