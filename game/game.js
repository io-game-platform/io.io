var config = {
    type: Phaser.WEBGL,
    width: 800,
    height: 600,
    backgroundColor: '#2d2d2d',
    parent: 'phaser-example',
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};


// Constants
var center_x = 400;
var center_y = 300;
var maxBots = 50;
var maxPlayers = 3;
var reloadTime = 500;

//
var bullets1;
var bots;
var players;
var player_main;
var speed;
var stats;
var reloadingUntil = 0;
var isDown = false;
var mouseX = 0;
var mouseY = 0;

var game = new Phaser.Game(config);


var Bullet = new Phaser.Class({

    Extends: Phaser.GameObjects.Image,

    initialize:

    function Bullet (scene)
    {
        Phaser.GameObjects.Image.call(this, scene, 0, 0, 'bullet1');

        this.incX = 0;
        this.incY = 0;
        this.lifespan = 0;

        this.speed = Phaser.Math.GetSpeed(600, 1);
    },

    fire: function (x, y, init_x, init_y)
    {
        this.setActive(true);
        this.setVisible(true);

        //  Bullets fire from the middle of the screen to the given x/y
        this.setPosition(init_x, init_y);

        var angle = Phaser.Math.Angle.Between(x, y, init_x, init_y);

        this.setRotation(angle);

        this.incX = Math.cos(angle);
        this.incY = Math.sin(angle);

        this.lifespan = 1000;
    },

    update: function (time, delta)
    {
        this.lifespan -= delta;

        this.x -= this.incX * (this.speed * delta);
        this.y -= this.incY * (this.speed * delta);

        if (this.lifespan <= 0)
        {
            this.setActive(false);
            this.setVisible(false);
        }
    }
});


var Ship = new Phaser.Class({

    Extends: Phaser.GameObjects.Image,

    initialize: function Ship (scene)
    {
        Phaser.GameObjects.Image.call(this, scene, 0, 0, 'ship');
        this.setDepth(1)
    },

    spawn: function ()
    {
        this.setActive(true);
        this.setVisible(true);

        this.setPosition(Phaser.Math.RND.integerInRange(0, 800), Phaser.Math.RND.integerInRange(0, 600));
        this.setRotation(Phaser.Math.Angle.Random());
    }
});


var Player = new Phaser.Class({

    Extends: Ship,

    initialize: function Player (scene)
    {
        Phaser.GameObjects.Image.call(this, scene, 0, 0, 'ship');
        this.setDepth(2)
    },

    spawn: function ()
    {
        this.setActive(true);
        this.setVisible(true);

        this.setPosition(center_x, center_y);
    }
});


function spawn_bots (n)
{
    var i;
    for (i = 0; i < n; i++) {
        var bot = bots.get();
        bot.spawn();
    }
}


function preload ()
{
    this.load.image('ship', 'assets/sprites/ship.png');
    this.load.image('bullet1', 'assets/sprites/bullets/bullet11.png');
}


function create ()
{
    //////////////////////
    //  Declarations    //
    //////////////////////

    this.input.on('pointerdown', function (pointer) {
        isDown = true;
        mouseX = pointer.x;
        mouseY = pointer.y;
    });

    this.input.on('pointermove', function (pointer) {
        mouseX = pointer.x;
        mouseY = pointer.y;
    });

    this.input.on('pointerup', function (pointer) {
        isDown = false;
    });

    //////////////////////
    //  ONE-TIME SETUP  //
    //////////////////////

    bullets1 = this.add.group({
        classType: Bullet,
        maxSize: 50,
        runChildUpdate: true
    });

    bots = this.add.group({
        classType: Ship,
        maxSize: maxBots,
        runChildUpdate: true
    });

    players = this.add.group({
        classType: Player,
        maxSize: maxPlayers,
        runChildUpdate: true
    });

    /////////////
    //  SPAWN  //
    /////////////

    player_main = players.get();
    player_main.spawn();

    spawn_bots(5);
}

function update (time, delta)
{
    if (isDown && time > reloadingUntil)
    {
        var bullet = bullets1.get();

        if (bullet)
        {
            bullet.fire(mouseX, mouseY, center_x, center_y);

            reloadingUntil = time + reloadTime;
        }
    }

    player_main.setRotation(Phaser.Math.Angle.Between(mouseX, mouseY, player_main.x, player_main.y) - Math.PI / 2);    
}
