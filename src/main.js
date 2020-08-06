import * as Matter from 'matter-js';

var width = 1000
var height = 600

var Engine = Matter.Engine,
  Render = Matter.Render,
  World = Matter.World,
  Events = Matter.Events,
  Bodies = Matter.Bodies;

// create an engine
var engine = Engine.create();
engine.world.gravity.y = 0;

var strike_audio = new Audio("assets/sounds/strike-01.mp3");
var soundtrack = new Audio("assets/sounds/Eleven-Petals.mp3");

soundtrack.loop = true;

soundtrack.play()

var render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    width,
    height,
    pixelRatio: 1,
    background: '#222',
    wireframeBackground: '#222',
    enabled: true,
    wireframes: false,
    showVelocity: false,
    showAngleIndicator: false,
    showCollisions: true
  }
});

//add the walls
var offset = 5;
World.add(engine.world, [
  Bodies.rectangle(width / 2, -offset, width + 2 * offset, 50, {
    isStatic: true
  }),
  Bodies.rectangle(width / 2, height + offset, width + 2 * offset, 50, {
    isStatic: true
  }),
  Bodies.rectangle(width + offset, 300, 50, height + 2 * offset, {
    isStatic: true
  }),
  Bodies.rectangle(-offset, 300, 50, width + 2 * offset, {
    isStatic: true
  })
]);

// add some ramps to the world for the bodies to roll down
World.add(engine.world, [
  //Bodies.rectangle(200, 150, 700, 20, { isStatic: true, angle: Math.PI * 0.06 }),
  Bodies.circle(width / 2, height / 2, 50, {
    isStatic: true,
    angle: -Math.PI * 0.1
  })
]);

//adds some shapes
var opponent = Bodies.polygon(400, 200, 5, 25, {
  friction: 1,
});

World.add(engine.world, opponent);

//add the player
var player = Bodies.polygon(100, 100, 5, 25, {
  friction: 1,
  density: 0.001,
});

//populate world
World.add(engine.world, player);

//looks for key presses and logs them
var keys = [];
document.body.addEventListener("keydown", function(e) {
  keys[e.keyCode] = true;
});
document.body.addEventListener("keyup", function(e) {
  keys[e.keyCode] = false;
});

//at the start of a colision for player
Events.on(engine, "collisionStart", function(event) {
  var pairs = event.pairs
  for (var i = 0, j = pairs.length; i != j; ++i) {
    var pair = pairs[i];
    if (pair.bodyA === player) {
      player.ground = true;
    } else if (pair.bodyB === player) {
      player.ground = true;
    }
  }

});
//ongoing checks for collisions for player
Events.on(engine, "collisionActive", function(event) {
  var pairs = event.pairs
  for (var i = 0, j = pairs.length; i != j; ++i) {
    var pair = pairs[i];
    if (pair.bodyA === player) {
      player.ground = true;
    } else if (pair.bodyB === player) {
      player.ground = true;
    }
  }
});
//at the end of a colision for player
Events.on(engine, 'collisionEnd', function(event) {
  var pairs = event.pairs;
  for (var i = 0, j = pairs.length; i != j; ++i) {
    var pair = pairs[i];
    if (pair.bodyA === player) {
      player.ground = false;
    } else if (pair.bodyB === player) {
      player.ground = false;
    }
  }

  var { bodyA, bodyB } = event.pairs[0]
  // console.log(Math.pow(normal.x, 2) + Math.pow(normal.y, 2))

  if(event.pairs[0].bodyA.label === "Polygon Body" &&
    event.pairs[0].bodyB.label === "Polygon Body"
  ){
    console.log(event.pairs[0].collision.depth)
    strike_audio.volume = Math.min(event.pairs[0].bodyA.angularSpeed + event.pairs[0].bodyB.angularSpeed, 1);
    strike_audio.currentTime = 0;
    strike_audio.play();
  }
})

//main engine update loop
Events.on(engine, "beforeTick", function(event) {
  if(opponent.angularVelocity < 0.6){
    opponent.torque = 0.1;
  }

  if (keys[32]) {console.log(player)};
  //jump
  if (keys[87]) {
    player.force = {      x: 0,      y: -0.002    };
  }
  if (keys[83]) {
    player.force = {      x: 0,      y: 0.002    };
  }
  if (keys[68]) {
    player.force = {      x: 0.002,      y: 0    };
  }
  if (keys[65]) {
    player.force = {      x: -0.002,      y: 0    };
  }

  //spin left and right
  if (keys[37] && player.angularVelocity > -0.6) {
    player.torque = -0.1;
    opponent.torque = -0.1;
  } else {
    if (keys[39] && player.angularVelocity < 0.6) {
      player.torque = 0.1;
      opponent.torque = 0.1;
    }
  }
});

var playerGround = false;
Events.on(engine, "collisionStart", function(event) {
  //console.log(event.pairs)
  //var x = event.pairs[0].activeContacts[0].vertex.x
  //var y = event.pairs[0].activeContacts[0].vertex.y
  playerGround = true
  var { bodyA, bodyB } = event.pairs[0]

  if(event.pairs[0].bodyA.label === "Polygon Body" &&
    event.pairs[0].bodyB.label === "Polygon Body"
  ){
    strike_audio.volume = Math.min(event.pairs[0].bodyA.angularSpeed + event.pairs[0].bodyB.angularSpeed, 1);
    strike_audio.currentTime = 0;
    strike_audio.play();
  }
});

// run the engine
Engine.run(engine);

// run the renderer
Render.run(render);