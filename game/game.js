var config = {
    type: Phaser.WEBGL,
    width: 800,
    height: 600,
    backgroundColor: '#2d2d2d',
    parent: 'phaser-example',
    physics: {default: 'arcade'},
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
    },

    destroy_bullet: function()
    {
        this.destroy();
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
        //TODO
    }
});


var Player = new Phaser.Class({

    Extends: Ship,

    initialize: function Player (scene, is_main=false)
    {
        Phaser.GameObjects.Image.call(this, scene, 0, 0, 'ship');
        this.setDepth(2);
        this.speed = Phaser.Math.GetSpeed(400, 1);
        this.is_main = is_main;
    },

    spawn: function ()
    {
        this.setActive(true);
        this.setVisible(true);

        this.setPosition(center_x, center_y);
    },

    fire: function (x, y, time = 0)
    {
        var bullet = bullets1.get();

        if (bullet)
        {
            bullet.fire(mouseX, mouseY, this.x, this.y);
            reloadingUntil = time + reloadTime;
        }
    },

    update: function (time, delta)
    {
        if (this.is_main)
        {
            var angle = Phaser.Math.Angle.Between(mouseX, mouseY, this.x, this.y);
            this.setRotation(angle - Math.PI / 2);

            this.x -= Math.cos(angle) * (this.speed * delta);
            this.y -= Math.sin(angle) * (this.speed * delta);

            if (isDown && time > reloadingUntil)
            {
                this.fire(mouseX, mouseY, time);
            }
        }

        else
        {
            Ship.update(this);
        }
    }
/*
    destroy_player: function ()
    {
        this.destroy();
    }
*/
});


function spawn_bots (n)
{
    var i;
    for (i = 0; i < n; i++) {
        var bot = bots.get();
        bot.spawn();
    }
}
/*
function player_hit(player, bullet)
{
    player.destroy_player();
    bullet.destroy_bullet();
}
*/
function bot_hit(bot, bullet)
{
    bot.destroy();
    bullet.destroy_bullet();
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
    });

    this.input.on('pointermove', function (pointer) {
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

    this.cameras.main.setBounds(0, 0, 1600, 1200);
    var customBounds = new Phaser.Geom.Rectangle(0, 0, 1600, 1200);

    bullets1 = this.physics.add.group({
        classType: Bullet,
        maxSize: 50,
        runChildUpdate: true
    });

    bots = this.physics.add.group({
        classType: Ship,
        maxSize: maxBots,
        runChildUpdate: true
    });

    players = this.physics.add.group({
        classType: Player,
        maxSize: maxPlayers,
        customBoundsRectangle: customBounds,
        collideWorldBounds: true,
        runChildUpdate: true
    });

    /////////////
    //  SPAWN  //
    /////////////

    player_main = players.get(is_main=true);
    player_main.spawn();

    spawn_bots(5);

    this.cameras.main.startFollow(player_main);
}


function update (time, delta)
{
    var pos = this.cameras.main.getWorldPoint(this.input.mousePointer.x, this.input.mousePointer.y);
    mouseX = pos.x;
    mouseY = pos.y;
    this.physics.add.collider(bots, bullets1, bot_hit, null, this);
    //this.physics.add.collider(players, bullets1, player_hit, null, this);
}
