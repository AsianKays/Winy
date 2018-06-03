//engine:
var game = new Phaser.Game(800, 200, Phaser.AUTO, 'content',
{ preload: preload, create: create, update: update, render: render });


//nos variables:
var platforms;
var enemy_group;
var bonus_group;
var background_parallax;

var timer;
var player;
var granny;


var jump_state = 0;

var score;
var style = { font: "bold 20px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };

var spawn_interval_time;

//config du jeu:
var speed_factor = 1;
var limit_enemy = 5;


//load des sprites, décor
function preload()
{
    game.load.spritesheet('catcher', 'img/catcher.png', 46, 46);
    game.load.spritesheet('ground', 'img/ground.png', 630, 30);
    game.load.spritesheet('granny', 'img/granny.png', 32, 32);
    game.load.spritesheet('disabled', 'img/disabled.png', 32, 32);
    game.load.spritesheet('wine', 'img/wine.png', 20, 20);
    game.load.spritesheet('detergent', 'img/detergent.png', 20, 20);
    game.load.spritesheet('crow', 'img/crow.png', 24, 24);
    game.load.spritesheet('dog', 'img/dog.png', 24, 24);
    game.load.image('background', 'img/background.jpg', 1024, 762);
}

function create()
{
    //activer la physics:
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //responsive design:
    game.scale.scaleMode = Phaser.ScaleManager.RESIZE;

    //background_parallax = game.add.sprite(0, 0, 'background');
    background_parallax = this.game.add.tileSprite(
        0,
        this.game.height - this.game.cache.getImage('background').height - 10,
        this.game.width,
        this.game.cache.getImage('background').height,
        'background'
    );

    //gametime
    score = game.add.text(game.world.width / 2, 0, "0", style);

    //player
    player = game.add.sprite(25, game.world.height - 60, 'catcher');
    game.physics.arcade.enable(player);
    player.body.bounce.y = 0;
    player.body.gravity.y = 300;
    player.body.collideWorldBounds = true;
    player.body.setSize(30, 46, 16, 0)

    enemy_group = game.add.group();
    enemy_group.enableBody = true;
    game.physics.arcade.enable(enemy_group);

    bonus_group = game.add.group();
    bonus_group.enableBody = true;
    game.physics.arcade.enable(bonus_group);

    //notre sol:
    platforms = game.add.group();
    platforms.enableBody = true;
    var ground = platforms.create(0, 190, 'ground');
    ground.scale.x = 3;
    ground.body.immovable = true;

    //fonction qui permet d'augmenter la rapidié en fonction du temps

    //  Create our Timer
    timer = game.time.create(false);
    //  Set a TimerEvent to occur after 10 seconds in ms:
    timer.loop(10000, updateSpeedFactor, this);
    //  Start the timer running - this is important!
    //  It won't start automatically, allowing you to hook it to button events and the like.
    timer.start();

    //au clique ou appuye sur l'écran le personnage saute, c'est un listener
    game.input.onDown.add(playerMove, this);
}

function update()
{   
    //nos fonctions:
    generateRandomObject();
    objectAction();

    //parallax:
    background_parallax.tilePosition.x -= (2 * speed_factor);

    //responsive score:
    score.x = game.world.width / 2;
    background_parallax.width = game.world.width;

    //nos collisions:
    game.physics.arcade.collide(player, platforms);
    game.physics.arcade.collide(enemy_group, platforms);
    game.physics.arcade.collide(bonus_group, platforms);
    
    game.physics.arcade.collide(player, enemy_group, test, null, this);
    game.physics.arcade.collide(player, bonus_group, test, null, this);
}

function render()
{
    game.debug.body(player);
    enemy_group.forEach(function(item){
        game.debug.body(item);
    });
}


//déplacement du monstres
function monsterMove(entity, speed)
{
    entity.position.x -= (2 * speed);
    if(entity.position.x <= 0)
    {
        bonus_group.remove(entity);
        enemy_group.remove(entity);
    }
}


//generation random des object et monstres:
function generateRandomObject()
{
    for (let index = enemy_group.length; index < limit_enemy; index++) {
        if(index == 0 || spawn_interval_time < game.time.now)
        {
            //le maximum = le nombre d'object + monstre (ici granny + wine + crow + dog) = 6
            var randomObject = game.rnd.integerInRange(1, 6);

            switch(randomObject)
            {
                case 1:
                    var item = enemy_group.create(game.world.width, 150, 'granny');
                    game.physics.arcade.enable(item);
                    item.enableBody = true;
                    item.body.collideWorldBounds = true;
                    item.body.gravity.y = 200;
                    break;
                case 2:
                    var item = bonus_group.create(game.world.width, game.world.height / 2, 'wine');
                    game.physics.arcade.enable(item);
                    item.enableBody = true;
                    item.body.collideWorldBounds = true;
                    break;
                case 3:
                    var item = enemy_group.create(game.world.width, game.world.height / 2, 'crow');
                    game.physics.arcade.enable(item);
                    item.enableBody = true;
                    item.body.collideWorldBounds = true;
                    break;
                case 4:
                    var item = enemy_group.create(game.world.width, 150, 'dog');
                    game.physics.arcade.enable(item);
                    item.enableBody = true;
                    item.body.collideWorldBounds = true;
                    item.body.gravity.y = 200;
                    break;
                case 5:
                    var item = enemy_group.create(game.world.width, 150, 'disabled');
                    game.physics.arcade.enable(item);
                    item.enableBody = true;
                    item.body.collideWorldBounds = true;
                    item.body.gravity.y = 200;
                    break;
                case 6:
                    var item = bonus_group.create(game.world.width, game.world.height / 2, 'detergent');
                    game.physics.arcade.enable(item);
                    item.enableBody = true;
                    item.body.collideWorldBounds = true;
                    break;
            }

            //genere un temps random entre chaque spawn d'objet:
            var number = game.rnd.integerInRange(200, 1800);
            spawn_interval_time = (game.time.now + number);
        }
    }
}


//fonction qui regroupe les action des object:
function objectAction()
{
    enemy_group.forEach(function(item){
        monsterMove(item, speed_factor);
    });

    bonus_group.forEach(function (item){
        monsterMove(item, speed_factor);
    });
}


//déplacement du joueurs:
function playerMove()
{
    var onGround = player.body.touching.down;
    if(onGround)
    {
        player.body.velocity.y -= 160;
        jump_state = 1;
    }
    else if(!onGround && jump_state == 1)
    {
        player.body.velocity.y -= 130;
        jump_state = 0;
    }     
}

//update de la vitesse de déplacement: (en fonction du temps passé voir le timer plus haut !)
function updateSpeedFactor()
{
    speed_factor += 0.20;
}

function test()
{
    console.log('test');
}