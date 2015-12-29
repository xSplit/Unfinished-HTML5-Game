Server = {
    service:null,
    connect: function(){
        this.service.onmessage = function(event){
            Game.mainLoop(event.data);
        };
        this.service.onopen = function(){
            console.log("Connected");
        };
        this.service.onclose = function(){
            console.log("Disconnected")
        };
        this.service.onerror = function(){
            console.log(error);
        };
    },
    send: function(message){
        this.service.send(message);
    },
};

String.base64charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
String.prototype.encodeBase64 = function(){
    var r = "", i = 0, c1,c2,c3,e1,e2,e3,e4;
    while(i < this.length) {
        c1 = this.charCodeAt(i++), c2 = this.charCodeAt(i++), c3 = this.charCodeAt(i++);
        e1 = c1 >> 2, e2 = ((c1 & 3) << 4) | (c2 >> 4), e3 = ((c2 & 15) << 2) | (c3 >> 6), e4 = c3 & 63;
        if(isNaN(c2)) e3 = e4 = 64; else if(isNaN(c3)) e4 = 64;
        r += String.base64charset.charAt(e1) + String.base64charset.charAt(e2) + String.base64charset.charAt(e3) + String.base64charset.charAt(e4);
    }
    return r;
}
String.prototype.decodeBase64 = function(){
    var r = "", i = 0, c1,c2,c3,e1,e2,e3,e4;
    while (i < this.length) {
        e1 = String.base64charset.indexOf(this.charAt(i++)), e2 = String.base64charset.indexOf(this.charAt(i++)), e3 = String.base64charset.indexOf(this.charAt(i++)), e4 = String.base64charset.indexOf(this.charAt(i++));
        c1 = (e1 << 2) | (e2 >> 4), c2 = ((e2 & 15) << 4) | (e3 >> 2), c3 = ((e3 & 3) << 6) | e4;
        r += String.fromCharCode(c1);
        if (e3 != 64) r += String.fromCharCode(c2);
        if (e4 != 64) r += String.fromCharCode(c3);
    }
    return r;
}
