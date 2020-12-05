// Constants
var SCREEN_WIDTH = 800, SCREEN_HEIGHT = 600;
var MAP_WIDTH = 4000, MAP_HEIGHT = 3000;
var center_x = SCREEN_WIDTH / 2, center_y = SCREEN_HEIGHT / 2;
var maxPlayers = 3;
var maxBots = 12;

var maxPoints = 150;

var reloadTime = 500;
var BLAST_SIZE = 4;
var BOT_RANGE = 300;
var HITBOX_SCALE = .8;

//
var players, bots, points;
var respawn_button, name_input, game_name, ui_rect;
var leaderboard, ui_rect, game_name;

var player_main;
var worldScale = 0, textScale = 1, zoomLevel = 1;
var numBots = 0, reloadingUntil = 0, numPoints = 0;
var leftDown = false, rightDown = false, scaleChange = false;
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
    },
    dom: {
        createContainer: true
    },
};

var game = new Phaser.Game(config);

var Bot = new Phaser.Class({

    Extends: Phaser.GameObjects.Ellipse,

    initialize: function Bot (scene, name)
    {
        var color = new Phaser.Display.Color();
        color.random();
        Phaser.GameObjects.Ellipse.call(this, scene, Phaser.Math.Between(-1000000,0), Phaser.Math.Between(-1000000,0), 25, 25, color.color);
        this.setDepth(1);
        this._growthRate = .9;
        this._name = name;
        this._score = Phaser.Math.Between(5, 20);
        this._scale = 1;

        this.type = 0;//Phaser.Math.Between(0, 1);
        this.speed = 2//Phaser.Math.GetSpeed(400, 1);
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

        if (this.type == 0) {
            this._init_chase();
        }
    },

    update: function (time, delta)
    {
        this.resize()
        this._update_name();

        if (this.type == 0) {
            this._move_chase(this.time);
        }

        this.x = Math.max(0, Math.min(MAP_HEIGHT, this.x));
        this.y = Math.max(0, Math.min(MAP_WIDTH, this.y));

        this.time += 1;
    },

    _list_ships () {
        // make a combined list of all bots and players
        return bots.getChildren().concat(players.getChildren());
    },

    _show_name: function (scene)
    {
        /* Display bot name underneath it. */
        this.name = scene.add.text(this.x, this.y, this._name);
        this.name.setFontFamily('Times New Roman')
        this.name.setFontSize(24);
        this.name.setActive(true);
        this.name.setVisible(true);
        this.nameOffsetX = this.name.width/2;
        this.nameOffsetY = this.height/2;
    },

    _hide_name: function (scene)
    {
        this.name.setActive(false);
        this.name.setVisible(false);
    },

    _update_name: function ()
    {
        this.name.setPosition(this.x-this.nameOffsetX, this.y+this.nameOffsetY)
        this.name.setScale(textScale);
    },

    _init_chase: function ()
    {
        this.time = Phaser.Math.Between(0, 100);

        this.setPosition(this.start_x, this.start_y);
    },

    _move_chase: function (time)
    {
        var nearest_bot = 0;
        var min_distance = 10000000000;

        var ships = this._list_ships();
    
        var opponent;
        for (var i = 0; i < ships.length; i++){
            opponent = ships[i];

            if(opponent != null && opponent._score < this._score){

                var distance = Math.pow(Math.pow(this.x - opponent.x, 2) + Math.pow(this.y - opponent.y, 2), .5);

                if (distance < min_distance){
                    min_distance = distance;
                    nearest_bot = opponent;
                }
            }
        }

        if (nearest_bot == 0 || nearest_bot == null){
            return
        }

        var dx = nearest_bot.x - this.x;
        var dy = nearest_bot.y - this.y;

        var angle = Math.atan(dy / dx);

        this.x += this.speed * Math.cos(angle);
        this.y += this.speed * Math.sin(angle);

    },

    destroy_bot: function ()
    {
        this.destroy();
        this._hide_name();
        numBots -= 1;
    },

    resize: function ()
    {
        this._scale = (this._score+50)/50;
        this.setScale(this._scale);
        this.body.setSize(HITBOX_SCALE * this.width, HITBOX_SCALE * this.height, true);
        this.nameOffsetY = this.height*this._scale/2; 
        this.nameOffsetX = (this.name.width/2)+(worldScale*10);
    },

    get_score: function ()
    {
        return this._score;
    },

    increase_score: function (inc)
    {
        this._score += inc;
    }
});


var Player = new Phaser.Class({

    Extends: Bot,

    initialize: function Player (scene, is_main, name)
    {
        var color = new Phaser.Display.Color();
        color.random();
        Phaser.GameObjects.Ellipse.call(this, scene, 0, 0, 25, 25, color.color);
        this.setDepth(2);
        this.is_main = is_main;
        this._growthRate = .8;
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

    update: function (time, delta)
    {
        this.resize()
        this._update_name();

        if (this.is_main)
        {
            var angle = Phaser.Math.Angle.Between(mouseX, mouseY, this.x, this.y);

            this.speed = (Math.abs(Math.abs(mouseX)-Math.abs(this.x)) + Math.abs(Math.abs(mouseY)-Math.abs(this.y)));
            this.speed = Phaser.Math.GetSpeed(Math.min(this.speed, this.speedMax), 1);

            this.x -= Math.cos(angle) * (this.speed * delta);
            this.y -= Math.sin(angle) * (this.speed * delta);
        }
    },

    resize: function ()
    {
        this._scale = (this._score+50)/50;
        this.setScale(this._scale);
        this.nameOffsetY = this.height*this._scale/2; 
        this.nameOffsetX = (this.name.width/2)+(worldScale*15);
        this.body.setSize(HITBOX_SCALE * this.width, HITBOX_SCALE * this.height, true);
        if(this.is_main){
            if(this._scale > (worldScale + 1) * 4 && worldScale < 8){
                worldScale += 1;
                scaleChange = true;
            }
        }
    },

    destroy_player: function ()
    {
        // Reset score instead
        // this._score = Math.floor(this._score / 2);

        this.destroy();
        this._hide_name();

        player_main.x = center_x;
        player_main.y = center_y;

        ui_rect.setActive(true);
        ui_rect.setVisible(true);
        game_name.setActive(true);
        game_name.setVisible(true);
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
            e[0] = scene.add.text(410+textScale*(SCREEN_WIDTH-200)-(.5*SCREEN_WIDTH*textScale) , 310-(.5*SCREEN_HEIGHT*textScale)+((5*worldScale+20) * i), i, { fixedWidth: 150, fixedHeight: 36 });
            e[1] = scene.add.text(410+textScale*(SCREEN_WIDTH-200)+(150*textScale)-(.5*SCREEN_WIDTH*textScale), 310-(.5*SCREEN_HEIGHT*textScale)+((5*worldScale+20) * i), i, { fixedWidth: 150, fixedHeight: 36 });

            e[0].setFontSize(16);
            e[0].setScrollFactor(0, 0);
            e[1].setFontSize(16);
            e[1].setScrollFactor(0, 0);

            this.entry[i] = e;
        }
    }

    _list_ships () {
        // make a combined list of all bots and players
        return this.bots.getChildren().concat(this.players.getChildren());
    }

    setVisible (value) {
        for (var i = 0; i < this.n_entries; i++) {
            this.entry[i][0].setVisible(value);
            this.entry[i][1].setVisible(value);
        }
    }

    update () {
        var ships = this._list_ships();
        ships.sort(function(a, b){return b._score - a._score});

        for (var i = 0; i < this.n_entries; i++) {
            if(typeof ships[i] !== 'undefined'){
                this.entry[i][0].setScale(textScale)
                this.entry[i][0].text = ships[i]._name;
                this.entry[i][1].setScale(textScale)
                this.entry[i][1].text = ships[i]._score;
            }
        }
    }
};


function spawn_bots (n)
{
    /*
    Spawns n bots into the bot group.
    */
    numBots += n;
    for (var i = 0; i < n; i++) {
        var bot = bots.get('Bot '+Phaser.Math.Between(1,999));
        bot.spawn(Phaser.Math.Between(i*(MAP_WIDTH/n), (i+1)*(MAP_WIDTH/n)), Phaser.Math.Between(i*(MAP_HEIGHT/n), (i+1)*(MAP_HEIGHT/n)));
    }
}

function spawn_points (scene, n)
{
    numPoints += n;
    var color = new Phaser.Display.Color();
    for (var i = 0; i < n; i++) {
        color.random();
        var point = new Phaser.GameObjects.Ellipse(scene, Phaser.Math.Between(0, MAP_WIDTH), Phaser.Math.Between(0, MAP_HEIGHT), 15, 15, color.color);
        points.add(point, true);
    }
}

function bot_player_collision(bot, player)
{
    if(bot.get_score() < player.get_score())
    {
        player.increase_score(bot.get_score()+1);
        bot.destroy_bot();
    }
    else if(bot.get_score() > player.get_score())
    {
        bot.increase_score(player.get_score()+1);
        player.destroy_player();
    }
    else
    {
        bot.destroy_bot();
        player.destroy_player();
    }
}

function bot_bot_collision(bot1, bot2)
{
    if(bot1.get_score() < bot2.get_score())
    {
        bot2.increase_score(bot1.get_score()+1);
        bot1.destroy_bot();
    }
    else if(bot1.get_score() > bot2.get_score())
    {
        bot1.increase_score(bot2.get_score()+1);
        bot2.destroy_bot();
    }
    else
    {
        bot1.destroy_bot();
        bot2.destroy_bot();
    }
}

function point_bot_collision(point, bot)
{
    bot.increase_score(1);
    point.destroy();
    numPoints -= 1;
}

function point_player_collision(point, player)
{
    player.increase_score(1);
    point.destroy();
    numPoints -= 1;
}

function preload ()
{
    /*
    Preload is called by Phaser before anything else.
    */
    this.load.image('button', 'assets/sprites/bullets/bullet11.png');

    var url;
    url = 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexbbcodetextplugin.min.js';
    this.load.plugin('rexbbcodetextplugin', url, true);

    url = 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rextexteditplugin.min.js';
    this.load.plugin('rextexteditplugin', url, true);
}


function create ()
{
    /*
    Create is called before the Phaser main loop starts.
    */
    //////////////////////
    //  Declarations    //
    //////////////////////

    // Set global variables for pointer control
    this.input.on('pointerdown', function (pointer) {
        leftDown = pointer.leftButtonDown();
        rightDown = pointer.rightButtonDown();
    });
    this.input.on('pointerup', function (pointer) {
        leftDown = pointer.leftButtonDown();
        rightDown = pointer.rightButtonDown();
    });

    //////////////////////
    //  Game objects    //
    //////////////////////

    this.cameras.main.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);

    var player_bounds = new Phaser.Geom.Rectangle(0, 0, MAP_WIDTH, MAP_HEIGHT);

    points = this.physics.add.group();

    players = this.physics.add.group({
        classType: Player,
        maxSize: maxPlayers,
        customBoundsRectangle: player_bounds,
        collideWorldBounds: true,
        runChildUpdate: true
    });

    bots = this.physics.add.group({
        classType: Bot,
        maxSize: maxBots,
        runChildUpdate: true
    });

    this.physics.add.collider(bots, players, bot_player_collision, null, this);
    this.physics.add.collider(bots, bots, bot_bot_collision, null, this);
    this.physics.add.collider(points, players, point_player_collision, null, this);
    this.physics.add.collider(points, bots, point_bot_collision, null, this);

    ////////////////////////
    //  User Interface    //
    ////////////////////////

    var rect_w = 165, rect_h = 100;
    ui_rect = this.add.rectangle(center_x-4, center_y, rect_w, rect_h, 0x555555);
    ui_rect.setOrigin(0.5, 0.5);

    game_name = this.add.text(center_x, center_y-40, 'plankton.io', { fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif' });
    game_name.setOrigin(0.5, 0.5);

    var initial_text = 'Enter name here';

    // https://codepen.io/rexrainbow/pen/GaxqLZ?editors=0010
    name_input = this.add.rexBBCodeText(center_x, center_y-12, initial_text, {
        color: 'white',
        fontSize: '14px',
        fixedWidth: 140,
        fixedHeight: 20,
        //valign: 'center'
    })
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', function () {
            if (name_input.text === initial_text){
                name_input.text = '';
            }
            var editbox = this.plugins.get('rextexteditplugin').edit(name_input);

            editbox.inputText.x = center_x;
            editbox.inputText.y = center_y;
        }, this);

    respawn_button = this.add.sprite(center_x, center_y, 'button', 0);
    respawn_button.setInteractive();
    respawn_button.on('pointerdown', function () {
        var player_name = 'Coolest Player';
        if (!(name_input.text === initial_text)){
            player_name = name_input.text;
        }

        player_main = players.get(true, player_name);
        player_main.spawn();

        respawn_button.setDepth(3);

        ui_rect.setActive(false);
        ui_rect.setVisible(false);
        game_name.setActive(false);
        game_name.setVisible(false);
        name_input.setActive(false);
        name_input.setVisible(false);
        respawn_button.setActive(false);
        respawn_button.setVisible(false);
    });

    leaderboard = new Leaderboard(this, 5, bots, players);

    /////////////
    //  SPAWN  //
    /////////////

    player_main = players.get(true, 'Coolest Player');
    player_main.spawn();
    player_main.destroy_player();
}


function update (time, delta)
{
    /*
    Update is called by Phaser at every timestep.
    */
    
    if(scaleChange){
        scaleChange = false;
        leaderboard.setVisible(false);
        zoomLevel = 1/(1.2**worldScale);
        this.cameras.main.zoomTo(zoomLevel);
        textScale = 1/zoomLevel;
        leaderboard = new Leaderboard(this, 5, bots, players);
    }

    this.cameras.main.startFollow(player_main);

    var pos = this.cameras.main.getWorldPoint(this.input.mousePointer.x, this.input.mousePointer.y);
    mouseX = pos.x;
    mouseY = pos.y;

    spawn_bots(maxBots - numBots);
    spawn_points(this, maxPoints - numPoints);
    leaderboard.update();
}
