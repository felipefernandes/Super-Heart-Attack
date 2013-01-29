$(document).ready(function() {

	//configuração de ambiente
	var DEBUG=true;

	var CANVAS_WIDTH = 480;
	var CANVAS_HEIGHT = 540;
	var PERSONAGENS_AMIGOS = new Array();
	var PERSONAGENS_INIMIGOS = new Array();
	var PERSONAGENS_POWERUPS = new Array();

	var canvasElement = $("<canvas id='canvas_area' width='" + CANVAS_WIDTH + "' height='" + CANVAS_HEIGHT + "'></canvas>");
	var canvas = canvasElement.get(0).getContext("2d");
	canvasElement.appendTo('#container');

	var intervalo;

	function init() {
		var FPS = 30;
		intervalo = setInterval(function() { //loop
			update();
			draw();
		}, 1000/FPS);

		Sound.play("soundtrack.mp3");
	}

	init(); //comeca o jogo




	var faseAtual = 0; //define o numero da fase atual
	var numVidasInit = 3;	
	var numVidasAtual = numVidasInit;
	var indiceVida = numVidasInit;
	var powerup_activate = false;
	var powerup_colisao = false;
	var powerup_type = 0;

	var mobileClickLeft;
	var mobileClickRight;

	function update() { 

		if(keydown.left || mobileClickLeft) {
/*			if(powerup_colisao) {
				if(powerup.tipo == 1) { player.x += 5;  } // cogumelo
				if(powerup.tipo == 2) { player.x -= 1;  } // canabis
				if(powerup.tipo == 3) { player.x -= 14; } // cafe
			} else {
				player.x -= 5;	
			}*/

			player.x -= 5;	
		}

		if(keydown.right || mobileClickRight) {			
/*			if(powerup_colisao) {
				if(powerup.tipo == 1) { player.x -= 5;  } // cogumelo
				if(powerup.tipo == 2) { player.x += 1;  } // canabis
				if(powerup.tipo == 3) { player.x += 14; } // cafe					
			} else {
				player.x += 5;	
			}*/

			player.x += 5;	
		}	


		player.x = player.x.clamp(0, CANVAS_WIDTH - player.width);


		Inimigos.forEach(function(inimigo) {
			inimigo.update();
		});

		Inimigos = Inimigos.filter(function(inimigo) {
			return inimigo.active;
		});

		Amigos.forEach(function(amigo) {
			amigo.update();
		});

		Amigos = Amigos.filter(function(amigo) {
			return amigo.active;
		});		

		switch (faseAtual) { // define a quantidade de inimigos de acordo com a faseAtual
			case 0 : radomIndice = 80; break
			case 1 : radomIndice = 60; break
			case 2 : radomIndice = 40; break
			case 3 : radomIndice = 50; break
			case 4 : radomIndice = 20; break
			case 5 : radomIndice = 10; break
			case 6 : radomIndice = 5; break			
		}

		if(getRandom(radomIndice) < 0.1) {
			Inimigos.push(Inimigo());
		}

		if(getRandom(100) < 0.1) {
			Amigos.push(Amigo());
		}		


		handleCollisions(); //detecta colisões

		player.update();		
		powerup.update();

	}


	function goPower() {

		if(powerup_activate) {
			if(DEBUG) { console.log("Executou powerup"); }
			powerup.active = true;	
			powerup.init();			
		}

		setTimeout(function() { powerup.active = false; }, 6000);
		setTimeout(function() { powerup_colisao =  false }, 8000);

		powerup_activate = false;
	}




	function draw() {

		canvas.clearRect(0,0, CANVAS_WIDTH, CANVAS_HEIGHT);
		
		player.draw();
		
		Inimigos.forEach(function(inimigo) {
			inimigo.draw();
		});	

		Amigos.forEach(function(amigo) {
			amigo.draw();
		});			
		
		powerup.draw();
	}



	//
	// Objeto para controlar a exibição de pontuação
	//
	var pontos = {
		x: 500,
		y: 40,
		valor: 0,
		update: function() {	
			this.valor = player.pontuacao.toString();
		}
	}


	//	
	//	Player
	// 
	var player = {
		color: "#00A",
		x: (CANVAS_WIDTH/2) - 30,
		y: 450,
		width: 80,
		height: 80,
		active: true,
		pontuacao: 0,
		itensCounter: 0,
		lastItensCounter:0,
		vidas: numVidasAtual,
		draw: function() {
			canvas.fillStyle = this.color;
			canvas.fillRect(this.x, this.y, this.width, this.height);
		}
	}

	player.sprite = Sprite("player");

	player.draw = function () {
		this.sprite.draw(canvas, this.x, this.y);
	}

	player.explode = function() {

		if(this.vidas > 1) {			
			player.sprite = Sprite("player"); // volta com o sprite original
			this.vidas--; // tira uma vida

			switch (this.vidas) {
				case 2 : $('#vida_'+3).fadeTo('Slow', 0.2); break;
				case 1 : $('#vida_'+2).fadeTo('Slow', 0.2); break;
				case 0 : $('#vida_'+1).fadeTo('Slow', 0.2); break;
			}
			
			if(DEBUG) { console.log("ainda restam: " + this.vidas); }

		} 
		else {
			this.active = false;
			// Adicionar grafico de explosão
			player.sprite = Sprite("explosion");
			clearInterval(intervalo);

			$('#vida_'+1).fadeTo('Slow', 0.2); // remove o último coração de vida do HUD

			console.log("fim de jogo");				
		}
	}

	player.pontua = function() {

		switch (faseAtual) { // define a quantidade de inimigos de acordo com a faseAtual
			case 0 : this.pontuacao += 10; break;
			case 1 : this.pontuacao += 20; break;
			case 2 : this.pontuacao += 30; break;
			case 3 : this.pontuacao += 40; break;
			case 4 : this.pontuacao += 55; break;
			case 5 : this.pontuacao += 60; break;
			case 6 : this.pontuacao += 70; break;		
		}

		this.itensCounter++;

		//console.log("Pontuacao: " + this.pontuacao);
	}


	player.update = function () {

		pontos.update();

		if(this.lastItensCounter != this.itensCounter) { 
			switch(this.itensCounter) {
				case 3  : 				
					powerup_activate=true; 
					goPower(); 				
					break;			
				case 5  : 
					faseAtual = 1; 				
					//console.log("NOVA FASE!" + faseAtual); 
					break;
				case 10 : 
					faseAtual = 2; 
					//console.log("NOVA FASE!" + faseAtual);
					powerup_activate=true; 
					goPower(); 				
					break;
				case 25 : 
					faseAtual = 3; 
					//console.log("NOVA FASE!" + faseAtual); 
					break;
				case 40 : 
					faseAtual = 4; 
					powerup_activate=true; 
					//console.log("NOVA FASE!" + faseAtual); 
					break;
				case 50 : 
					faseAtual = 5; 
					//console.log("NOVA FASE!" + faseAtual); 
					break;
				case 60 : 
					faseAtual = 6; 
					console.log("NOVA FASE!" + faseAtual); 
					break;
			}
			this.lastItensCounter = this.itensCounter;
		}

		//se está morto manda pra tela final
		if(!this.active) {
			if(DEBUG) { console.log("MORREU!"); }

			$('#container').hide();
			Sound.stop();

			$('#final').show('fast', function() {				
				Sound.play('gameover.wav');
			});

			return false;
		}
	}


	//	
	//	Inimigos
	//

	Inimigos = [];

	function Inimigo(I) {
		I = I || {};

		I.active = true;
		I.age = Math.floor(Math.random() * 128);

		I.color = "#A28";

		I.x = CANVAS_WIDTH / 4 + Math.random() * CANVAS_WIDTH / 2;
		I.y = 0;
		I.xVelocidade = 0;
		I.yVelocidade = 2;

		I.width = 90;
		I.height = 90;

		// detecta a area útil
		I.inBounds = function() {	
			return I.x >= 0 && I.x <= CANVAS_WIDTH && I.y >= 0 && I.y <= CANVAS_HEIGHT; 
		};

		I.personagem =  PERSONAGENS_INIMIGOS[ getRandomInt(PERSONAGENS_INIMIGOS.length) ].nome; //Uncaught TypeError: Cannot read property 'nome' of undefined

		if (typeof (I.personagem != 'undefined')) {
			I.sprite =  Sprite(I.personagem); //Sprite("bacon");
		}
		
		I.draw = function() {
			this.sprite.draw(canvas, this.x, this.y);
		};

		I.update = function() {
			I.x += I.xVelocidade;
			I.y += I.yVelocidade;
			I.xVelocidade = 3 * Math.sin(I.age * Math.PI / 64);
			I.age++;
			I.active = I.active && I.inBounds();
		};

		I.explode = function() {
			this.active = false;

			//adicionar grafico de explisao
			player.sprite = Sprite("explosion.wav");
		}

		return I;
	}



	//	
	//	Amigos
	//

	Amigos = [];

	function Amigo(A) {
		A = A || {};

		A.active = true;
		A.age = Math.floor(Math.random() * 128);

		A.color = "#F28";		

		A.x = CANVAS_WIDTH / 4 + Math.random() * CANVAS_WIDTH / 2;
		A.y = 0;
		A.xVelocidade = 0;
		A.yVelocidade = 2;

		A.personagem =  PERSONAGENS_AMIGOS[ getRandomInt(PERSONAGENS_AMIGOS.length) ];

		A.width = 90; // A.personagem.w;  //64;
		A.height = 90; // A.personagem.h;

		// detecta a area útil
		A.inBounds = function() {	
			return A.x >= 0 && A.x <= CANVAS_WIDTH && A.y >= 0 && A.y <= CANVAS_HEIGHT; 
		};

		if (typeof (A.personagem.nome != 'undefined')) {
			A.sprite = Sprite( A.personagem.nome ); //Sprite("brocolis");	
		}		

		A.draw = function() {
			this.sprite.draw(canvas, this.x, this.y);
		};

		A.update = function() {
			A.x += A.xVelocidade;
			A.y += A.yVelocidade;

			A.xVelocidade = 3 * Math.cos(A.age * Math.PI / 64);

			A.age++;

			A.active = A.active && A.inBounds();
		};

		A.explode = function() {

			$("#pontuacao_div").text( player.pontuacao ); // atualiza pontuacao visual
			$("#final #pontuacao_div").text( player.pontuacao ); // atualiza pontuacao visual
			this.active = false;

			delete this;					
		}

		return A;
	}






	//
	//	Prêmios
	//

	var powerup = {
		color: "#0EA",
		x: 240,
		y: 0,
		xVelocidade: 0,
		yVelocidade: 2,
		width: 90,
		height: 90,		
		active: false,
		tipo: 0,
		age: Math.floor(Math.random() * 128)
	}

	powerup.sprite = Sprite("power");

	powerup.init = function () {

		this.x = CANVAS_WIDTH / 4 + Math.random() * CANVAS_WIDTH / 2;
		this.y = 0;
		this.xVelocidade = 0;
		this.yVelocidade = 2;		

		//atualiza o Sprite
		p = PERSONAGENS_POWERUPS[getRandomInt(PERSONAGENS_POWERUPS.length)];

		this.sprite = Sprite(p.nome);
		this.tipo = p.tipo;

		console.log(this.tipo);
	}


	powerup.draw = function () {
		if(this.active) {			
			this.sprite.draw(canvas, this.x, this.y);
			if(DEBUG) { /*console.log(this.active);*/ }			
		}
	}

	// detecta a area útil
	powerup.inBounds = function() {	
		return this.x >= 0 && this.x <= CANVAS_WIDTH && this.y >= 0 && this.y <= CANVAS_HEIGHT; 
	};	

	powerup.update = function() {
		this.x += this.xVelocidade;
		this.y += this.yVelocidade;
		this.xVelocidade = 3 * Math.sin(this.age * Math.PI / 64);
		this.age++;
		this.active = this.active && this.inBounds();
	};

	powerup.explode = function() {		
		//$("#pontuacao_div").text( player.pontuacao );
		this.active = false;

		delete this;					
	}
	




	// Algoritimo de colisao
	function collides(a ,b) {
		return 	a.x < b.x + b.width &&
				a.x + a.width > b.x &&
				a.y < b.y + b.height &&
				a.y + a.height > b.y;
	}

	// Teste de colisão e consequencia
	function handleCollisions() {

	  Inimigos.forEach(function(inimigo) {
	    if (collides(inimigo, player)) { //testa colisao dos inimigos
	      inimigo.explode();
	      player.explode();

	      Sound.play("bad.wav");
	    }
	  });

	  Amigos.forEach(function(amigo) { //testa colisao dos amigos
	    if (collides(amigo, player)) {	  
	      player.pontua();
	      amigo.explode();

	      Sound.play("goodie.wav");
	    }
	  });

	  if (collides(powerup, player)) { //testa colisao com PowerUP
	      powerup_type = powerup.tipo;
	      powerup_colisao = true;

		  //Sound.play("powerup.wav");
	    };	  

	}	


	function addAmigosPesonagem(nome, h, w) {		
		var p = { 'pers' : { 'nome' : nome, 'h' : h, 'w' : w } };
		PERSONAGENS_AMIGOS.push(p.pers);
	}

	function addInimigosPersonagem(nome, h, w) {		
		var p = { 'pers' : { 'nome' : nome, 'h' : h, 'w' : w } };
		PERSONAGENS_INIMIGOS.push(p.pers);
	}

	function addPowerUpPersonagem(nome, t) {		
		var p = { 'pers' : { 'nome' : nome, 'tipo' : t } };
		PERSONAGENS_POWERUPS.push(p.pers);
	}	

	addInimigosPersonagem('bacon',103, 109);
	addInimigosPersonagem('cachorro',88, 82);
	addInimigosPersonagem('pizza',98, 107);
	addInimigosPersonagem('refri',101, 114);
	addInimigosPersonagem('bacon',103, 109);
	addAmigosPesonagem('banana',102, 108);
	addAmigosPesonagem('brocolis',117, 128);
	addAmigosPesonagem('morango',105, 129);
	addAmigosPesonagem('rabanete',58, 128);
	addAmigosPesonagem('banana',102, 108);
	addPowerUpPersonagem('cogumelo',1);
	addPowerUpPersonagem('canabis',2);
	addPowerUpPersonagem('cafe',3);
	addPowerUpPersonagem('cogumelo',1);




	// ****************************************************
	// ****************************************************
	// ****************************************************
	// Comportamento dos botões das telas (intro e fim)
	// ****************************************************

	$("#final #btn_reinicio").click(function() {
		window.location.reload();
	});

	$(".btn_left").bind('vmousedown',function() { mobileClickLeft = true; 
	}).bind('mouseup',function() { mobileClickLeft = false; });	

	$(".btn_right").bind('vmousedown',function() { mobileClickRight = true; 
	}).bind('mouseup',function() { mobileClickRight = false; });




});


// Função para gerar um numero aleatorio, com range predefinido
// return 0.1 ao infinito
function getRandom(pQuant) {
	return Math.floor((Math.random()*pQuant));
}

// Função para gerar um numero aleatorio, com range predefinido
// return 1 ao inifinto
function getRandomInt(pQuant) {
	return Math.floor((Math.random()*pQuant)+1);
}

function reiniciar() {
	window.location.reload();
}



