const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const popup = document.getElementById("popup");
const bgm = document.getElementById("bgm");
const chime = document.getElementById("chime");

bgm.volume = 0.35;
addEventListener("keydown", () => bgm.play().catch(()=>{}), {once:true});

const TILE = 64;

/* ========= IMAGE LOADER ========= */

function load(src){
  const i = new Image();
  i.src = src;
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

/* ========= MAP (non straight layout) ========= */

const map = [
"################",
"#H..T.....A....#",
"#..TT......T...#",
"#......C.......#",
"#..T.......T...#",
"#......B.......#",
"#....T.....TT..#",
"#.....T........#",
"#....G.........#",
"################"
];

/* ========= MESSAGES ========= */

const memories = {
  H:"Home — our safe cozy place.",
  C:"Café — where time feels warm.",
  B:"Bench — talks I never forget.",
  A:"Arcade — you + me = chaos 😂",
  G:"Hill is locked — collect all hearts ❤️"
};

/* ========= HEARTS ========= */

const hearts = [
  {x:5,y:1,msg:"You are my favorite notification."},
  {x:10,y:2,msg:"Achievement unlocked: stole my heart."},
  {x:3,y:6,msg:"Side quest: stay together forever."},
  {x:12,y:4,msg:"Critical hit: charm overload."},
];

let heartsFound = 0;

/* ========= PLAYER ========= */

const player = {x:1,y:1};
const keys = {};

addEventListener("keydown",e=>keys[e.key]=true);
addEventListener("keyup",e=>keys[e.key]=false);

/* ========= HELPERS ========= */

function popupMsg(t){
  popup.innerText = t;
  popup.style.display = "block";
  clearTimeout(popupMsg.t);
  popupMsg.t = setTimeout(()=>popup.style.display="none", 3200);
}

function walkable(x,y){
  return map[y][x] !== "#";
}

/* ========= UPDATE ========= */

function update(){
  let nx=player.x, ny=player.y;

  if(keys.ArrowUp) ny--;
  if(keys.ArrowDown) ny++;
  if(keys.ArrowLeft) nx--;
  if(keys.ArrowRight) nx++;

  if(map[ny] && map[ny][nx] && walkable(nx,ny)){
    player.x = nx;
    player.y = ny;
  }

  const t = map[player.y][player.x];

  if(memories[t]){
    if(t==="G" && heartsFound === hearts.length){
      popupMsg("Hill unlocked — love you always 🌙");
    } else if (t==="G"){
      popupMsg(memories.G);
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

let tick = 0;

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

      if(IMG.tiles.complete)
        ctx.drawImage(IMG.tiles, px, py, TILE, TILE);

      if(t==="H" && IMG.house.complete)
        ctx.drawImage(IMG.house, px, py, TILE, TILE);

      if(t==="C" && IMG.cafe.complete)
        ctx.drawImage(IMG.cafe, px, py, TILE, TILE);

      if(t==="B" && IMG.bench.complete)
        ctx.drawImage(IMG.bench, px, py, TILE, TILE);

      if(t==="A" && IMG.arcade.complete)
        ctx.drawImage(IMG.arcade, px, py, TILE, TILE);

      if(t==="G" && IMG.gate.complete)
        ctx.drawImage(IMG.gate, px, py, TILE, TILE);

      if(t==="T" && IMG.tree.complete){
        const sway = Math.sin(tick/15 + x)*3;
        ctx.drawImage(IMG.tree, px, py+sway, TILE, TILE);
      }
    }
  }

  hearts.forEach(h=>{
    if(h.got) return;
    if(IMG.heart.complete){
      const bob = Math.sin(tick/10 + h.x)*6;
      ctx.drawImage(IMG.heart, h.x*TILE+16, h.y*TILE+16+bob, 32,32);
    }
  });

  if(IMG.player.complete)
    ctx.drawImage(IMG.player, player.x*TILE+8, player.y*TILE+8, 48,48);
}

/* ========= LOOP ========= */

function loop(){
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
