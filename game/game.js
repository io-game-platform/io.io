// Constants
var SCREEN_WIDTH = 800, SCREEN_HEIGHT = 600;
var MAP_WIDTH = 1600, MAP_HEIGHT = 1200;
var center_x = SCREEN_WIDTH / 2, center_y = SCREEN_HEIGHT / 2;

var maxBullets = 200;
var maxBots = 50;
var maxPlayers = 3;

var reloadTime = 500;

//
var bullets1, bullets2;
var bots;
var players;
var player_main;
var respawn_button;

var reloadingUntil = 0;
var isDown = false;
var mouseX = 0, mouseY = 0;


var config = {
    type: Phaser.WEBGL,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#2d2d2d',
    parent: 'phaser-example',
    physics: {default: 'arcade'},
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};


var game = new Phaser.Game(config);


var Bullet = new Phaser.Class({

    Extends: Phaser.GameObjects.Image,

    initialize: function Bullet (scene)
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
            this.destroy();
        }
    },

    destroy_bullet: function()
    {
        this.destroy();
    }
});


var Ship = new Phaser.Class({

    Extends: Phaser.GameObjects.Image,

    initialize: function Bot (scene, name = 'Bot')
    {
        Phaser.GameObjects.Image.call(this, scene, 0, 0, 'ship');
        this.setDepth(1);
        this.name = name;

        this.type = Phaser.Math.Between(0, 1);
        this.speed = Phaser.Math.GetSpeed(400, 1);

        this._show_name(scene);
    },

    spawn: function ()
    {
        this.setActive(true);
        this.setVisible(true);

        if (this.type == 0) {  // Square
            this._init_square();
        } else if (this.type == 1) {  // Circle 8
            this._init_eight();
        }
    },

    update: function (time, delta)
    {
        this._update_name();

        if (this.type == 0) {
            this._move_square(this.time);
        } else if (this.type == 1) {
            this._move_eight(this.time);
        }

        this.x = Math.max(0, Math.min(MAP_HEIGHT, this.x));
        this.y = Math.max(0, Math.min(MAP_WIDTH, this.y));

        this.time += 1;
    },

    _show_name: function (scene)
    {
        this.name = scene.add.text(this.x, this.y, this.name);
        this.name.setFontFamily('Times New Roman')
        this.name.setFontSize(24);
        this.name.setActive(true);
        this.name.setVisible(true);
        this.nameOffset = this.name.width/2;
    },

    _hide_name: function (scene)
    {
        this.name.setActive(false);
        this.name.setVisible(false);
    },

    _update_name: function ()
    {
        this.name.setPosition(this.x-this.nameOffset, this.y+60)
    },

    _init_square: function ()
    {
        this.side_len = Phaser.Math.Between(100, 200);
        this.start_x = Phaser.Math.Between(0, center_x * 2 - this.side_len);
        this.start_y = Phaser.Math.Between(0, center_y * 2 - this.side_len);
        this.time = Phaser.Math.Between(0, 100);  // TODO Dont know if actually affects starting pos

        this.setPosition(this.start_x, this.start_y);

        var i;
        for (i = 0; i < this.time; i++){
            this._move_square(i);
        }
    },

    _move_square: function (time)
    {
        var timed_side_len = this.side_len / this.speed;
        var i = time % (timed_side_len * 4);

        if (i < timed_side_len) {
            this.y += this.speed;
            this.setRotation(Math.PI);
        } else if (i < timed_side_len * 2) {
            this.x += this.speed;
            this.setRotation(Math.PI / 2);
        } else if (i < timed_side_len * 3) {
            this.y -= this.speed;
            this.setRotation(0);
        } else {
            this.x -= this.speed;
            this.setRotation(Math.PI * 3 / 2);
        }
    },

    _init_eight: function ()
    {
        this.diameter = Phaser.Math.Between(100, 500);
        this.step_value = 72;  // TODO shouldnt be separate from speed!
        this.step = Math.PI / this.step_value;

        this.start_x = Phaser.Math.Between(this.diameter / 2, center_x * 2 - this.diameter / 2);
        this.start_y = Phaser.Math.Between(this.diameter / 2, center_y * 2 - this.diameter / 2);
        this.time = Phaser.Math.Between(0, 100);  // TODO Dont know if actually affects starting pos

        this.setPosition(this.start_x, this.start_y);

        this.direction = false;
        var i;
        for (i = 0; i < this.time; i++){
            this._move_eight(i);
        }
    },

    _move_eight: function (time)
    {
        if (time % (2 * this.step_value) - Math.floor(this.step_value / 2) == 0) {
            this.direction = !this.direction;
        }

        if (this.direction) {
            this.x += (Math.sin((time + 1) * this.step) - Math.sin(time * this.step)) * this.diameter;
            this.y += (Math.cos((time + 1) * this.step) - Math.cos(time * this.step)) * this.diameter;
            this.setRotation(Math.cos(time * this.step) + Math.PI / 2);
        } else {
            this.x += -(Math.sin((time + 1) * this.step) - Math.sin(time * this.step)) * this.diameter;
            this.y += (Math.cos((time + 1) * this.step) - Math.cos(time * this.step)) * this.diameter;
            this.setRotation(-Math.cos(time * this.step) - Math.PI / 2);
        }
    },

    destroy_bot: function ()
    {
        this.destroy();
        this._hide_name();
    },
});


var Player = new Phaser.Class({

    Extends: Ship,

    initialize: function Player (scene, is_main=false, name='player')
    {
        Phaser.GameObjects.Image.call(this, scene, 0, 0, 'ship');
        this.setDepth(2);
        this.is_main = is_main;
        this.name = name;

        this.speed = Phaser.Math.GetSpeed(0, 1);
        this.speedMax = 400;

        this._show_name(scene);
    },

    spawn: function ()
    {
        this.setActive(true);
        this.setVisible(true);

        this.setPosition(center_x, center_y);
    },

    fire: function (x, y, time = 0)
    {
        var bullet;

        if (this.is_main)
        {
            bullet = bullets2.get()
        }
        else{
            bullet = bullets1.get();
        }

        bullet.fire(mouseX, mouseY, this.x, this.y);
        reloadingUntil = time + reloadTime;
    },

    update: function (time, delta)
    {
        this._update_name();

        if (this.is_main)
        {
            var angle = Phaser.Math.Angle.Between(mouseX, mouseY, this.x, this.y);
            this.setRotation(angle - Math.PI / 2);

            var speed = (Math.abs(Math.abs(mouseX)-Math.abs(this.x)) + Math.abs(Math.abs(mouseY)-Math.abs(this.y)));
            if (speed > this.speedMax)
            {
                speed = this.speedMax;
            }
            this.speed = Phaser.Math.GetSpeed(speed, 1);
            this.x -= Math.cos(angle) * (this.speed * delta);
            this.y -= Math.sin(angle) * (this.speed * delta);

            if (isDown && time > reloadingUntil)
            {
                this.fire(mouseX, mouseY, time);
            }
        }
    },

    destroy_player: function ()
    {
        this.destroy();
        this._hide_name();
        respawn_button.setActive(true);
        respawn_button.setVisible(true);
        respawn_button.x = this.x;
        respawn_button.y = this.y;
    },

});


function spawn_bots (n)
{
    /*
    Spawns n bots in the bot group.
    */
    var i;
    for (i = 0; i < n; i++) {
        var bot = bots.get(name='Bot '+i);
        bot.spawn();
    }
}

function player_hit(player, bullet)
{
    player.destroy_player();
    bullet.destroy_bullet();
}

function bot_hit(bot, bullet)
{
    bot.destroy_bot();
    bullet.destroy_bullet();
}

function bot_player_hit(bot, player)
{
    bot.destroy_bot();
    player.destroy_player();
}

function preload ()
{
    /*
    Preload is called by Phaser before anything else.
    */
    this.load.image('ship', 'assets/sprites/ship.png');
    this.load.image('bullet1', 'assets/sprites/bullets/bullet11.png');
    this.load.image('button', 'assets/sprites/bullets/bullet11.png');
}


function create ()
{
    /*
    Create is called before the Phaser main loop starts.
    */
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

    //////////////////////
    //  ONE-TIME SETUP  //
    //////////////////////

    this.cameras.main.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);
    var customBounds = new Phaser.Geom.Rectangle(0, 0, MAP_WIDTH, MAP_HEIGHT);

    respawn_button = this.add.sprite(center_x, center_y, 'button', 0);
    respawn_button.setInteractive();

    respawn_button.on('pointerdown', function () {
        player_main = players.get(is_main=true, name='Coolest Player');
        player_main.spawn();

        respawn_button.setDepth(3);

        respawn_button.setActive(false);
        respawn_button.setVisible(false);
    });

    bullets1 = this.physics.add.group({
        classType: Bullet,
        maxSize: maxBullets,
        runChildUpdate: true
    });

    bullets2 = this.physics.add.group({
        classType: Bullet,
        maxSize: maxBullets,
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

    spawn_bots(5);

    // NOTE: This is to make the camera follow the main player
    player_main = players.get(is_main=true, name='Coolest Player');
    player_main.spawn();
    player_main.destroy_player();
}


function update (time, delta)
{
    /*
    Update is called by Phaser at every timestep.
    */
    this.cameras.main.startFollow(player_main);
    var pos = this.cameras.main.getWorldPoint(this.input.mousePointer.x, this.input.mousePointer.y);
    mouseX = pos.x;
    mouseY = pos.y;

    this.physics.add.collider(bots, bullets1, bot_hit, null, this);
    this.physics.add.collider(bots, bullets2, bot_hit, null, this);
    this.physics.add.collider(bots, players, bot_player_hit, null, this);
    /*
    /Notes on how to handle self kills
    /Make another bullet group (bullets2)
    /Then make ships/bot/all other bullets in group2 using this.is_main
    /then in an else statement in player fire, make it so that they only pull from bullet1
    /I hope I'm understanding this right.
    */
    this.physics.add.collider(players, bullets1, player_hit, null, this);
}
