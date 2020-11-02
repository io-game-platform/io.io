// Constants
var SCREEN_WIDTH = 800, SCREEN_HEIGHT = 600;
var MAP_WIDTH = 4000, MAP_HEIGHT = 3000;
var center_x = SCREEN_WIDTH / 2, center_y = SCREEN_HEIGHT / 2;

var maxBullets = 200;
var maxBots = 12;
var maxPlayers = 3;

var reloadTime = 500;

//
var bullets1, bullets2;
var bots;
var players;
var player_main;
var respawn_button, name_input;
var leaderboard;

var numBots = 0;
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
        this._name = name;
        this._score = -5;

        this.type = Phaser.Math.Between(0, 1);
        this.speed = Phaser.Math.GetSpeed(400, 1);
        this.start_x = 0;
        this.start_y = 0;

        this.reloadingUntil = 0;

        this._show_name(scene);
    },

    spawn: function (start_x, start_y)
    {
        this.setActive(true);
        this.setVisible(true);
        this.start_x = start_x;
        this.start_y = start_y;
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
        this.name = scene.add.text(this.x, this.y, this._name);
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
        numBots -= 1;
    },
    shoot_nearest: function (closest, time)
    {

        if (time > this.reloadingUntil)
        {
            var bullet = bullets1.get()
            bullet.fire(closest.x, closest.y, this.x, this.y);
            this.reloadingUntil = time + reloadTime;
        }
    },
});


var Player = new Phaser.Class({

    Extends: Ship,

    initialize: function Player (scene, is_main=false, name='player')
    {
        Phaser.GameObjects.Image.call(this, scene, 0, 0, 'ship');
        this.setDepth(2);
        this.is_main = is_main;
        this._name = name;
        this._score = 0;

        this.speed = Phaser.Math.GetSpeed(0, 1);
        this.speedMax = 400;
        this.reloadingUntil = 0;

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
        this.reloadingUntil = time + reloadTime;
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

            if (isDown && time > this.reloadingUntil)
            {
                this.fire(mouseX, mouseY, time);
            }
        }
    },

    destroy_player: function ()
    {
        this.destroy();
        this._hide_name();

        player_main.x = center_x;
        player_main.y = center_y;

        name_input.setActive(true);
        name_input.setVisible(true);
        respawn_button.setActive(true);
        respawn_button.setVisible(true);
    },

});

class Leaderboard {
    constructor (scene, n_entries, bots, players) {
        this.scene = scene;
        this.n_entries = n_entries;
        this.bots = bots;
        this.players = players;

        this.entry = [];

        for (var i = 0; i < n_entries; i++) {
            var e = [];
            e[0] = scene.add.text(SCREEN_WIDTH - 200, 10 + (20 * i), i, { fixedWidth: 150, fixedHeight: 36 });
            e[1] = scene.add.text(SCREEN_WIDTH - 50, 10 + (20 * i), i, { fixedWidth: 150, fixedHeight: 36 });

            e[0].setScrollFactor(0, 0);
            e[1].setScrollFactor(0, 0);

            this.entry[i] = e;
        }
    }

    _list_ships () {
        // make a list of all bots and players
        return this.bots.getChildren().concat(this.players.getChildren());
    }

    update () {
        var ships = this._list_ships();

        ships.sort(function(a, b){return b._score-a._score});

        for (var i = 0; i < this.n_entries; i++) {
            this.entry[i][0].text = ships[i]._name;
            this.entry[i][1].text = ships[i]._score;
        }
    }
};


function spawn_bots (n)
{
    /*
    Spawns n bots in the bot group.
    */
    numBots += n;
    for (var i = 0; i < n; i++) {
        var bot = bots.get(name='Bot '+Phaser.Math.Between(1,999));
        bot.spawn(Phaser.Math.Between(i*(MAP_WIDTH/n), (i+1)*(MAP_WIDTH/n)), Phaser.Math.Between(i*(MAP_HEIGHT/n), (i+1)*(MAP_HEIGHT/n)));
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
    this.input.setDefaultCursor('url(assets/input/cursors/sc2/SC2-target-none.cur), pointer');
    this.load.image('ship', 'assets/sprites/ship.png');
    this.load.image('bullet1', 'assets/sprites/bullets/bullet11.png');
    this.load.image('button', 'assets/sprites/bullets/bullet11.png');
    this.load.image('star', 'assets/sprites/yellow_ball.png');

	this.load.scenePlugin({
		key: 'rexuiplugin',
		url: 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js',
		sceneKey: 'rexUI'
	});
	
	this.load.plugin('rextexteditplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rextexteditplugin.min.js', true);
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

    for(i=0;i<80;i++)
    {
        this.add.sprite(Phaser.Math.Between(0, MAP_WIDTH), Phaser.Math.Between(0, MAP_HEIGHT), 'star', 0);
    }

	name_input = this.add.text(center_x, center_y, 'Enter name here', { fixedWidth: 150, fixedHeight: 36 });
	name_input.setOrigin(0.5, 0.5);

	name_input.setInteractive().on('pointerdown', () => {
		this.rexUI.edit(name_input)
	});

    respawn_button = this.add.sprite(center_x, center_y, 'button', 0);
    respawn_button.setInteractive();

    respawn_button.on('pointerdown', function () {
        var player_name = 'Coolest Player';
        if (!(name_input.text === 'Enter name here')){
            player_name = name_input.text;
        }

        player_main = players.get(is_main=true, name=player_name);
        player_main.spawn();

        respawn_button.setDepth(3);

        name_input.setActive(false);
        name_input.setVisible(false);
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

    leaderboard = new Leaderboard(this, 5, bots, players);

    this.physics.add.collider(bots, bullets1, bot_hit, null, this);
    this.physics.add.collider(bots, bullets2, bot_hit, null, this);
    this.physics.add.collider(bots, players, bot_player_hit, null, this);
    this.physics.add.collider(players, bullets1, player_hit, null, this);

    /////////////
    //  SPAWN  //
    /////////////

    //spawn_bots(maxBots);
    player_main = players.get(is_main=true, name='Coolest Player');
    player_main.spawn();
    //player_main.destroy_player();
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

    bots.children.each(function(bot) {
        var closest = this.physics.closest(bot);
        bot.shoot_nearest(closest, time);
    }, this);

    if(numBots<maxBots)
    {
        spawn_bots(maxBots-numBots);
    }

    leaderboard.update();
}
