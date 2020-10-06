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

var bullets1;
var bullets2;
var ships;
var player;
var speed;
var stats;
var reloadingUntil = 0;
var reloadTime = 500;
var maxBots = 50;
var maxPlayers = 50;
var isDown = false;
var mouseX = 0;
var mouseY = 0;

var game = new Phaser.Game(config);

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

        spawn: function (x, y)
        {
            this.setActive(true);
            this.setVisible(true);
            this.setPosition(x, y);
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
            this.setPosition(400, 300);
        }
    });

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

    ships = this.add.group({
        classType: Ship,
        maxSize: maxBots,
        runChildUpdate: true
    });

    players = this.add.group({
        classType: Player,
        maxSize: maxPlayers,
        runChildUpdate: true
    });

    player = players.get();
    player.spawn();

    var bot1 = ships.get();
    bot1.spawn(100,100);
}

function update (time, delta)
{
    if (isDown && time > reloadingUntil)
    {
        var bullet = bullets1.get();

        if (bullet)
        {
            bullet.fire(mouseX, mouseY, 400, 300);

            reloadingUntil = time + reloadTime;
        }
    }

    player.setRotation(Phaser.Math.Angle.Between(mouseX, mouseY, player.x, player.y) - Math.PI / 2);    

}
