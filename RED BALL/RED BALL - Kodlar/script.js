var ScreenInfo = { height: 500, width: 1000, top: 0, left: 0 };

var screenw = Math.max(
  document.documentElement.clientWidth,
  window.innerWidth || 0
);
var screenh = Math.max(
  document.documentElement.clientHeight,
  window.innerHeight || 0
);

var maxw = ScreenInfo.left + ScreenInfo.width;
var maxh = ScreenInfo.top + ScreenInfo.height;
var minh = ScreenInfo.top;
var minw = ScreenInfo.left;

var gameStarted = false;

var deathCount = 0;

var randomw = function () {
  return Math.floor(Math.random() * (maxw - minw + 1));
};

var randomh = function () {
  return Math.floor(Math.random() * (maxh - minh + 1));
};

var randomhRare = function (size) {
  return Math.floor(Math.random() * (maxh + size - minh + 1));
};

var rareSize = function () {
  return maxh / (1.1 * SCALEFACTOR);
};

var randsize = function () {
  return Math.floor(Math.random() * (MAXSIZE + 1));
};
var randFoeSize = function () {
  return Math.floor(Math.random() * (MAXFOESIZE + 1));
};

var SCALEFACTOR = 10;
var FOEARRAYSIZE = 20;
var FOODARAYSIZE = 10;
var MAXSPEED = 5;
var MAXSIZE = 10;
var MAXFOESIZE = 11;
var MAXREGENDELAY = 400;

var Dot = function (posX, posY, size, color, kind) {
  this.posX = posX;
  this.posY = posY;
  this.size = size;
  this.color = color;
  this.kind = kind;
  this.score = 0;

  this.toString = function () {
    return (
      "[" +
      this.kind +
      ", size: " +
      this.size +
      ", loc: (" +
      this.posX +
      ", " +
      this.posY +
      ")" +
      "]"
    );
  };
};

var Foe = function (posX, posY, size, color, kind, xvel, yvel) {
  Dot.call(this, posX, posY, size, color, kind);
  this.xvel = xvel;
  this.yvel = yvel;
};

Foe.prototype = Object.create(Dot.prototype);

var heroDot = new Dot();

var makeHero = function () {
  heroDot = new Dot(maxw / 2, maxh / 2, 1, "red", "player");
  heroDot.score = 0;
};

var foods = new Array();

var makeFoods = function () {
  foods = new Array();
  for (var i = 0; i < FOODARAYSIZE; i++) {
    foods.push(new Dot(randomw(), randomh(), 1, "teal", "food"));
  }
};

var foes = new Array();

var makeFoes = function () {
  foes = new Array();
  for (var i = 0; i < FOEARRAYSIZE; i++) {
    addRandomFoe();
  }
  console.log("made a new set of foes");
};

Dot.prototype.movedown = function () {
  this.posX = (this.posX + MAXSPEED) % maxw;
  this.posY = (this.posY + Math.sin(2 * Math.PI * (this.posX / 5)) * 4) % maxh;
};

var moveRare = function () {
  rareDot.posX += MAXSPEED;
  if (rareDot.posY > maxh) {
    rareDot.posY -= MAXSPEED;
  }
  if (rareDot.posY < minh) {
    rareDot.posY += MAXSPEED;
  }
};

Dot.prototype.runAway = function () {
  this.posX = this.posX + MAXSPEED * 3;
  this.posY = this.posY + Math.sin(2 * Math.PI * (this.posX / 5)) * 4 * 3;
};

Dot.prototype.moveover = function () {
  this.posX = (this.posX + 0.1) % maxw;
  this.posY = (this.posY + Math.cos(2 * Math.PI * (this.posX / 5)) * 4) % maxh;
};

var isColliding = function (foecheck, foodcheck, rarecheck) {
  if (foecheck) {
    var i = 0;
    for (i = 0; i < foes.length; i++) {
      var adot = foes[i];

      var dist = Math.sqrt(
        (heroDot.posX - adot.posX) * (heroDot.posX - adot.posX) +
          (heroDot.posY - adot.posY) * (heroDot.posY - adot.posY)
      );
      if (
        dist <=
        (adot.size * SCALEFACTOR) / 2 + (heroDot.size * SCALEFACTOR) / 2
      ) {
        if (adot.size > heroDot.size) {
          console.log(
            "Hero " +
              heroDot.toString() +
              " was eaten by foe " +
              adot.toString()
          );
          eatHero();
          console.log("Hero died :(");
          var audio = new Audio("sounds/bomb2.wav");
          audio.play();
        } else {
          adot.eaten = true;
          eatFoe(i);

          var audio = new Audio("sounds/Sonic_Ring.mp3");
          audio.play();
        }
      } else {
      }
    }
  }

  if (foodcheck) {
    var j = 0;
    for (j = 0; j < foods.length; j++) {
      var adot = foods[j];
      var dist = Math.sqrt(
        (heroDot.posX - adot.posX) * (heroDot.posX - adot.posX) +
          (heroDot.posY - adot.posY) * (heroDot.posY - adot.posY)
      );
      if (
        dist <=
        (adot.size * SCALEFACTOR) / 2 + (heroDot.size * SCALEFACTOR) / 2
      ) {
        
        eatFood(j);
        var audio = new Audio("sounds/Sonic_Ring.mp3");
        audio.play();
      } else {
      }
    }
  }

  if (rarecheck) {
    var dist = Math.sqrt(
      (heroDot.posX - rareDot.posX) * (heroDot.posX - rareDot.posX) +
        (heroDot.posY - rareDot.posY) * (heroDot.posY - rareDot.posY)
    );
    //if intersecting with rareDot
    if (
      dist <=
      (rareDot.size * SCALEFACTOR) / 2 + (heroDot.size * SCALEFACTOR) / 2
    ) {
      eatHero();
      rareAteHero = true;
      console.log("rareDot ate hero");
    }
  }
};

var eatFood = function (i) {
  foods.splice(i, 1);
  heroDot.size += 0.5;
  heroDot.score += 1;
};

var eatFoe = function (i) {
  foes.splice(i, 1);
  heroDot.size += 0.5;
  heroDot.score += 1;
  var delay = Math.random(0, MAXREGENDELAY * 2 + 1) - MAXREGENDELAY;
  setTimeout(addRandomFoe, delay);
};

var eatHero = function () {
  circleGame.keepPlaying = false;
};

Dot.prototype.offScreen = function () {
  var radius = (this.size * SCALEFACTOR) / 2;
  return (
    this.posX - radius > maxw ||
    this.posY - radius > maxh ||
    this.posY + radius < minh
  );
};

Foe.prototype.loop = function () {
  var radius = (this.size * SCALEFACTOR) / 2;
  if (
    this.posX - radius > maxw ||
    this.posY - radius > maxh ||
    this.posY + radius < minh
  ) {
    this.regenerate();
  }
};

Foe.prototype.regenerate = function () {
  this.posX = randomw() * -3;
  this.posY = randomh();
};

var addRandomFoe = function () {
  var xdir = Math.random(0, MAXSPEED * 2 + 1) - MAXSPEED;
  var ydir = Math.random(0, MAXSPEED * 2 + 1) - MAXSPEED;
  var size = randFoeSize();
  var color = "black";
  if (size > MAXSIZE) {
    color = "#000026";
  }
  var newfoe = new Foe(
    randomw() * -3,
    randomh(),
    size,
    color,
    "foe",
    xdir,
    ydir
  );
  foes.push(newfoe);
};

var rareDot = new Foe(
  rareSize() * -1.5,
  randomhRare(rareSize()),
  rareSize(),
  "rarePepe",
  "foe",
  Math.random(0, MAXSPEED * 2 + 1) - MAXSPEED,
  Math.random(0, MAXSPEED * 2 + 1) - MAXSPEED
);

var beginFlee = false;
var rareDotLaunched = false;
var rareAteHero = false;
var rareDone = false;

var runAwayAll = function () {
  beginFlee = true;
};

var allFoesOffScreen = function () {
  var allOff = true;
  foes.forEach(function (each) {
    allOff = each.offScreen() && allOff;
  });
  return allOff;
};

var updateGame = function (gameInfo) {
  if (
    !rareDone &&
    !beginFlee &&
    !rareDotLaunched &&
    deathCount == 6 &&
    circleGame.keepPlaying
  ) {
    var maxdelay = 5 * 60 * 1000;
    var mindelay = 2 * 60 * 1000;
    var delay = Math.random() * (maxdelay - mindelay + 1);
    console.log("delay: " + delay);
    setTimeout(runAwayAll, delay);
    rareDotLaunched = true;
  }

  if (allFoesOffScreen() && beginFlee && !rareDone) {
    isColliding(false, true, true);
    if (rareDot.offScreen() || rareAteHero) {
      resetFoes();
      rareDone = true;
      setTimeout(function () {
        beginFlee = false;
      }, 400);
      console.log("-----rareDot has passed");
    } else {
      rareDotLaunched = true;
      moveRare();
    }
  } else if (beginFlee && !allFoesOffScreen() && !rareDone) {
    // console.log("fleeing");
    isColliding(false, true, false);
    foes.forEach(function (each) {
      each.runAway();
    });
  } else {
    foes.forEach(function (each) {
      each.movedown();
      each.loop();
    });

    foods.forEach(function (each) {
      each.moveover();
    });

    isColliding(true, true, false);
  }
};

var drawGame = function (gameInfo) {
  $screen.innerHTML = "";
  drawScore();
  drawHighScore();
  foes.forEach(function (each) {
    each.drawDot();
  });

  foods.forEach(function (each) {
    each.drawDot();
  });
  drawPlayer();

  if (rareDotLaunched && beginFlee) {
    rareDot.drawDot();
  }
};

var $screen = document.querySelector("#field");
$screen.style.backgroundColor = "papayawhip";
$screen.style.width = ScreenInfo.width + "px";
$screen.style.height = ScreenInfo.height + "px";
$screen.style.position = "relative";
$screen.style.top = ScreenInfo.top + "px";
$screen.style.left = ScreenInfo.left + "px";

Dot.prototype.sizing = function (disp) {
  if (this.size > MAXSIZE && this.kind == "player") {
    this.size = MAXSIZE;
  }
  var dispSize = this.size * SCALEFACTOR;
  disp.style.width = dispSize + "px";
  disp.style.height = dispSize + "px";
  disp.style.transform =
    "translateX(-" + dispSize / 2 + "px) translateY(-" + dispSize / 2 + "px)";
  this.size = this.size;
};

Dot.prototype.drawDot = function () {
  var $dot = document.createElement("div");
  $dot.className = this.kind;
  $dot.style.left = this.posX + "px";
  $dot.style.top = this.posY + "px";
  if (this.color == "rarePepe") {
    $dot.id = this.color;
  } else {
    $dot.style.backgroundColor = this.color;
  }

  $screen.appendChild($dot);
  this.sizing($dot);
};

var drawPlayer = function () {
  var $p1 = document.createElement("div");
  $p1.id = "player1";
  $p1.setAttribute("id", "player1");
  $p1.style.left = heroDot.posX + "px";
  $p1.style.top = heroDot.posY + "px";
  $p1.style.backgroundColor = heroDot.color;
  heroDot.sizing($p1);

  $screen.appendChild($p1);
};

var $quitB = document.querySelector("#quit-button");
var $startB = document.querySelector("#start-button");
var drawUI = function () {
  $quitB.innerHTML = "BİTİR";
  $startB.innerHTML = "BAŞLA";
};

var pressStart = function () {
  if (!gameStarted) {
    startGame();
    $screen.style.cursor = "none";
  }
};

var pressQuit = function () {
  if (gameStarted) {
    gameStarted = false;
    circleGame.keepPlaying = false;
    $screen.style.cursor = "default";
  }
};

var $soundControl = document.getElementById("music");
document.getElementById("soundon").style.display = "block";
document.getElementById("soundoff").style.display = "none";
$soundControl.addEventListener("click", function (ev) {
  if (document.getElementById("player").muted == true) {
    document.getElementById("player").muted = false;

    document.getElementById("soundon").style.display = "block";
    document.getElementById("soundoff").style.display = "none";
  } else {
    document.getElementById("player").muted = true;
    document.getElementById("soundoff").style.display = "block";
    document.getElementById("soundon").style.display = "none";
  }
});

$startB.addEventListener("click", function (event) {
  pressStart();
});

$quitB.addEventListener("click", function (event) {
  pressQuit();
});

window.addEventListener("keypress", function (ev) {
  if (ev.keyCode == "32") {
    document.body.style.backgroundColor = "lavender";
    pressStart();
  } else if (ev.keyCode == "81" || ev.keyCode == "90") {
    document.body.style.backgroundColor = "LightSeaGreen";
  } else {
    document.body.style.backgroundColor = "lavender";
    pressQuit();
  }
});

$screen.addEventListener("mousemove", function (event) {
  heroDot.posX = event.clientX;
  heroDot.posY = event.clientY;
});

var highS = 0;

var drawScore = function () {
  var score = heroDot.score;
  var $points = document.querySelector("#pointn");
  $points.innerHTML = score;
};

var drawHighScore = function () {
  var score = heroDot.score;
  var $highP = document.querySelector("#high-points");

  if (highS <= score) {
    highS = score;
  } else {
    highS = highS;
  }
  $highP.innerHTML = "En Yüksek Skor: " + highS;
};

var Game = function () {
  this.keepPlaying = true;
  var gameInfo = this;

  this.quit = function () {
    this.keepPlaying = false;
  };
};

drawUI();
var circleGame;

var resetFoes = function () {
  foes.length = 0;
  setTimeout(makeFoes, 400);
};

var startGame = function () {
  circleGame = new Game();
  gameStarted = true;
  makeFoods();
  makeHero();
  resetFoes();

  var endGame = function () {
    console.log("OYUN BİTTİ");
    deathCount++;
    gameStarted = false;
    var $end = document.createElement("div");
    $end.className = "gameOver";
    $end.setAttribute("className", "gameOver");
    $end.innerHTML = "YANDIN..";

    if (deathCount == 5) {
      $end.id = "angryPepe";
      $end.setAttribute("id", "angryPepe");
      $end.innerHTML = "OYUN BİTTİ";
    }

    $screen.appendChild($end);
    $screen.style.cursor = "default";
  };

  var mainLoop = function () {
    if (circleGame.keepPlaying && gameStarted) {
      updateGame(circleGame);
      drawGame(circleGame);
      window.setTimeout(mainLoop, 20);
    } else {
      endGame();
    }
  };

  mainLoop();
};
