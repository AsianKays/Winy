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

var dinosaure;

var jump_state = 0;

var score = 0;
var style = { font: "bold 20px Arial", fill: "#000", boundsAlignH: "center", boundsAlignV: "middle" };
var styleGameover = { font: "bold 3vw Press Start 2P", fill: "#000", boundsAlignH: "center", boundsAlignV: "middle" };
var isAlive = true;
var test = 5;

var spawn_interval_time;

//config du jeu:
var speed_factor = 1;
var limit_enemy = 5;


//load des sprites, décor
function preload()
{
    game.load.spritesheet('catcher', 'img/character.png', 42, 42);
    game.load.spritesheet('ground', 'img/ground.png', 630, 30);
    game.load.spritesheet('granny', 'img/granny.png', 32, 32);
    game.load.spritesheet('wine', 'img/wine.png', 25, 25);
    game.load.spritesheet('detergent', 'img/detergent.png', 20, 20);
    game.load.spritesheet('crow', 'img/crow.png', 24, 24);
    game.load.spritesheet('dog', 'img/dog.png', 24, 24);
    game.load.spritesheet('dinosaure', 'img/dinosaure.png', 42, 42);

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

    //score
    scoreText = game.add.text(game.world.width / 2, 0, "0", style);


    gameOver = game.add.text(2000, 100, "GAME OVER", styleGameover);
    dinosaure = game.add.sprite(-40, 0, 'dinosaure');
    game.physics.arcade.enable(dinosaure);
    dinosaure.body.bounce.y = 0;
    dinosaure.body.gravity.y = 300;
    dinosaure.animations.add('walk', [0, 1, 2], 6, false);

    //player
    player = game.add.sprite(25, game.world.height - 60, 'catcher');
    game.physics.arcade.enable(player);
    player.body.bounce.y = 0;
    player.body.gravity.y = 300;
    player.body.setSize(32, 42, 0, 0);
    player.animations.add('walk', [0, 1, 2], 4, true);
    player.play('walk');

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
    ground.scale.x = 5;
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
    if(isAlive)
    {
        generateRandomObject();
        objectAction();
    }
    else
    {
        bonus_group.kill();
        enemy_group.kill();
        dinosaure.play('walk');
        player.x += 5;
        dinosaure.x += 4;
        gameOver.x = (game.world.width / 2)/2;
    }

    //parallax:
    background_parallax.tilePosition.x -= (2 * speed_factor);

    //responsive design:
    scoreText.x = game.world.width / 2;
    background_parallax.width = game.world.width;

    //nos collisions:
    game.physics.arcade.collide(player, platforms);
    game.physics.arcade.collide(dinosaure, platforms);
    game.physics.arcade.collide(enemy_group, platforms);
    game.physics.arcade.collide(bonus_group, platforms);
    game.physics.arcade.collide(player, enemy_group, ennemyCollide, null, this);
    game.physics.arcade.collide(player, bonus_group, bonusCollide, null, this);
}

function render()
{
    // game.debug.body(player);
    enemy_group.forEach(function(item){
        // game.debug.body(item);
    });
    bonus_group.forEach(function(item){
        // game.debug.body(item);
    });
}


//déplacement des monstres
function monsterMove(entity, speed)
{
    entity.position.x -= (2 * speed);
    if(entity.position.x <= 0)
    {
        enemy_group.remove(entity);
        bonus_group.remove(entity);
    }
}


//generation random des object et monstres:
function generateRandomObject()
{
    for (let index = enemy_group.length; index < limit_enemy; index++) {
        if(index == 0 || spawn_interval_time < game.time.now)
        {
            //le maximum = le nombre d'object + monstre (ici granny + wine + crow + dog) = 4
            var randomObject = game.rnd.integerInRange(1, 7);

            switch(randomObject)
            {
                case 1:
                    var item = enemy_group.create(game.world.width, 160, 'granny');
                    game.physics.arcade.enable(item);
                    item.enableBody = true;
                    item.body.collideWorldBounds = true;
                    item.body.gravity.y = 200;
                    item.body.setSize(25, 30, 0, 0);
                    break;
                case 2:
                    var randomPosition = game.rnd.integerInRange(1, 3);
                    var item = randomPositionGenerator(randomPosition, 'wine', bonus_group);

                    game.physics.arcade.enable(item);
                    item.enableBody = true;
                    item.body.collideWorldBounds = true;
                    item.body.setSize(15, 18, 0, 0);
                    break;
                case 3:
                    var randomPosition = game.rnd.integerInRange(1, 2);
                    var item = randomPositionGenerator(randomPosition, 'crow', enemy_group);

                    game.physics.arcade.enable(item);
                    item.enableBody = true;
                    item.body.collideWorldBounds = true;
                    item.body.setSize(20, 20, 0, 0);
                    break;
                case 4:
                    var item = enemy_group.create(game.world.width, 160, 'dog');
                    game.physics.arcade.enable(item);
                    item.enableBody = true;
                    item.body.collideWorldBounds = true;
                    item.body.setSize(25, 20, 0, 0);
                    item.body.gravity.y = 200;
                    break;
                case 6:
                    var randomPosition = game.rnd.integerInRange(1, 2);
                    var item = randomPositionGenerator(randomPosition, 'detergent', enemy_group);

                    game.physics.arcade.enable(item);
                    item.enableBody = true;
                    item.body.collideWorldBounds = true;
                    break;
                case 7:
                    var randomPosition = game.rnd.integerInRange(1, 3);
                    var item = randomPositionGenerator(randomPosition, 'wine', bonus_group);

                    game.physics.arcade.enable(item);
                    item.enableBody = true;
                    item.body.collideWorldBounds = true;
                    item.body.setSize(15, 18, 0, 0);
                    break;
            }

            //genere un temps random entre chaque spawn d'objet:
            var number = game.rnd.integerInRange(1000, 1800);
            spawn_interval_time = (game.time.now + number);
        }
    }
}

function randomPositionGenerator(position, sprite_name, group)
{
    var item;
    if(position == 1)
        item = group.create(game.world.width, game.world.height / 3, sprite_name);
    else if(position == 2)
        item = group.create(game.world.width, game.world.height / 2, sprite_name);
    else if(position == 3)
        item = group.create(game.world.width, game.world.height - 50, sprite_name);
    else
        item = group.create(game.world.width, game.world.height - 50, sprite_name);

    return item;
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
    if(onGround && isAlive)
    {
        player.body.velocity.y -= 160;
        jump_state = 1;
        player.frame = 3;
        //player.play('jump');
    }
    else if(!onGround && jump_state == 1)
    {
        player.body.velocity.y -= 130;
        jump_state = 0;
        player.frame = 3;
    }     
}

function stop(){
    game.paused = true;
}

//update de la vitesse de déplacement: (en fonction du temps passé voir le timer plus haut !)
function updateSpeedFactor()
{
    speed_factor += 0.20;
}

function bonusCollide()
{
    bonus_group.forEach(function(item){
        if(game.physics.arcade.collide(player, item))
            {  
                item.kill();
                score = score + 10;
                scoreText.text = score;
            }
        });
}

function ennemyCollide()
{
    isAlive = false;
}