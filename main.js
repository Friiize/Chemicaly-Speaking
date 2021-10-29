//HTML VARIABLES
let canvas = document.querySelector("canvas");
let ctx = canvas.getContext("2d");
let btnChaudron = document.getElementById('btnChaudron');
let btnPlay = document.getElementById('btnPlay');
let scoreTxt = document.getElementById('score');
///ARRAYS
let potions = [];
let imgBank = ["greenPot.png", "orangePot.png", "pinkPot.png", "redPot.png"];
let chaudrons = [];
let potionImgs = [];
///VARs
let fps = 144;
let score = 0;
let speed = 1;
let slctdChaudron = 0;
let isReady = false;
/// Imgs
initArrayPotion();
let chaudron = new Image();
let cat = new Image();

//CONFIG
canvas.height = window.innerHeight - 30;
canvas.width = window.innerWidth / 3;
chaudron.src = "chaudronC.png";
cat.src = "blackCat.png";


//CLASS MODELS
class Player {
    constructor() {
        this.x = canvas.width / 1000;
        this.y = canvas.height - 100;
        this.width = 50;
        this.height = 100;
    }

    draw() {
        ctx.drawImage(cat, 0, 0, 981, 745, this.x, this.y, this.width, this.height);
    }
}

class Potion {
    constructor() {
        this.x = 64 + (Math.random() * (canvas.width - 192));
        this.y = -20;
        this.src = potionImgs[Math.floor(Math.random() * 4)];
        this.points = 25;
    }

    draw() {
        ctx.drawImage(this.src, 0, 0, 512, 512, this.x, this.y, 64, 64);
    }

    move() {
        this.y += speed;
    }
}

class Chaudron {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.posYs = [canvas.height - 100, canvas.height - 200, canvas.height - 300];
        this.src = chaudron;
        this.left = false;
        this.right = false;
        this.recipies = [];
        this.badRecipies = [];
        this.score = 0;
        this.timer = 7000;
    }

    draw() {
        ctx.drawImage(this.src, 0, 0, 512, 512, this.x, this.y, 96, 96);
    }
}

//INIT
document.addEventListener("keydown", onKeyDownHandler);
btnChaudron.addEventListener("click", spawnChaudron);
btnChaudron.addEventListener("contextmenu", deleteChaudron);
btnPlay.addEventListener("mousedown", () => {
    isReady ? isReady = false : isReady = true
})

setInterval(update, 1000/ fps);
setInterval(spawnPotion, 1000);
let player = new Player();

//MAIN
function initArrayPotion() {
    for (let i = 0; i < 4; i++) {
        let potionImg = new Image();
        potionImg.src = imgBank[i];
        potionImgs.push(potionImg);
    }
}

function spawnPotion() {
    let potion = new Potion();
    potions.push(potion);
}

function spawnChaudron() {
    if (chaudrons.length <= 2) {
        let chaudron = new Chaudron();

        chaudron.x = 64 + (Math.random() * (canvas.width - 192));

        chaudrons.length === 0 ? chaudron.y = chaudron.posYs[0] : chaudron.y = chaudrons[0].posYs[chaudrons.length];

        chaudrons.length === 2 ? btnChaudron.value = "Maximum atteint !" : btnChaudron.value = "Ajout d'un chaudron";

        chaudrons.push(chaudron);
    }
}

function deleteChaudron() {
    if (chaudrons[0] !== undefined) {
        btnChaudron.value = "Suppression d'un chaudron";
        chaudrons.pop();
    }
    else if (chaudrons[0] === undefined) {
        btnChaudron.value = "Pas de chaudron";
    }
}

function update () {
    if (isReady) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        btnChaudron.disabled = true;
        btnPlay.value = "Pause";
        playerUpdate();
        potionUpdate();
        chaudronUpdate();
        scoreUpdate();
    }
}

function potionUpdate() {
    for (let i = 0; i < potions.length; i++) {
        if (potions.length < 20) {
            potions[i].draw();
            potions[i].move();
        }
        else if (potions.length >= 20) {
            potions.shift();
        }
    }
}

function chaudronUpdate() {
    if (chaudrons[0] !== undefined) {
        for (let i = 0; i < chaudrons.length; i++) {
            chaudrons[i].draw();
            chaudrons[i].y === player.y ? chaudronXHandler(i) : null;
            chaudrons[i].left = false;
            chaudrons[i].right = false;
        }
    } 
    else {
        isReady = false;
        btnPlay.disabled = true;
    }
}

function collisionUpdate(chaudron, i) {
    for (let j = 0; j < potions.length; j++) {
        let potion = potions[j];
        let nbRecipies = chaudron.recipies.length;

        if ((potion.x + 32 >= chaudron.x) && (potion.x + 32 <= chaudron.x + 96) && (potion.y + 64 === chaudron.y + 32)) {
            chaudron.timer = 5;
            if (chaudron.recipies[0] === undefined) {
                chaudron.score += potion.points;
                chaudron.recipies.push(potion);
            }
            else if (potion.src.src !== chaudron.recipies[nbRecipies - 1].src.src) {
                chaudron.score += potion.points;
                chaudron.recipies.push(potion);
            }
            else if (potion.src.src === chaudron.recipies[nbRecipies - 1].src.src) {
                chaudron.badRecipies.push(potion);
            }
            chaudron.badRecipies.length >= 1 ? scoreComboHandler(i, chaudron) : null;
            potions.splice(j, 1);
            i--;
            j--;
        }
    }
}

function scoreUpdate() {
    for (let i = 0; i < chaudrons.length; i++) {
        score += chaudron.score;
    }
    scoreTxt.value = `Score : ${score}`;
}

function scoreComboHandler(i, chaudron) {
    score += chaudron.score * chaudron.recipies.length;
    chaudrons.splice(i,1);
}

function playerUpdate() {
    player.draw();
}

function onKeyDownHandler(e) {
    if (isReady) {
        switch (e.keyCode) {
            case 37: player.x = canvas.width / 1000; chaudrons[slctdChaudron].left = true; break;
            case 38: player.y > canvas.height - 300 ? player.y -= 100 : null; break;
            case 39: player.x = canvas.width - 50; chaudrons[slctdChaudron].right = true; break;
            case 40: player.y < canvas.height - 100 ? player.y += 100 : null; break;
        }
    }
}

function chaudronXHandler (i) {
    slctdChaudron = i;

    if (chaudrons[i].timer > 0) {
        chaudrons[i].timer--;
    } 
    else if (chaudrons[i].timer === 0) {
        chaudrons[i].recipies.splice(0, chaudrons[i].recipies.length - 1);
    }

    collisionUpdate(chaudrons[i], i);

    if (chaudrons[i].left) {
        chaudrons[i].vx -= speed * 10;
    }
    else if (chaudrons[i].right) {
        chaudrons[i].vx += speed * 10;
    }
    else {
        chaudrons[i].vx = 0;
    }

    chaudrons[i].x >= (player.x + player.width) || chaudrons[i].x <= (player.x - player.width * 2) ? chaudrons[i].x += chaudrons[i].vx : null;
}