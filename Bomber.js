class Bomber{
    constructor(selector){
        let self = this;
        
        this.debug = true;
        this.gameStarted = false;
        this.selector = selector;
        this.canvas = document.querySelector(this.selector);
        this.ctx = this.canvas.getContext('2d');

        this.height = window.innerHeight;
        this.width = window.innerWidth;

        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.borderBaseTop = 70;
        this.borderBaseRight=5;
        this.borderBaseBottom=30;
        this.borderBaseLeft=5;

        if(this.debug){
            this.borderBaseTop += 100;
        }

        self.resize();

        
        this.timeToExploded = 1;
        this.timeToExploding = 3;

        this.startTime = 0;
        this.players = new Array();
        this.bombs = new Array();
        this.walls = new Array();
        this.render();
        this.eventChecking();
        this.startGame();
        document.getElementsByTagName("body")[0].style.margin=0;
        document.getElementsByTagName("body")[0].style.padding=0;
        
    }
    resize(){
        this.height = window.innerHeight;
        this.width = window.innerWidth;

        this.borderRight = this.borderBaseRight;
        this.borderLeft = this.borderBaseLeft;
        this.borderTop = this.borderBaseTop;
        this.borderBottom = this.borderBaseBottom;


        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        let gameWidth = this.width - (this.borderBaseRight + this.borderBaseLeft);
        let gameHeight = this.height - (this.borderBaseBottom + this.borderBaseTop);
        this.numberCase =8;
        if(gameHeight > gameWidth){
            let diff =  gameHeight - gameWidth;
            this.borderTop += diff / 2;
            this.borderBottom += diff / 2;
            this.gameSize = gameWidth;
            this.borderGame = this.borderRight + this.borderLeft;

        }else{
            let diff =  gameWidth - gameHeight;
            this.borderRight += diff /2;
            this.borderLeft += diff /2;
            this.gameSize = gameHeight;
            this.borderGame = this.borderTop + this.borderBottom;
        }
        this.wallSize = (this.gameSize) / ((this.numberCase * 2) + 1);

    }
    render(){
        let self = this;
        
        this.ctx.fillStyle = "black";
        
        this.ctx.beginPath();
        this.ctx.rect(0, 0, this.width, this.height);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.fillStyle = "white";
        this.ctx.rect( 
            this.borderLeft, 
            this.borderTop, 
            this.width - (this.borderLeft + this.borderRight), 
            this.height- (this.borderTop + this.borderBottom));
        this.ctx.fill();
    

        if(this.gameStarted){
            this.movePlayers();
            this.actionPlayers();
            this.renderGame();
        }
        this.renderDebug();
        window.requestAnimationFrame(function(){self.render()});
        
    }
    actionPlayers(){
        for(let i =0;i < this.players.length;i++){
            if(this.players[i].bombing){
                this.playerBomb(this.players[i]);
            }
        }
    }
    eventChecking(){
        //Bomb explosion
        for(let i=0;i<this.bombs.length;i++){
            let now = new Date().getTime();
            if(!this.bombs[i].exploded && now - this.bombs[i].start >= (this.timeToExploded + this.timeToExploding) * 1000){
                this.bombs[i].player.availableBomb++;
                this.bombs[i].exploded = true;
                this.bombs[i].exploding = false;
            }
            if(!this.bombs[i].exploding && !this.bombs[i].exploded && now - this.bombs[i].start >= ( this.timeToExploding) * 1000){
                this.bombs[i].exploding = true;
            }
        }

        //Bomb action
       for(let j=0;j <this.bombs.length;j++){
            let bomb = this.bombs[j];
            if(bomb.exploding){
                let casesExploding = this.caseExploding(bomb);
                for(let k = 0;k< casesExploding.length;k++){
                    let bombed = casesExploding[k];

                    //Kill
                    for(let i=0;i<this.players.length;i++){
                        let player = this.players[i];
                        let playerCases = this.playerCases(player);
                        for(let l=0;l < playerCases.length;l++){
                            let caseToTest = playerCases[l];
                            if(caseToTest.x == bombed.x && caseToTest.y == bombed.y){
                                player.boom();
                            }
                        }
                    }

                    //Break wall
                    for(let i=0;i<this.walls.length;i++){
                        let wall = this.walls[i];

                        if(wall.cordX == bombed.x && wall.cordY == bombed.y){
                            wall.boom();
                        }

                    }

                }
            }
       }
        let self = this;
        window.requestAnimationFrame(function(){self.eventChecking()});

    }
    movePlayers(){

        for(let i =0;i < this.players.length;i++){
            let player = this.players[i];
            let newPos = player.getMove();
            let tmpPlayer = new Player('tmp');
            let currentCases = this.playerCases(player);
            let currentBlocked = false;
            for(let j = 0;j<currentCases.length;j++){
                if(this.caseIsBomb(currentCases[j])){
                    currentBlocked = true;
                }

            }
        

            //move the x
            Object.assign(tmpPlayer, player);
            tmpPlayer.posX = newPos.x;
            let cases = this.playerCases(tmpPlayer);
            let blocked = false;
            for(let j = 0;j<cases.length;j++){
                if(this.caseIsBlocked(cases[j]) || (this.caseIsBomb(cases[j]) && !currentBlocked)){
                    blocked = true;
                }
            }
            if(!blocked){
                player.posX = newPos.x;
            }
            //move the y
            Object.assign(tmpPlayer, player);
            tmpPlayer.posY = newPos.y;
            cases = this.playerCases(tmpPlayer);
            blocked = false;
            for(let j = 0;j<cases.length;j++){
                if(this.caseIsBlocked(cases[j]) || (this.caseIsBomb(cases[j]) && !currentBlocked)){
                    blocked = true;
                }

            }
            if(!blocked){
                player.posY = newPos.y;
            }

        }

    }

    startGame(){
        let self = this;        
        let playerSize = this.wallSize / 1.5;
        this.players.push(new Player('Player 1',playerSize));
        this.players.push(new Player('Player 2',playerSize));
        this.players[0].setKeybinding({default:'p1'});
        this.players[1].setKeybinding({default:'p2'});
        this.startTime = new Date().getTime()/1000;
        this.setPlayerToCord(this.players[0],{x:1,y:1});
        this.setPlayerToCord(this.players[1],{x:(this.numberCase*2)-1,y:(this.numberCase*2)-1});

        //Add block
        let posMax = (this.numberCase*2)+1;
        
        this.walls = new Array();

        for(let i=0;i<posMax;i++){
            for(let j=0;j<posMax;j++){
                if(!this.caseIsWall({x:i,y:j}) && !this.caseNextToPlayer({x:i,y:j})){
                    let random = Math.random();
                    if(random > 0.3){
                        this.walls.push(new Wall(i,j));
                    }

                }
            }
        }


        window.addEventListener("keydown", function(e){
            self.movingPlayer(event,true);
        });
        window.addEventListener("keyup", function(e){
            self.movingPlayer(event,false);
        });
        this.gameStarted = true;
    }
    caseNextToPlayer(cord){
        let nextTo = false;
        for(let i=0;i<this.players.length;i++){
            let player = this.players[i];
            let playerCord = this.posToCase({x:player.posX,y:player.posY});
            //Player pos
            if(cord.x == playerCord.x && cord.y==playerCord.y){
                nextTo=true;
            }
            //player up
            if(cord.x == playerCord.x&&cord.y==playerCord.y -1){
                nextTo=true;
            }
            //Player bottom
            if(cord.x == playerCord.x&&cord.y==playerCord.y+1){
                nextTo=true;
            }
            if(cord.x == playerCord.x-1&&cord.y==playerCord.y){
                nextTo=true;
            }
            if(cord.x == playerCord.x+1&&cord.y==playerCord.y){
                nextTo=true;
            }

        }
        return nextTo;


    }

    movingPlayer(event,keydown){
        for(let i=0;i<this.players.length;i++){
            this.players[i].keyInput(event.keyCode,keydown);
        }
    }
    playerBomb(player){
        let cord = this.posToCase({
            x:player.posX,
            y:player.posY
        });
        if(player.availableBomb > 0 && !this.caseIsBomb(cord)){
            player.availableBomb--;
            let cordToBomb = cord;
    
            this.bombs.push(new Bomb(cordToBomb.x,cordToBomb.y,player,player.bombExplosionSize));
        }
        

    }

    caseExploding(bomb){
        let cases = new Array();

        let blockedToUp=false;
        let blockedToBottom=false;
        let blockedToRight=false;
        let blockedToLeft=false;
        cases.push({x:bomb.cordX,y:bomb.cordY});
        let breakUp = false;
        let breakRight = false;
        let breakBottom = false;
        let breakLeft = false;

        for(let i=1;i<=bomb.explosionSize;i++){
            let cordToUp = {
                x:bomb.cordX,
                y:bomb.cordY - i
            };
            let cordToBottom = {
                x:bomb.cordX,
                y:bomb.cordY + i
            };
            let cordToRight = {
                x:bomb.cordX + i,
                y:bomb.cordY
            };
            let cordToLeft = {
                x:bomb.cordX -i,
                y:bomb.cordYx
            };
            let breakableBottom = this.caseIsWallBrakeable(cordToBottom);
            let breakableUp = this.caseIsWallBrakeable(cordToUp);
            let breakableRight = this.caseIsWallBrakeable(cordToRight);
            let breakableLeft = this.caseIsWallBrakeable(cordToLeft);

            if(!blockedToBottom && !breakBottom &&(!this.caseIsWall(cordToBottom) ||  breakableBottom)){
                //@todo bug
                if(breakableBottom && (!this.caseIsWallExploded( {x:bomb.cordX + i,y:bomb.cordY }) || (bomb.explosionBottom == 0 ||bomb.explosionBottom >= i))){
                    breakBottom =true;
                    bomb.explosionBottom = i;
                    console.log({x:bomb.cordX + i,y:bomb.cordY });
                    console.log(bomb.explosionBottom);
                    console.log( !this.caseIsWallExploded( {x:bomb.cordX + i,y:bomb.cordY }));
                }
                cases.push(cordToBottom);
            }else{
                blockedToBottom = true;
            }
            if(!blockedToUp && !breakUp && (!this.caseIsWall(cordToUp)||  breakableUp)){
                if(breakableUp){
                    breakUp =true;
                }
                cases.push(cordToUp);
            }else{
                blockedToUp = true;
            }
            if(!blockedToRight && !breakRight && (!this.caseIsWall(cordToRight)|| breakableRight)){
                cases.push(cordToRight);
                if(breakableRight){
                    breakRight =true;
                }
            }else{
                blockedToRight = true;
            }
            if(!blockedToLeft && !breakLeft &&(!this.caseIsWall(cordToLeft)|| breakableLeft)){
                if(breakableLeft){
                    breakLeft =true;
                }
                cases.push(cordToLeft);
            }else{
                blockedToLeft = true;
            }
        }


        return cases;

    }

    renderGame(){

        for(let i =0;i <= this.numberCase;i++){
            for(let j = 0;j <= this.numberCase;j++){
                this.ctx.fillStyle = "black";
                let startX = this.borderLeft +(( this.wallSize *i) * 2);
                let startY = this.borderTop +(( this.wallSize *j) * 2);
                this.ctx.beginPath();
                this.ctx.rect(startX, startY, this.wallSize,this.wallSize);
                this.ctx.fill();
                
            }
        }
        for(let i=0;i<this.walls.length;i++){
            if(!this.walls[i].exploded){
                this.ctx.beginPath();
                let pos = this.caseToPos({
                    x:this.walls[i].cordX,
                    y:this.walls[i].cordY
                })  
                this.ctx.fillStyle = 'gray';
                this.ctx.strokeStyle = 'gray';
                this.ctx.rect(pos.x, pos.y, this.wallSize,this.wallSize);
                this.ctx.fill();
            }            
        }

        for(let i =0;i < this.bombs.length;i++){
            let bomb = this.bombs[i];
            if(!bomb.exploded){
                this.ctx.beginPath();
                let pos = this.caseToPos({
                    x:bomb.cordX,
                    y:bomb.cordY
                })
                this.ctx.fillStyle = 'red';
                this.ctx.strokeStyle = 'red';
                
                this.ctx.arc(pos.x+(this.wallSize/2),pos.y+(this.wallSize/2), this.wallSize/2, 0, 2 * Math.PI);
                this.ctx.fill();
                if(bomb.exploding){
                    let casesExploding = this.caseExploding(bomb);
                    for(let j=0;j<casesExploding.length;j++){
                        this.ctx.beginPath();
                        let pos = this.caseToPos({
                            x:casesExploding[j].x,
                            y:casesExploding[j].y
                        })  
                        this.ctx.fillStyle = 'blue';
                        this.ctx.strokeStyle = 'blue';
                        this.ctx.rect(pos.x, pos.y, this.wallSize,this.wallSize);
                        this.ctx.fill();
                    }
                }
                
            }
        }
        this.ctx.beginPath();
        this.ctx.font = "20px Arial";
        this.ctx.fillStyle = "white";
        this.ctx.textAlign = "center";
        this.ctx.fillText(parseInt(new Date().getTime()/1000 - this.startTime), this.width/2,this.height -10); 

        for(let i =0;i < this.players.length;i++){
            this.ctx.beginPath();
            let currPlayer = this.players[i];
            this.ctx.fillStyle = currPlayer.color;
            this.ctx.strokeStyle = currPlayer.color;
            this.ctx.arc(currPlayer.posX ,currPlayer.posY   ,currPlayer.size/2, 0, 2 * Math.PI);
                
            //this.ctx.rect(currPlayer.posX - (currPlayer.size/2), currPlayer.posY- (currPlayer.size /2), currPlayer.size,currPlayer.size);
            this.ctx.fill();
            
            this.ctx.beginPath();
            this.ctx.font = "9px Arial";
            this.ctx.fillStyle = currPlayer.color;
            this.ctx.textAlign = "center";
            this.ctx.fillText(currPlayer.name,currPlayer.posX,  currPlayer.posY- (currPlayer.size /2)-4 ); 
            if(currPlayer.dead){
                
                this.ctx.fillText("K.O",currPlayer.posX,  currPlayer.posY- (currPlayer.size /2)-10 ); 
            }
           
        }

        

    }

    playerCases(player){
        let cases = new Array();


        //Corner top right
        let x = player.posX + (player.size /2) ;
        let y = player.posY - (player.size /2);
    
        cases.push(this.posToCase( {x:x,y:y}));

        //Corner top left
        x = player.posX - (player.size /2);
        y = player.posY - (player.size /2);
      
        cases.push(this.posToCase( {x:x,y:y}));


        //Corner bottom left
        x = player.posX - (player.size /2);
        y = player.posY + (player.size /2);
        cases.push(this.posToCase( {x:x,y:y}));
        //Corner bottom right
        x = player.posX + (player.size /2);
        y = player.posY + (player.size /2);
        cases.push(this.posToCase( {x:x,y:y}));

        let noDuplicate = new Array();
        
        for(let i = 0;i < cases.length;i++){
            let duplicate = false;
            for(let j = 0;j <noDuplicate.length;j++){
                if(
                    noDuplicate[j].x == cases[i].x &&
                    noDuplicate[j].y == cases[i].y
                ){
                    duplicate = true;
                }
            }

            if(!duplicate){
                noDuplicate.push(cases[i]);
            }

        }

        return noDuplicate;
    }

    caseToPos(caseCord){
        return {
            x:(caseCord.x*this.wallSize)+this.borderLeft,
            y:(caseCord.y*this.wallSize)+this.borderTop,
        }
    }
    posToCase(cord){
        
        let posX = cord.x - this.borderLeft;
        let posY = cord.y - this.borderTop;
        let caseX = parseInt(posX / this.wallSize);
        let caseY = parseInt(posY / this.wallSize);

        if(posX < 0){
            caseX--;
        }
        if(posY < 0){
            caseY--;
        }
        return{
            x:caseX,
            y:caseY

        }
    }
    caseIsBlocked(cord){
        
        return this.caseIsWall(cord) && !this.caseIsWallExploded(cord);
    }
    caseIsBomb(cord){
        let blocked = false;
        for(let i=0;i<this.bombs.length;i++){
            if(!this.bombs[i].exploded && this.bombs[i].cordX == cord.x && this.bombs[i].cordY == cord.y){
                blocked = true;
            }
        }
       return blocked;
    }
    caseIsWall(cord){
        let caseWall= cord.x % 2 == 0 && cord.y %2 ==0;
        let outOfBox = cord.x < 0 ||cord.y < 0|| cord.x >=( this.numberCase * 2)+1 || cord.y >=( this.numberCase * 2)+1;
        let isWallBreakable = this.caseIsWallBrakeable(cord);
        return caseWall || outOfBox || isWallBreakable;
    }
    caseIsWallBrakeable(cord){
        let res = false;
        for(let i=0;i<this.walls.length;i++){
            if(cord.x == this.walls[i].cordX && cord.y == this.walls[i].cordY){
                res = true;
            }
        }   
        return res;


    }
    caseIsWallExploded(cord){
        let res = false;
        for(let i=0;i<this.walls.length;i++){
                if(cord.x == this.walls[i].cordX && cord.y == this.walls[i].cordY){
                    if(this.walls[i].exploded){
                        res = true;
                    }
                }
        }   
        return res;


    }

    renderDebug(){
        if(this.debug){
            for(let i =0;i < this.players.length;i++){
                let currPlayer = this.players[i];
                let cases = this.playerCases(currPlayer);
                for(let j=0;j<cases.length;j++){
                    let cord = this.caseToPos(cases[j]);
                    this.ctx.strokeStyle = 'red';
                
                
                    this.ctx.beginPath();
                    this.ctx.rect(cord.x,cord.y, this.wallSize, this.wallSize);
                    this.ctx.stroke();
                }
                
               
            }


            this.ctx.font = "12px Arial";
            this.ctx.fillStyle = "red";
            
            this.ctx.beginPath();
            this.ctx.textAlign = "left";
            this.ctx.fillText("Infos:",5, 12); 
            this.ctx.fillText("cases: "+((this.numberCase*2)+1),5, 24); 
            this.ctx.fillText("gameSize: "+this.gameSize,5, 36); 
            this.ctx.fillText("border: "+this.borderGame,5, 48); 

            for(let i=1;i<=this.players.length;i++){
                let diplsayX = i*150;
                let currPlayer = this.players[i-1];
                let cord = this.playerCases(currPlayer);
                let infos = new Array();
                infos.push(currPlayer.name);
                infos.push("x: "+currPlayer.posX);
                infos.push("y: "+currPlayer.posY);
                infos.push("movingUp: "+currPlayer.movingUp);
                infos.push("movingRight: "+currPlayer.movingRight);
                infos.push("movingDown: "+currPlayer.movingDown);
                infos.push("movingLeft: "+currPlayer.movingLeft);
                infos.push("dead: "+currPlayer.dead);

                for(let j =0;j<infos.length;j++){
                    this.ctx.fillText(infos[j],diplsayX, (j+1)*12); 
                } 

            }

            for(let i=0;i<this.walls.length;i++){
                let wall = this.walls[i];
                let pos = this.caseToPos({x:wall.cordX,y:wall.cordY})
                this.ctx.beginPath();
                this.ctx.font = "9px Arial";
                this.ctx.fillStyle = "darkred";
                this.ctx.textAlign = "center";
                this.ctx.fillText("Exploded:",pos.x + (this.wallSize /2), pos.y + (this.wallSize /2) ); 
                this.ctx.fillText(wall.exploded,pos.x + (this.wallSize /2), pos.y + (this.wallSize /2)+10 ); 


            }
           
            
        }

    }

    setPlayerToCord(player,cord){
        let pos = this.caseToPos(cord);
        player.posX = pos.x + (this.wallSize/2);
        player.posY = pos.y+ (this.wallSize/2);
    }




}

class Player{
    constructor(name,size){
        this.name = name;
        this.size = size;
        this.posX = 0;
        this.posY = 0;
        this.keyUp = null;
        this.keyDown = null;
        this.keyRight = null;
        this.keyLeft = null;
        this.keyBomb = null;
        this.dead = false;
        let r = Math.floor(Math.random() * 255);
        let g = Math.floor(Math.random() * 255);
        let b = Math.floor(Math.random() * 255);
        this.color = "rgb("+r+","+g+","+b+")";

        this.movingDown = false;
        this.movingLeft =false;
        this.movingRight = false;
        this.movingUp = false;
        this.bombing = false;
        this.speed = 5;
        this.availableBomb = 5;
        this.bombExplosionSize = 3;

    }

    spawn(){
       

    }
    boom(){
        this.availableBomb = -10;
        this.bombing = false;
        this.dead = true;
        this.movingDown = false;
        this.movingLeft =false;
        this.movingRight = false;
        this.movingUp = false;
        this.speed = 0;
    }
    moving(direction,value){
        switch(direction){
            case 'up':
                this.movingUp = value;
                break;
            case 'down':
                this.movingDown = value;
                break;
            case 'right':
                this.movingRight = value;
                break;
            case 'left':
                this.movingLeft = value;
                break;
        }
    }
    setPos(pos){
        this.posX = pos.x;
        this.posY = pos.y;
    }
    getMove(){
        let posX = this.posX;
        let posY = this.posY;
            if(!this.dead){
                if(this.movingDown){
                    posY += this.speed;
                }
                if(this.movingUp){
                    posY -= this.speed;
                }
                if(this.movingLeft){
                    posX -= this.speed;
                }
                if(this.movingRight){
                    posX += this.speed;
                }

            }
            return {
                x:posX,
                y:posY
            }
    }

    keyInput(keycode,keydown){
            switch(keycode){
                //Bottom
                case this.keyDown:
                    this.moving('down',keydown);
                    break;
                //right
                case this.keyRight:
                        this.moving('right',keydown);
                    break;
                //up
                case this.keyUp:
                        this.moving('up',keydown);
                    break;
                //left
                case this.keyLeft:
                        this.moving('left',keydown);
                    break;
                //space
                case this.keyBomb:
                    this.bomb(keydown);
                    break;
            }
    }

    bomb(keydown){
        this.bombing = keydown;
    }
    setKeybinding(params){
        if(params.default){
            switch(params.default){
                case 'p1':
                    this.keyUp = 38;
                    this.keyDown = 40;
                    this.keyRight = 39;
                    this.keyLeft = 37;
                    this.keyBomb = 96;
                    break;
                case 'p2':
                    this.keyUp = 90;
                    this.keyDown = 83;
                    this.keyRight = 68;
                    this.keyLeft = 81;
                    this.keyBomb = 69;
                    break;
            }
        }
    }
   

}

class Bomb{
    constructor(x,y,player,explosionSize){
        this.exploded = false;
        this.exploding = false;
        this.cordX = x;
        this.cordY = y;
        this.player = player;
        this.explosionSize = explosionSize;
        this.explosionUp = 0;
        this.explosionRight = false;
        this.explosionBottom = false;
        this.explosionLeft = false;


        this.start = new Date().getTime();
    }
}

class Wall{

    constructor(x,y){
        this.cordX = x;
        this.cordY = y;
        this.exploded = false;

    }
    boom(){
        this.exploded = true;


    }

}