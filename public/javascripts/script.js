const ws = new WebSocket("ws://lisa.com:4143/subscriptions", "graphql-ws")

ws.onopen = function () {
  console.log("Socket Open")
  ws.send(`{"type":"connection_init"}`)
  ws.send('{"type": "start", "payload":{"query":"subscription { command { type value }}"}}')
};

ws.onmessage = function (e) {
  let response = JSON.parse(e.data)
  if (response.type == "error") {
    console.log(data.payload.message)
  }
  else if (response.type == "data") {
    PLAYER_COMMANDS.push(response.payload.data.command)
  }
}
const PLAYER_COMMANDS = []

const DIRECTION_MAP = [
  { Y: 1, X: 0 }, // DOWN
  { Y: 0, X: -1 }, // LEFT
  { Y: -1, X: 0 }, // UP
  { Y: 0, X: 1 }, // RIGHT
]

const WORLD_MAP = {
  width: 18,
  height: 10,
  tile_width: Math.floor(window.screen.width / 18),
  tile_height: Math.floor(window.screen.height / 10),
  tiles: [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0,
    0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0,
    0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0,
    0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ],
  graphics: []
}

class Keyboard {
  constructor() {
    this.pressed = {}
    this.latest = undefined
  }

  watch(el) {
    el.addEventListener('keydown', (e) => {
      this.pressed[e.key.toLowerCase()] = true
      this.latest = e.key.toLowerCase()
    })
    el.addEventListener('keyup', (e) => {
      this.pressed[e.key.toLowerCase()] = false
    })
  }
}

class Player {
  size = 50
  speed = 10
  color = 0xDC143C
  direction = 2

  constructor() {

    this.pixi = new PIXI.Graphics()
    this.position = {
      x: 500,
      y: 500
    }
  }

  render() {
    this.handler()
    this.updatePosition()

    this.pixi.clear()
    this.pixi.beginFill(this.color)
    this.pixi.drawRect(this.position.x, this.position.y, this.size, this.size)
    this.pixi.endFill()
  }

  updatePosition() {
    var new_x = this.position.x + DIRECTION_MAP[this.direction].X * this.speed
    var new_y = this.position.y + DIRECTION_MAP[this.direction].Y * this.speed

    if (new_x < 0) {
      new_x = 0
    } else if (new_x > app.screen.width - this.size) {
      new_x = app.renderer.screen.width - this.size
    }

    if (new_y < 0) {
      new_y = 0
    } else if (new_y > app.screen.height - this.size) {
      new_y = app.renderer.screen.height - this.size
    }

    var tile_1, tile_2
    if (this.direction == 0) {
      // DOWN
      tile_1 = Math.floor((new_y + this.size) / WORLD_MAP.tile_height) * WORLD_MAP.width + Math.floor(new_x / WORLD_MAP.tile_width)
      tile_2 = Math.floor((new_y + this.size) / WORLD_MAP.tile_height) * WORLD_MAP.width + Math.floor((new_x + this.size - 2) / WORLD_MAP.tile_width)

      if (WORLD_MAP.tiles[tile_1] || WORLD_MAP.tiles[tile_2]) {
        new_y = Math.floor(tile_1 / WORLD_MAP.width) * WORLD_MAP.tile_height - this.size
      }
    } else if (this.direction == 1) {
      // LEFT
      tile_1 = Math.floor((new_y) / WORLD_MAP.tile_height) * WORLD_MAP.width + Math.floor(new_x / WORLD_MAP.tile_width)
      tile_2 = Math.floor((new_y + this.size - 2) / WORLD_MAP.tile_height) * WORLD_MAP.width + Math.floor((new_x) / WORLD_MAP.tile_width)

      if (WORLD_MAP.tiles[tile_1] || WORLD_MAP.tiles[tile_2]) {
        new_x = (tile_1 % WORLD_MAP.width) * WORLD_MAP.tile_width + WORLD_MAP.tile_width
      }
    } else if (this.direction == 2) {
      // UP
      tile_1 = Math.floor((new_y) / WORLD_MAP.tile_height) * WORLD_MAP.width + Math.floor(new_x / WORLD_MAP.tile_width)
      tile_2 = Math.floor((new_y) / WORLD_MAP.tile_height) * WORLD_MAP.width + Math.floor((new_x + this.size - 2) / WORLD_MAP.tile_width)

      if (WORLD_MAP.tiles[tile_1] || WORLD_MAP.tiles[tile_2]) {
        new_y = Math.floor(tile_1 / WORLD_MAP.width) * WORLD_MAP.tile_height + WORLD_MAP.tile_height
      }
    } else if (this.direction == 3) {
      // RIGHT
      tile_1 = Math.floor((new_y) / WORLD_MAP.tile_height) * WORLD_MAP.width + Math.floor((new_x + this.size) / WORLD_MAP.tile_width)
      tile_2 = Math.floor((new_y + this.size - 2) / WORLD_MAP.tile_height) * WORLD_MAP.width + Math.floor((new_x + this.size) / WORLD_MAP.tile_width)

      if (WORLD_MAP.tiles[tile_1] || WORLD_MAP.tiles[tile_2]) {
        new_x = (tile_1 % WORLD_MAP.width) * WORLD_MAP.tile_width - this.size
      }
    }
    this.position.x = new_x
    this.position.y = new_y
  }

  turn(_direction) {

    this.direction = (this.direction + _direction + 4) % 4
  }

  handler() {
    this.keypressHandler()
    this.commandHandler()
  }

  keypressHandler() {

    if (keyboard.latest == 'f') {
      this.turn(-1)
    } else if (keyboard.latest == 'j') {
      this.turn(1)
    }

    keyboard.latest = undefined
  }

  commandHandler() {

    if (PLAYER_COMMANDS.length > 0) {
      let command = PLAYER_COMMANDS.pop()
      if (command.type == "turn") {
        let turnMap = {
          "left": -1,
          "right": 1
        }

        this.turn(turnMap[command.value])
      }
    }
  }
}

const keyboard = new Keyboard()
const app = new PIXI.Application({ backgroundColor: 0xFFFFFF, antialias: true });

keyboard.watch(document)
document.body.appendChild(app.view)

const TILES = []
for (var i = 0; i < WORLD_MAP.tiles.length; i++) {
  if (WORLD_MAP.tiles[i]) {
    x = (i % WORLD_MAP.width) * WORLD_MAP.tile_width
    y = Math.floor(i / WORLD_MAP.width) * WORLD_MAP.tile_height

    console.log(x, y)
    var temp = new PIXI.Graphics()
    temp.beginFill(0x000000)
    temp.drawRect(x, y, WORLD_MAP.tile_width, WORLD_MAP.tile_height)
    temp.endFill()

    WORLD_MAP.graphics.push(temp)
  }
}

for (var i in WORLD_MAP.graphics) {
  app.stage.addChild(WORLD_MAP.graphics[i])
}

const player = new Player()
app.stage.addChild(player.pixi)

app.ticker.add(() => {
  player.render()
});


// Listen for window resize events
window.addEventListener('resize', resize)

// Resize function window
function resize() {
  // Resize the renderer
  app.renderer.resize(window.innerWidth, window.innerHeight)
}

resize()