//****** GAME LOOP ********//

let time = new Date();
let deltaTime = 0;

let gameMusic = document.getElementById('anoko-secret')

gameMusic.loop= true;


gameMusic.addEventListener('ended', function(){
    this.currentTime= 0;
    this.play();
},false);

if(document.readyState === "complete" || document.readyState === "interactive"){
    setTimeout(iniciar, 1);
} else{
    document.addEventListener("DOMContentLoaded", iniciar); 
}

function iniciar() {
    gameMusic.play()
    time = new Date();
    comenzarJuego();
    loopear();
}

function loopear() {
    deltaTime = (new Date() - time) / 1000;
    time = new Date();
    actualizar();
    requestAnimationFrame(loopear);
}

//****** GAME LOGIC ********//

let sueloY = 22;
let velY = 0;
let impulso = 900;
let gravedad = 2500;

let dinoPosX = 42;
let dinoPosY = sueloY; 

let sueloX = 0;
let velEscenario = 1280/3;
let gameVel = 1;
let score = 0;

let parado = false;
let saltando = false;
let dasheando = false;
let isDoubleJumpAvailable = true;
let isDashAvailable = true;
let isInmune = true

let tiempoHastaObstaculo = 2;
let tiempoObstaculoMin = 0.7;
let tiempoObstaculoMax = 1.8;
let obstaculoPosY = 16;
let obstaculos = [];

let tiempoHastaNube = 0.5;
let tiempoNubeMin = 0.7;
let tiempoNubeMax = 2.7;
let maxNubeY = 270;
let minNubeY = 100;
let nubes = [];
let velNube = 0.5;

let introGame = true

let contenedor;
let dino;
let textoScore;
let suelo;
let gameOver;   

    function comenzarJuego() {
        gameOver = document.querySelector(".game-over");
        suelo = document.querySelector(".suelo");
        contenedor = document.querySelector(".contenedor");
        textoScore = document.querySelector(".score");
        dino = document.querySelector(".belenyaa");
        document.addEventListener("keydown", HandleKeyDown);
    }

    let introContainer = document.getElementById('intro-contenedor')
    let iniciarBtn = document.getElementById('iniciar-btn')

    iniciarBtn.addEventListener('click', function(){
        
        gameMusic.play()
        introContainer.classList.remove("d-flex")
        introContainer.style.display="none"
        contenedor.classList.add('contenedor-ingame')

        contenedor.addEventListener('animationend', function(){
            contenedor.style.height = "350px"            
            introGame = false            
            textoScore.style.display = "block"
            contenedor.classList.remove('contenedor-ingame')
        })

    })

    function actualizar() {
        if(parado) return;
        
        moverBelenya();
        moverSuelo();
        decidirCrearNubes();
        moverNubes();
        if (!introGame) {
            decidirCrearObstaculos();            
            moverObstaculos();
            detectarColision();
        }
        

        velY -= gravedad * deltaTime;
    }

    function HandleKeyDown(ev){
        if(ev.keyCode == 32 || ev.keyCode == 38 || ev.keyCode == 87 ){
            saltar();
        } else if (ev.keyCode == 83 || ev.keyCode == 40  ) {
            caer()
        } else if (ev.keyCode == 39 || ev.keyCode == 68) {
            dashear()
        }
    }

    function saltar(){
        if(dinoPosY === sueloY){
            saltando = true;
            velY = impulso;
            dino.classList.remove("belenyaa-corriendo");
        } else if(dinoPosY !== sueloY && isDoubleJumpAvailable){
            saltando = false;
            velY = impulso/1.8;
            dino.classList.add("dino-corriendo");
            saltando = true
            isDoubleJumpAvailable = false;
            //FUNCION DOBLE SALTO
        } 
    }

    function dashear(){
        if (saltando && isDashAvailable) {
            dasheando = true            
            saltando = false
            isDashAvailable = false;
            console.log("dasheando pibe")
            dino.classList.add("belenyaa-corriendo")
            dino.classList.add("belenyaa-avance")
        }
    }

    function caer() {
        if(dinoPosY !== sueloY){
            velY = -impulso;
        }
    }

    function moverBelenya() {
        dinoPosY += velY * deltaTime;
        if(dinoPosY < sueloY){        
            tocarSuelo();
        }
        dino.style.bottom = dinoPosY+"px";
    }

    function tocarSuelo() {
        if (dasheando) {
            dino.classList.remove("belenyaa-avance")
            dino.classList.add("belenyaa-retroceso")
            dasheando = false
            isDashAvailable = true
            dino.addEventListener('animationend', function(){
                dino.classList.remove('belenyaa-retroceso')
            })
            
        }
        dinoPosY = sueloY;
        velY = 10;
        if(saltando){
            dino.classList.add("belenyaa-corriendo");
        }
        saltando = false;
        isDoubleJumpAvailable = true;
    }

    function moverSuelo() {
        sueloX += calcularDesplazamiento();
        suelo.style.left = -(sueloX % contenedor.clientWidth) + "px";
    }

    function calcularDesplazamiento() {
        return velEscenario * deltaTime * gameVel;
    }

    function decidirCrearObstaculos() {
        tiempoHastaObstaculo -= deltaTime;
        if(tiempoHastaObstaculo <= 0) {
            crearObstaculo();
        }
    }

    function decidirCrearNubes() {
        tiempoHastaNube -= deltaTime;
        if(tiempoHastaNube <= 0) {
            crearNube();
        }
    }

    function crearObstaculo() {
        let obstaculo = document.createElement("div");
        contenedor.appendChild(obstaculo);
        obstaculo.classList.add("cactus");
        if(Math.random() > 0.5) obstaculo.classList.add("cactus2");
        obstaculo.posX = contenedor.clientWidth;
        obstaculo.style.left = contenedor.clientWidth+"px";

        obstaculos.push(obstaculo);
        tiempoHastaObstaculo = tiempoObstaculoMin + Math.random() * (tiempoObstaculoMax-tiempoObstaculoMin) / gameVel;
    }

    function crearNube() {
        let nube = document.createElement("div");
        contenedor.appendChild(nube);
        nube.classList.add("nube");
        nube.posX = contenedor.clientWidth;
        nube.style.left = contenedor.clientWidth+"px";
        nube.style.bottom = minNubeY + Math.random() * (maxNubeY-minNubeY)+"px";
        
        nubes.push(nube);
        tiempoHastaNube = tiempoNubeMin + Math.random() * (tiempoNubeMax-tiempoNubeMin) / gameVel;
    }

    function moverObstaculos() {
        for (let i = obstaculos.length - 1; i >= 0; i--) {
            if(obstaculos[i].posX < -obstaculos[i].clientWidth) {
                obstaculos[i].parentNode.removeChild(obstaculos[i]);
                obstaculos.splice(i, 1);
                acumularPuntos();
            }else{
                obstaculos[i].posX -= calcularDesplazamiento();
                obstaculos[i].style.left = obstaculos[i].posX+"px";
            }
        }
    }

    function moverNubes() {
        for (let i = nubes.length - 1; i >= 0; i--) {
            if(nubes[i].posX < -nubes[i].clientWidth) {
                nubes[i].parentNode.removeChild(nubes[i]);
                nubes.splice(i, 1);
            }else{
                nubes[i].posX -= calcularDesplazamiento() * velNube;
                nubes[i].style.left = nubes[i].posX+"px";
            }
        }
    }

    function acumularPuntos() {
        score++;
        textoScore.innerText = score;
        if(score == 1){
            gameVel = 1;
            contenedor.classList.add("mediodia");
        }else if(score == 100) {
            gameVel = 2;
            contenedor.classList.add("tarde");
        } else if(score == 200) {
            gameVel = 2.2;
            contenedor.classList.add("noche");
        }
        suelo.style.animationDuration = (3/gameVel)+"s";
    }

    
    function chocar() {
        dino.classList.remove("belenyaa-corriendo");
        dino.classList.remove("belenyaa-retroceso");
        dino.classList.add("belenyaa-estrellada");
        parado = true;
    }

    function perderJuego() {
        //if (isInmune) return
        chocar();
        gameOver.style.display = "block";
    }

    function detectarColision() {
        for (let i = 0; i < obstaculos.length; i++) {
            if(obstaculos[i].posX > dinoPosX + dino.clientWidth) {
                //EVADE
                break; //al estar en orden, no puede chocar con más
            }else{
                if(IsCollision(dino, obstaculos[i], 10, 30, 15, 20)) {
                    perderJuego();
                }
            }
        }
    }

    function IsCollision(a, b, paddingTop, paddingRight, paddingBottom, paddingLeft) {
        let aRect = a.getBoundingClientRect();
        let bRect = b.getBoundingClientRect();

        return !(
            ((aRect.top + aRect.height - paddingBottom) < (bRect.top)) ||
            (aRect.top + paddingTop > (bRect.top + bRect.height)) ||
            ((aRect.left + aRect.width - paddingRight) < bRect.left) ||
            (aRect.left + paddingLeft > (bRect.left + bRect.width))
        );
    }

    const resetBtn = document.getElementById('reset-btn')

    resetBtn.addEventListener('click', function(){

        console.log("Reiniciando")

        deltaTime = 0
        score = 0
        textoScore.innerText = score;
        
    })