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
var center_x = 400, center_y = 300;
var maxBots = 50;
var maxPlayers = 3;
var reloadTime = 500;
var player_speed = 2;

//
var bullets1;
var bots;
var players;
var player_main;
var speed;
var stats;
var reloadingUntil = 0;
var isDown = false;
var mouseX = 0, mouseY = 0;
var main_x = 0, main_y = 0;
var aKey, dKey, wKey, sKey;

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
        this._start_main_x = main_x;
        this._start_main_y = main_y;
        this._x = init_x;
        this._y = init_y;
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

        this._x -= this.incX * (this.speed * delta);
        this._y -= this.incY * (this.speed * delta);
        this.setPosition(this._x + main_x - this._start_main_x, this._y + main_y - this._start_main_y);

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

        this._x = Phaser.Math.RND.integerInRange(0, 800);
        this._y = Phaser.Math.RND.integerInRange(0, 600);
        this.setPosition(this._x, this._y);
        this.setRotation(Phaser.Math.Angle.Random());
    },

    update: function (time, delta)
    {
        this.setPosition(this._x + main_x, this._y + main_y);
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
    },

    update: function (time, delta)
    {

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

    aKey = this.input.keyboard.addKey('A');
    dKey = this.input.keyboard.addKey('D');
    wKey = this.input.keyboard.addKey('W');
    sKey = this.input.keyboard.addKey('S');

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
    if (aKey.isDown) {main_x += player_speed;}
    if (dKey.isDown) {main_x -= player_speed;}
    if (wKey.isDown) {main_y += player_speed;}
    if (sKey.isDown) {main_y -= player_speed;}

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
