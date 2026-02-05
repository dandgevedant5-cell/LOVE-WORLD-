const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const popup = document.getElementById("popup");
const bgm = document.getElementById("bgm");
const chime = document.getElementById("chime");

bgm.volume = 0.35;
bgm.play().catch(()=>{});

const TILE = 64;
const W = canvas.width / TILE;
const H = canvas.height / TILE;

/* ========= LOAD IMAGES ========= */

function img(src){
  const i = new Image();
  i.src = src;
  return i;
}

const IMG = {
  tiles: img("assets/tiles.png"),
  house: img("assets/house.png"),
  cafe: img("assets/cafe.png"),
  bench: img("assets/bench.png"),
  arcade: img("assets/arcade.png"),
  tree: img("assets/tree.png"),
  gate: img("assets/gate.png"),
  heart: img("assets/heart.png"),
  player: img("assets/player.png")
};

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
const keys = {};

addEventListener("keydown",e=>keys[e.key]=true);
addEventListener("keyup",e=>keys[e.key]=false);

/* ========= HELPERS ========= */

function popupMsg(t){
  popup.innerText = t;
  popup.style.display = "block";
  clearTimeout(popupMsg.t);
  popupMsg.t = setTimeout(()=>popup.style.display="none", 3600);
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
      chime.play();
      popupMsg(h.msg);
    }
  });
}

/* ========= DRAW ========= */

let tick = 0;

function drawTile(x,y){
  ctx.drawImage(IMG.tiles, x, y, TILE, TILE);
}

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

      drawTile(px,py);

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

  /* hearts */
  hearts.forEach(h=>{
    if(h.got) return;
    const bob = Math.sin(tick/10 + h.x)*6;
    ctx.drawImage(
      IMG.heart,
      h.x*TILE+16,
      h.y*TILE+16 + bob,
      32,32
    );
  });

  /* player */
  ctx.drawImage(
    IMG.player,
    player.x*TILE+8,
    player.y*TILE+8,
    48,48
  );

  /* star unlock sky */
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
