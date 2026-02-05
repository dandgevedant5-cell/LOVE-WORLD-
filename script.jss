const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const popup = document.getElementById("popup");
const bgm = document.getElementById("bgm");
const chime = document.getElementById("chime");

const TILE = 64;

/* ========= SAFE AUDIO START ========= */

document.addEventListener("click", () => {
  bgm.volume = 0.35;
  bgm.play().catch(()=>{});
}, { once:true });

/* ========= IMAGE LOADER ========= */

function loadImages(sources, callback){
  const images = {};
  let loaded = 0;
  const keys = Object.keys(sources);

  keys.forEach(k=>{
    images[k] = new Image();
    images[k].src = sources[k];
    images[k].onload = () => {
      loaded++;
      if(loaded === keys.length) callback(images);
    };
  });

  return images;
}

const IMG = loadImages({
  tiles: "assets/tiles.png",
  house: "assets/house.png",
  cafe: "assets/cafe.png",
  bench: "assets/bench.png",
  arcade: "assets/arcade.png",
  tree: "assets/tree.png",
  gate: "assets/gate.png",
  heart: "assets/heart.png",
  player: "assets/player.png"
}, startGame);

/* ========= MAP ========= */

const map = [
"################",
"#..H....T..A...#",
"#......T.......#",
"#..C...........#",
"#......B.......#",
"#..TT..........#",
"#.........G....#",
"#..............#",
"#..............#",
"################"
];

const memories = {
  H: "Home — where comfort lives.",
  C: "Café — warm drinks, warmer moments.",
  B: "Bench — long talks and quiet smiles.",
  A: "Arcade — chaos + laughter combo.",
  G: "The hill gate is locked. Find every heart."
};

/* ========= HEARTS ========= */

const hearts = [
  {x:5,y:1,msg:"You are my favorite notification."},
  {x:10,y:2,msg:"Achievement: stole my heart."},
  {x:3,y:6,msg:"Side quest: stay together."},
  {x:12,y:4,msg:"Critical hit: charm."},
];

let heartsFound = 0;

/* ========= PLAYER ========= */

const player = {x:1,y:1};
const keysDown = {};

addEventListener("keydown",e=>keysDown[e.key]=true);
addEventListener("keyup",e=>keysDown[e.key]=false);

/* ========= HELPERS ========= */

function popupMsg(t){
  popup.innerText = t;
  popup.style.display = "block";
  clearTimeout(popupMsg.t);
  popupMsg.t = setTimeout(()=>popup.style.display="none", 3600);
}

function walkable(x,y){
  if(!map[y] || !map[y][x]) return false;
  return map[y][x] !== "#";
}

/* ========= GAME START AFTER IMAGES LOAD ========= */

function startGame(){

let tick = 0;

/* ========= UPDATE ========= */

function update(){
  let nx=player.x, ny=player.y;

  if(keysDown.ArrowUp) ny--;
  else if(keysDown.ArrowDown) ny++;
  else if(keysDown.ArrowLeft) nx--;
  else if(keysDown.ArrowRight) nx++;

  if(walkable(nx,ny)){
    player.x = nx;
    player.y = ny;
  }

  const t = map[player.y][player.x];

  if(memories[t]){
    if(t==="G" && heartsFound < hearts.length){
      popupMsg(memories.G);
    } else if(t==="G"){
      popupMsg("Hill unlocked — love you, always.");
    } else {
      popupMsg(memories[t]);
    }
  }

  hearts.forEach(h=>{
    if(!h.got && h.x===player.x && h.y===player.y){
      h.got = true;
      heartsFound++;
      chime.currentTime = 0;
      chime.play().catch(()=>{});
      popupMsg(h.msg);
    }
  });
}

/* ========= DRAW ========= */

function draw(){
  tick++;
  ctx.clearRect(0,0,canvas.width,canvas.height);

  for(let y=0;y<map.length;y++){
    for(let x=0;x<map[y].length;x++){
      const px=x*TILE, py=y*TILE;
      const t = map[y][x];

      if(t==="#"){
        ctx.fillStyle="#4a332c";
        ctx.fillRect(px,py,TILE,TILE);
        continue;
      }

      ctx.drawImage(IMG.tiles, px, py, TILE, TILE);

      if(t==="H") ctx.drawImage(IMG.house, px, py, TILE, TILE);
      if(t==="C") ctx.drawImage(IMG.cafe, px, py, TILE, TILE);
      if(t==="B") ctx.drawImage(IMG.bench, px, py, TILE, TILE);
      if(t==="A") ctx.drawImage(IMG.arcade, px, py, TILE, TILE);
      if(t==="G") ctx.drawImage(IMG.gate, px, py, TILE, TILE);

      if(t==="T"){
        const sway = Math.sin(tick/15 + x)*3;
        ctx.drawImage(IMG.tree, px, py+sway, TILE, TILE);
      }
    }
  }

  hearts.forEach(h=>{
    if(h.got) return;
    const bob = Math.sin(tick/10 + h.x)*6;
    ctx.drawImage(IMG.heart, h.x*TILE+16, h.y*TILE+16 + bob, 32,32);
  });

  ctx.drawImage(IMG.player, player.x*TILE+8, player.y*TILE+8, 48,48);

  if(heartsFound === hearts.length){
    for(let i=0;i<40;i++){
      ctx.fillStyle="white";
      ctx.fillRect((i*53)%canvas.width, (i*97)%200, 2,2);
    }
  }
}

/* ========= LOOP ========= */

function loop(){
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();

}
