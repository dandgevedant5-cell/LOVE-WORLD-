const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const popup = document.getElementById("popup") || {style:{}, innerText:""};
const bgm = document.getElementById("bgm");
const chime = document.getElementById("chime");

if(bgm) bgm.volume = 0.3;

const TILE = 64;

/* ===== START SCREEN ===== */

let gameStarted = false;

function drawStart(){
  ctx.fillStyle = "#201512";
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = "#fff";
  ctx.font = "26px monospace";
  ctx.textAlign = "center";
  ctx.fillText("Our Little World", canvas.width/2, canvas.height/2);
  ctx.fillText("Press Any Key", canvas.width/2, canvas.height/2+40);
}

addEventListener("keydown",()=>{
  if(!gameStarted){
    gameStarted = true;
    if(bgm) bgm.play().catch(()=>{});
  }
});

/* ===== IMAGE LOADER ===== */

function load(src){
  const i = new Image();
  i.src = src;
  i.onerror = ()=>console.log("Missing:", src);
  return i;
}

const IMG = {
  tiles: load("assets/tiles.png"),
  house: load("assets/house.png"),
  cafe: load("assets/cafe.png"),
  bench: load("assets/bench.png"),
  arcade: load("assets/arcade.png"),
  tree: load("assets/tree.png"),
  gate: load("assets/gate.png"),
  heart: load("assets/heart.png"),
  player: load("assets/player.png")
};

/* ===== MAP ===== */

const map = [
"################",
"#H.....T......#",
"#..##.....A...#",
"#T....##......#",
"#....C.....T..#",
"#B......##....#",
"#....T........#",
"#G............#",
"################"
];

/* ===== PLAYER ===== */

const player = {x:1,y:1};
const keys = {};

onkeydown=e=>keys[e.key]=true;
onkeyup=e=>keys[e.key]=false;

function walkable(x,y){
  return map[y] && map[y][x] !== "#";
}

/* ===== UPDATE ===== */

function update(){
  if(!gameStarted) return;

  let nx=player.x, ny=player.y;
  if(keys.ArrowUp) ny--;
  if(keys.ArrowDown) ny++;
  if(keys.ArrowLeft) nx--;
  if(keys.ArrowRight) nx++;

  if(walkable(nx,ny)){
    player.x=nx;
    player.y=ny;
  }
}

/* ===== DRAW ===== */

function draw(){
  if(!gameStarted){
    drawStart();
    return;
  }

  ctx.clearRect(0,0,canvas.width,canvas.height);

  for(let y=0;y<map.length;y++){
    for(let x=0;x<map[y].length;x++){
      if(map[y][x]==="#"){
        ctx.fillStyle="#3a2a24";
        ctx.fillRect(x*TILE,y*TILE,TILE,TILE);
      } else {
        ctx.fillStyle="#5a4036";
        ctx.fillRect(x*TILE,y*TILE,TILE,TILE);
      }
    }
  }

  if(IMG.player.complete){
    ctx.drawImage(IMG.player, player.x*TILE+8, player.y*TILE+8, 48,48);
  } else {
    ctx.fillStyle="yellow";
    ctx.fillRect(player.x*TILE+16, player.y*TILE+16, 32,32);
  }
}

/* ===== LOOP ===== */

function loop(){
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
