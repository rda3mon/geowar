/*
* Set Namespace to GeoWars
*/
if("undefined"==typeof(Geowars)){
	var Geowars={};
	var MouseOP={};
};

var winner = "not set"

function theWinner(){
	if(winner != "not set"){
		alert("Winner is " + winner);
	} else {
		alert("Winner is not decided as yet");	
	}
}

// global variables
var ctx;
var mouse_x;
var mouse_y;
var draw_bool = false;
var count_down = 60;
var direction;
var red_diagonal = 0;
var blue_diagonal = 0;
var diagonal = false;
var one_directions = "RLUD";
var player1 = "HUMAN";
var player2 = "RND BOT";
var two_directions = ["RU", "RD", "UL", "UR", "LU", "LD", "DL", "DR"];
// left, up, right, down, lu, ur, rd, dl
var direction_array = [-1, 0,  0, -1,  1, 0,  0, 1,  -1, -1,  1, -1,  1, 1,  -1, 1];
var timeout_var = new Array(20);
// true = red, false = blue
var turn = false;
var board = new Array(100);
var new_moves = new Array();

if(window.addEventListener){
	window.addEventListener('load', function(){
		var canvas;
		var input = "";
		function init() {
			canvas = document.getElementById('geowars');
			if(!canvas.getContext){
				alert('Your browser does not seem support html5 canvas element');
				return;
			}
			ctx = canvas.getContext('2d');
			canvas.addEventListener('mousemove', mouseMoveEvt, false);
			canvas.addEventListener('click', mouseClickEvt, false);
			window.addEventListener('keydown', keyDownEvt, false);
		}

		function mouseMoveEvt(evt){
			var x = 0;
			var y = 0;
			if(evt.layerX || evt.layerX == 0){
				x = evt.layerX;
				y = evt.layerY;
			} else if (ev.offsetX || evt.offsetX == 0){
				x = evt.offsetX;
				y = evt.offsetY;
			}
			Geowars.draw_mouse_coordinates(x, y);
		}

		function mouseClickEvt(evt){
			if(evt.layerX || evt.layerX == 0){
				mouse_x = evt.layerX;
				mouse_y = evt.layerY;
			} else if (ev.offsetX || evt.offsetX == 0){
				mouse_x = evt.offsetX;
				mouse_y = evt.offsetY;
			}

			// start game 540, 10, 630, 50
			if( mouse_x >= 540 && mouse_x <= 630 && mouse_y >= 10 && mouse_y <= 50){
				//document.body.style.cursor='wait';
				if(confirm("Clear Current Board?")){
					Geowars.clear_canvas();
					Geowars.start_game();
				}
			}
			if(mouse_x > 530 && mouse_x < 630 && mouse_y > 310 && mouse_y < 350){
				if(confirm("Clear Current Board?")){
					if(player1 == "HUMAN"){
						player1 = "RND BOT";
					} else {
						player1 = "HUMAN";
					}
					Geowars.draw_play_type_box();
					Geowars.clear_canvas();
					Geowars.start_game();
				}
			}

			if(mouse_x > 530 && mouse_x < 630 && mouse_y > 370 && mouse_y < 410){
				if(confirm("Clear Current Board?")){
					if(player2 == "HUMAN"){
						player2 = "RND BOT";
					} else {
						player2 = "HUMAN";
					}
					Geowars.draw_play_type_box();
					Geowars.clear_canvas();
					Geowars.start_game();
				}
			}

			if(mouse_x >= 0 && mouse_x < 500 && mouse_y >= 0 && mouse_y < 500){
				if((turn && (player1 == "HUMAN")) || ((!turn) && (player2 == "HUMAN"))){
					Geowars.nearest_valid_point(mouse_x, mouse_y);
					if(Geowars.validate_input()){
						if(diagonal){
							if(turn){
								red_diagonal++;
						} else {
								blue_diagonal++;
							}
						}
						if(Geowars.draw_cover()){
							for(var i = 60; i > 0; --i){
								clearTimeout(timeout_var[i]);	
							}
						}
						Geowars.player_swap();
						//Geowars.draw_instructions("Use `Mouse/Nav Keys - A(Left), W(Up), D(Right), S(Down), E(End) + Enter`");
						Geowars.input_box("valid", false);
					}
				} else {
					Geowars.draw_instructions("Wait for your turn...");
				}
			}
			
			flag = false;
		}

		function keyDownEvt(evt){
			var code;// = evt.keyCode;
			var flag = false;
			var flag_valid = false;
			var input_valid = false;
			var temp_input = "";
			//alert(evt.keyCode);
			if(!((turn && (player1 == "HUMAN")) || ((!turn) && (player2 == "HUMAN")))){
				Geowars.draw_instructions("Wait for your turn...");
				return;
			}
			switch(evt.keyCode){
				case 37:
				case 65:
					//left
					Geowars.move_ball(-1, 0, true);
					break;
				case 38:
				case 87:
					Geowars.move_ball(0, -1, true);
					//up
					break;
				case 39:
				case 68:
					Geowars.move_ball(1, 0, true);
					//right
					break;
				case 40:
				case 83:
					Geowars.move_ball(0, 1, true);
					//down
					break;

				case 13:
					// CR
					flag = true;
					if(new_moves.length == 0){
						Geowars.draw_instructions("ERROR: Start and end positions can't be the same");
						Geowars.input_box("invalid", true);
					} else {
						if(Geowars.validate_input()){
							if(diagonal){
								if(turn){
									red_diagonal++;
								} else {
									blue_diagonal++;
								}
							}
							if(Geowars.draw_cover()){
								for(var i = 60; i > 0; --i){
									clearTimeout(timeout_var[i]);	
								}
								//break;
							}
							Geowars.player_swap();
							//Geowars.draw_instructions("Use `Mouse/Nav Keys - A(Left), W(Up), D(Right), S(Down), E(End) + Enter`");
							Geowars.input_box("valid", false);
						}
					}
					break;
				
				case 35:
				case 69:
					// End
					Geowars.go_legal_end();
					break;
				
				default:
					code = "invalid";
					break;
			}
		}
		init();
	}, false);
}

Geowars = {
	width : 500,
	height : 500,
	start_x : 0,
	start_y : 0,
	red_x : 252.5,
	red_y : 252.5,
	blue_x : 252.5,
	blue_y : 257.5,

	update_board_state : function(rx, ry, bx, by){
		Geowars.input_box("valid", false);
		if(turn){
			new_moves.push(Geowars.red_x);
			new_moves.push(Geowars.red_y);
		} else {
			new_moves.push(Geowars.blue_x);
			new_moves.push(Geowars.blue_y);
		}
		Geowars.red_x = rx;
		Geowars.red_y = ry;
		Geowars.blue_x = bx;
		Geowars.blue_y = by;


		Geowars.draw_player_boxes();
		Geowars.writeText("Pos: " + Math.floor(Geowars.red_x/5) + "," + Math.floor(Geowars.red_y/5), 545, 95, "bold 12px Times New Roman", "black");
		Geowars.writeText("Pos: " + Math.floor(Geowars.blue_x/5) + "," + Math.floor(Geowars.blue_y/5), 545, 155, "bold 12px Times New Roman", "black");

	},

	move_ball : function(i, j, flag){
		var x, y, color;
		//Geowars.draw_instructions("Use `Mouse/Nav Keys - A(Left), W(Up), D(Right), S(Down), E(End) + Enter`");
		Geowars.draw_instructions("Use `Mouse / Arrow Keys - To make a valid move and press Enter`");

		if(turn == true){
			x = Geowars.red_x + i*5;
			y = Geowars.red_y + j*5;
			if( x < 0 || y < 0 || x > 500 || y > 500){
				return;
			}
			if(new_moves.length != 0){
				if(board[Math.floor(Geowars.red_x/5)][Math.floor(Geowars.red_y/5)] == ""){
					ctx.clearRect(Geowars.red_x - 1.5, Geowars.red_y - 1.5,3,3);
				}
			}	
			Geowars.update_board_state(x, y, Geowars.blue_x, Geowars.blue_y);
			color = "red";
		} else {
			x = Geowars.blue_x + i*5;
			y = Geowars.blue_y + j*5;
			var flag1 = false;
			if( x < 0 || y < 0 || x > 500 || y > 500){
				return;
			}
			if(new_moves.length != 0){

				if(board[Math.floor(Geowars.blue_x/5)][Math.floor(Geowars.blue_y/5)] == ""){
					ctx.clearRect(Geowars.blue_x - 1.5, Geowars.blue_y - 1.5,3,3);
				}
			}
			Geowars.update_board_state(Geowars.red_x, Geowars.red_y, x, y);
			color = "blue";
		}
		// contruct cell
		if(board[Math.floor(x/5)][Math.floor(y/5)] == ""){
			ctx.beginPath();
			ctx.strokeStyle = color;
			Geowars.circle(x, y, 0.5);
			ctx.closePath();
			ctx.stroke();
		}
	},


	nearest_valid_point : function(mouse_x, mouse_y){
		var start_x;
		var start_y;
		var end_x;
		var end_y;
		var arr = new Array();
		if(turn){
			start_x = Geowars.red_x;
			start_y = Geowars.red_y;
		} else {
			start_x = Geowars.blue_x;
			start_y = Geowars.blue_y;
		}

		i = 0
		var rem_x = mouse_x%10;
		var rem_y = mouse_y%10;
		mouse_x = mouse_x - rem_x;
		mouse_y = mouse_y - rem_y;
		if(rem_x <= 5)
			mouse_x = mouse_x + 2.5;
		else 
			mouse_x = mouse_x + 7.5;

		if(rem_y <= 5)
			mouse_y = mouse_y + 2.5;
		else 
			mouse_y = mouse_y + 7.5;

		while(i < 100){
			if(i == 0) {
				end_x = 2.5;
				end_y = 2.5;
			}
			
			if ((start_x == end_x) 
				|| (start_y == mouse_y)
				|| (Math.abs(start_x - end_x) == Math.abs(start_y - mouse_y))){
				arr.push(end_x);
				arr.push(mouse_y);
			}
			if ((start_x == mouse_x) 
				|| (start_y == end_y)
				|| (Math.abs(start_x - mouse_x) == Math.abs(start_y - end_y))){
				arr.push(mouse_x);
				arr.push(end_y);
			}
			end_x += 5;
			end_y += 5;
			i++;
		}

		var d = 999;
		var near_x;
		var near_y;
		for(i = 0; i < arr.length; i+=2){
			x = arr[i] - mouse_x;
			y = arr[i+1] - mouse_y
			var temp = Math.sqrt(x*x + y*y);		
			if(temp < d){
				d = temp;
				near_x = arr[i];
				near_y = arr[i+1];
			}
		}
		var res = Geowars.get_direction(start_x, start_y, near_x, near_y);
		i = res.r1;
		j = res.r2;
		new_moves = new Array();

		new_moves.push(start_x)
		new_moves.push(start_y);
		while(true){
			start_x = start_x + i*5;	
			start_y = start_y + j*5;	
			if((start_x == near_x) && (start_y == near_y))
				break;
			new_moves.push(start_x)
			new_moves.push(start_y);
		}
		if(turn){
			Geowars.red_x = near_x;
			Geowars.red_y = near_y;
		} else {
			Geowars.blue_x = near_x;
			Geowars.blue_y = near_y;
		}
	},

	input_box : function(input, flag){
		if(flag){
			Geowars.fill_color("brown", 1.0);
		} else {
			Geowars.fill_color("#A3CC52", 1.0);
		}
		ctx.strokeStyle = "black";
		Geowars.rect(530, 250, 100, 40);
		Geowars.stroke_rect(530, 250, 100, 40);
		Geowars.writeText("MOVE: " + input, 535, 275, "bold 11px Times New Roman", "black");
	},

	draw_play_type_box : function(){
		ctx.strokeStyle = "black";
		Geowars.fill_color("brown", 1.0);
		Geowars.rect(530, 310, 100, 40);
		Geowars.stroke_rect(530, 310, 100, 40);
		Geowars.writeText(player1, 545, 335, "bold 11px Times New Roman", "black");

		Geowars.fill_color("blue", 1.0);
		Geowars.rect(530, 370, 100, 40);
		Geowars.stroke_rect(530, 370, 100, 40);
		Geowars.writeText(player2, 545, 395, "bold 11px Times New Roman", "black");
	},


	control_boxes : function(color){
		Geowars.fill_color(color, 1.0);
		ctx.strokeStyle = "black";
		Geowars.circle(580, 300, 20);
		Geowars.stroke_circle(580, 300, 20);
		Geowars.stroke_circle(580, 300, 18);
		Geowars.stroke_circle(580, 300, 16);

		Geowars.draw_triangle(610, 280, 610, 320, 630, 300);
		Geowars.draw_triangle(550, 280, 550, 320, 530, 300);
		Geowars.draw_triangle(560, 330, 600, 330, 580, 350);
		Geowars.draw_triangle(560, 270, 600, 270, 580, 250);

	},

	draw_triangle : function(x1, y1, x2, y2, x3, y3){
		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.lineTo(x3, y3);
		ctx.lineTo(x1, y1);
		ctx.fill();
		ctx.stroke();
	},

	draw_mouse_coordinates : function(x, y){
		Geowars.fill_color("#A3CC52", 1.0);
		ctx.strokeStyle = "black";
		Geowars.rect(530, 190, 100, 40);
		Geowars.stroke_rect(530, 190, 100, 40);
		Geowars.writeText("" + Math.floor(x/5) + "," + Math.floor(y/5), 560, 215, "bold 14px Times New Roman", "black");
	},

	draw_player_boxes : function(){
		// red player position
		Geowars.fill_color("brown", 1.0);
		Geowars.rect(530, 70, 100, 40);
		Geowars.stroke_rect(530, 70, 100, 40);

		// blue player position
		Geowars.fill_color("blue", 1.0);
		Geowars.rect(530, 130, 100, 40);
		Geowars.stroke_rect(530, 130, 100, 40);
	},

	go_legal_end : function(){
		if(new_moves.length == 0){
			return;
		}
		var end_x;
		var end_y;
		if(turn){
			end_x = Geowars.red_x;
			end_y = Geowars.red_y;
		} else {
			end_x = Geowars.blue_x;
			end_y = Geowars.blue_y;
		}

		var start_x = new_moves[0]; 
		var start_y = new_moves[1]
		if(!(Math.abs(start_x - end_x) == Math.abs(start_y - end_y))){
			start_x = new_moves[new_moves.length-2];
			start_y = new_moves[new_moves.length-1];
		}
		
		
		var ret = Geowars.get_direction(start_x, start_y, end_x, end_y);
		var i = ret.r1;
		var j = ret.r2;
		
		while(!(end_x < 0 || end_y < 0 || end_x > 500 || end_y > 500
				|| (board[Math.floor((end_x+i*5)/5)][Math.floor((end_y+j*5)/5)] != ""))){
			new_moves.push(end_x);
			new_moves.push(end_y);
			Geowars.move_ball(i, j, true);
			end_x = end_x + i*5;
			end_y = end_y + j*5;
			if(end_x + i*5 < 0 || end_y+j*5 < 0 || end_x+i*5 > 500 || end_y+j*5 > 500){
				break;
			}
			/*if((board[Math.floor((end_x+i*5)/5)][Math.floor(end_y/5)] != "") 
					&& (board[Math.floor(end_x/5)][Math.floor((end_y+j*5)/5)] != "")){ 
				break;
			}*/
		}
		
	},

	get_direction : function(x1, y1, x2, y2){
		var i = 0;
		var j = 0;
		if(x1 == x2) {
			if(y1 > y2){
				// up
				i = 0;
				j = -1;
			} else {
				// down	
				i = 0;
				j = 1;
			}
		} else if (y1 == y2){
			if(x1 > x2){
				//left
				i = -1;
				j = 0;
			} else {
				//right
				i = 1;
				j = 0;
			}
		}

		if( Math.abs(x1 - x2) == Math.abs(y1 - y2)){
			if(x1 > x2 && y1 > y2){
				i = -1;
				j = -1;
			} else if (x1 > x2 && y1 < y2) {
				i = -1;
				j = 1;
			} else if (x1 < x2 && y1 > y2){
				i = 1;
				j = -1;
			} else {
				i = 1;
				j = 1;
			}
		}

		return {r1 : i,r2 : j};
	},

	validate_input : function() {
		diagonal = false;
		var letter;	
		var op_letter;
		if(turn){
			new_moves.push(Geowars.red_x);
			new_moves.push(Geowars.red_y);
			letter = "R";
			op_letter = "B"
		} else {
			new_moves.push(Geowars.blue_x);
			new_moves.push(Geowars.blue_y);
			letter = "B";
			op_lettr = "R";
		}
		flag = false
		var start_x, end_x;
		var start_y, end_y;

		start_x = new_moves[0];
		start_y = new_moves[1];
		end_y = new_moves[new_moves.length-1];
		end_x = new_moves[new_moves.length-2];

		if((start_x == end_x) ||
				(start_y == end_y)){
			flag = true;
		} else if (Math.abs(start_x - end_x) == Math.abs(start_y - end_y)){
			if(turn){
				if(red_diagonal < 2){
					flag = true;
					diagonal = true;
				} else {
					Geowars.draw_instructions("ERROR: You can't use diagonal movement more than twice.");
				}
			} else {
				if(blue_diagonal < 2){
					flag = true;
					diagonal = true;
				} else {
					Geowars.draw_instructions("ERROR: You can't use diagonal movement more than twice.");
				}
			}
		} else {
			Geowars.draw_instructions("ERROR: You can only move in straight or diagonal ray.");
		}
		
		var i;
		if(diagonal){
			i = 4;	
		} else {
			i = 2;
		}
		for (; i < new_moves.length; i += 2){
			if(board[Math.floor(new_moves[i]/5)][Math.floor(new_moves[i+1]/5)] != ""){
				Geowars.draw_instructions("ERROR: You can't move to already occupied position.");
				flag = false;
			}
			if(diagonal){
				var x1 = new_moves[0];
				var y1 = new_moves[1];
				var x2 = new_moves[i];
				var y2 = new_moves[i+1];
				var res = Geowars.get_direction(x1, y1, x2, y2);
				if((board[Math.floor(x2/5) - res.r1][Math.floor(y2/5)] != "") && (board[Math.floor(x2/5)][Math.floor(y2/5)-res.r2] != "")){
				//if(((board[Math.floor(x2/5) - res.r1][Math.floor(y2/5)] != op_letter) && (board[Math.floor(x2/5)][Math.floor(y2/5)-res.r2] != op_letter)) || ((board[Math.floor(x2/5) - res.r1][Math.floor(y2/5)] != letter) && (board[Math.floor(x2/5)][Math.floor(y2/5)-res.r2] != letter))){
				//	Geowars.draw_instructions("ERROR: You can't cross an existing line.");
				//	flag = false;
				}
			}
		}

		if(!flag){
			new_moves = new Array();
			if(board[Math.floor(end_x/5)][Math.floor(end_y/5)] == ""){
				ctx.clearRect(end_x-1.5, end_y-1.5,3,3);
			}
			if(turn){
				Geowars.red_x = start_x;
				Geowars.red_y = start_y;
			} else {
				Geowars.blue_x = start_x;
				Geowars.blue_y = start_y
			}
			Geowars.input_box("invalid", true);
			return false;
		}
		return true;
	},

	draw_cover : function(){
		var end_y = new_moves.pop();
		var end_x = new_moves.pop();
		var start_x = new_moves[0];
		var start_y = new_moves[1];
		var color;
		var i;
		var j;
		var string = "";

		if(turn){
			color = "red";
			string = "R";
		} else {
			color = "blue";
			string = "B";
		}

		var ret = Geowars.get_direction(start_x, start_y, end_x, end_y);
		i = ret.r1;
		j = ret.r2;

		while(!((start_x == end_x) && (start_y == end_y))){
			start_x += i*5;
			start_y += j*5;
			// contruct cell
			ctx.beginPath();
			ctx.strokeStyle = "black";
			Geowars.circle(start_x, start_y, 0.5);
			ctx.closePath();
			ctx.stroke();
			ctx.strokeStyle = color;
			ctx.beginPath();
			//ctx.lineWidth=0.9;
			ctx.arc(start_x, start_y, 2.0, 0, Math.PI*2, true);
			ctx.closePath();
			ctx.stroke();
			board[Math.floor(start_x/5)][Math.floor(start_y/5)] = string;
		}
		var x;
		var y;
		var trapped;
		var flag = false;

		x = Math.floor(Geowars.blue_x/5);
		y = Math.floor(Geowars.blue_y/5);
		if(Geowars.is_trapped(x, y, blue_diagonal)){	
			// blue
			trapped = false;
			flag = true;
		}

		x = Math.floor(Geowars.red_x/5);
		y = Math.floor(Geowars.red_y/5);
		if(Geowars.is_trapped(x, y, red_diagonal)){	
			// red
			trapped = true;
			flag = true;
		}

		if(flag){	
			var player;
			var opponent;
			var letter;
			if(!trapped){
				player = "Blue";
				opponent = "Red";
				letter = "R"
			} else {
				player = "Red";
				opponent = "Blue";
				letter = "B";
			}
			Geowars.draw_instructions("You trapped the " + player + ". Well done...;). Winner: " + opponent);
			alert("You trapped the " + player + ". Well done...");
			winner = opponent;
			for(i = 2.5; i < 500; i+=5){
				for(j = 2.5; j < 500; j+=5){
					if(board[Math.floor(i/5)][Math.floor(j/5)] == ""){
						ctx.beginPath();
						ctx.strokeStyle = "black";
						Geowars.circle(i, j, 0.5);
						ctx.closePath();
						ctx.stroke();
						board[Math.floor(i/5)][Math.floor(j/5)] = letter;
					}
				}
			}

			return true;
			//Geowars.clear_canvas();
			//Geowars.start_game();
		}
		return false;
	},

	is_out_boundary : function(x,y){
		if(x < 0 || y < 0 || x > 99 || y > 99){
			return true;
		}
		return false;
	},

	is_trapped : function(x,y, diagonal1){
		
		if(((x == 99) ||  (board[x+1][y] != ""))
			&& ((y == 99) || (board[x][y+1] != ""))
			&& ((x == 0) || (board[x-1][y] != ""))
			&& ((y == 0) || (board[x][y-1] != ""))//){
			&& ((diagonal1 >= 2) || Geowars.is_out_boundary(x-1,y-1) || (board[x-1][y-1] != ""))
			&& ((diagonal1 >= 2) || Geowars.is_out_boundary(x-1,y+1) || (board[x-1][y+1] != ""))
			&& ((diagonal1 >= 2) || Geowars.is_out_boundary(x+1,y-1) || (board[x+1][y-1] != ""))
			&& ((diagonal1 >= 2) || Geowars.is_out_boundary(x+1,y+1) || (board[x+1][y+1] != ""))){

			return true;
		}
		return false;	
	},

	player_swap : function(){
		count_down = 60;
		new_moves = new Array();
		for(var i = 60; i > 0; --i){
			clearTimeout(timeout_var[i]);	
		}
		for(var i = 60; i > 0; --i){
			timeout_var[i] = setTimeout(function(){
				Geowars.draw_remain_time(1);
				}, i*1000);
		}

		if(turn){
			turn = false;
		}	else {
			turn = true;
		}
		Geowars.draw_turns();
	},

	draw_turns : function() {
		var player;
		ctx.strokeStyle = "black";
		if(turn == true){
			player = "red";
			Geowars.fill_color("brown", 1.0);
		} else {
			player = "blue";
			Geowars.fill_color("blue", 1.0);
		}
		Geowars.rect(75, 540, 175, 40);
		Geowars.stroke_rect(75, 540, 175, 40);
		Geowars.writeText("Turn: " + player.toUpperCase(), 125, 565, "bold 14px Times New Roman", "black");
	},

	draw_instructions : function(message){
		ctx.clearRect(10,510,630,20);
		Geowars.writeText("Instructions: " + message, 10, 520, "bold 12px Times New Roman", "brown");
	},

	draw_remain_time : function(opacity) {
		list = ["#F03A26", "#ED5A4A", "#F08073", "#F0A49C", "#F0BCB6", "#F2C9C4"];
		Geowars.fill_color(list[Math.floor(count_down/10)%6], opacity);
		ctx.strokeStyle="black";
		Geowars.rect(400, 540, 175, 40);
		Geowars.stroke_rect(400, 540, 175, 40);
		Geowars.writeText("Time Remaining: " + count_down + " s", 420, 565, "bold 12px Times New Roman", "black");
		count_down--;
		//if(count_down < 10){
			//Geowars.draw_instructions("Running out of time...");
		//}
		if(count_down == 0){
			var player;
			var opponent;
			if(turn){
				player = "Red";
				opponent = "Blue";
			} else {
				player = "Blue";
				opponent = "Red";
			}
			Geowars.draw_instructions("Player " + player + " gave up... :(. Winner: " + opponent);
			winner = opponent
		}
	},

	writeText : function(text, x, y, font, color) {
		ctx.font = font;
		ctx.fillStyle = color;
		ctx.fillText(text, x, y);		
	},

	circle : function(x, y, r){
		ctx.beginPath();
		ctx.arc(x, y, r, 0, Math.PI*2, true);
		ctx.closePath();
		ctx.fill();
	},

	stroke_circle : function(x, y, r){
		ctx.beginPath();
		ctx.arc(x, y, r, 0, Math.PI*2, true);
		ctx.closePath();
		ctx.stroke();
	},

	rect : function(x, y, w, h) {
		ctx.beginPath();
		ctx.rect(x, y, w, h);
		ctx.closePath();
		ctx.fill();
	},

	stroke_rect : function(x, y, w, h){
		ctx.beginPath();
		ctx.rect(x, y, w, h);
		ctx.closePath();
		ctx.stroke();
	},

	fill_block : function(x, y, w, h, color){
		ctx.beginPath();
		Geowars.fill_color(color, 0.4);
		Geowars.circle(x,y,2.5);
		ctx.closePath();
		ctx.fill();
	},

	clear_canvas : function(){
		ctx.clearRect(0, 0, 650, 750);
		draw_bool = false;
	},

	fill_color : function(color, alpha){
		ctx.fillStyle = color;
		ctx.globalAlpha = alpha;
	},

	clear_color : function() {
		ctx.fillStyle = "black";
		ctx.strokeStyle = "black";
		ctx.globalAlpha = 1;
	},

	draw_line_grid : function(){
		for(i = 1; i < 100; i++){
			ctx.beginPath();
			ctx.moveTo(i*5, 0);	
			ctx.lineTo(i*5, 500);
			ctx.lineWidth = 0.1;
			ctx.stroke();

			ctx.beginPath();
			ctx.moveTo(0, i*5);	
			ctx.lineTo(500, i*5);
			ctx.stroke();
		}
	},

	init_draw : function(){
		Geowars.draw_line_grid();
		ctx.lineWidth = 1;

		// draw instructions;
		//Geowars.draw_instructions("Key in arrow keys and `End` to make a legal move. And press `Enter`");
		//Geowars.draw_instructions("Use `Mouse/Nav Keys - A(Left), W(Up), D(Right), S(Down), E(End) + Enter`");
		Geowars.draw_instructions("Use `Mouse / Arrow Keys - To make a valid move and press Enter`");

		// game rules
		Geowars.writeText("Game Rules: ", 10, 620, "bold 12px Times New Roman", "brown");
		Geowars.writeText("1) Grid is of size 100 x 100", 30, 640, "bold 12px Times New Roman", "brown");
		Geowars.writeText("2) In the ply, a player moves in a straight ray either vertically, horizontally, or ", 30, 660, "bold 12px Times New Roman", "brown");
		Geowars.writeText("diagonally (but only 2 times diagonally for one player in the entire game)", 45, 680, "bold 12px Times New Roman", "brown");
		Geowars.writeText("from the player's last stopping point.", 45, 700, "bold 12px Times New Roman", "brown");
		Geowars.writeText("3) The ray must not touch any line or point already colored red or blue", 30, 720, "bold 12px Times New Roman", "brown");
		Geowars.writeText("4) The first player who cannot draw a ray loses.", 30, 740, "bold 12px Times New Roman", "brown");
		// canvas area
		ctx.lineWidth = 2;
		ctx.globalAlpha = 1;
		Geowars.stroke_rect(0, 0, 650, 750);

		// game area
		ctx.lineWidth = 0.8;
		ctx.strokeStyle = "black";
		ctx.strokeRect(Geowars.start_x, Geowars.start_y, Geowars.width, Geowars.height);

		// start game button
		Geowars.fill_color("#A3CC52", 1.0);
		ctx.lineWidth = 1.5;
		Geowars.rect(530, 10, 100, 40);
		Geowars.stroke_rect(530, 10, 100, 40);

		Geowars.draw_player_boxes();
		
		// reset colors;
		Geowars.clear_color();
		Geowars.writeText("Start Game", 536, 35, "bold 14px Times New Roman", "black");

		// players start 
		ctx.beginPath();
		ctx.strokeStyle = "black";
		Geowars.circle(Geowars.red_x, Geowars.red_y, 0.5);
		ctx.closePath();
		ctx.stroke();
		ctx.strokeStyle = "red";
		ctx.beginPath();
		//ctx.lineWidth=0.95;
		ctx.arc(Geowars.red_x, Geowars.red_y, 2.0, 0, Math.PI*2, true);
		ctx.closePath();
		ctx.stroke();

		ctx.beginPath();
		ctx.strokeStyle = "black";
		Geowars.circle(Geowars.blue_x, Geowars.blue_y, 0.5);
		ctx.closePath();
		ctx.stroke();
		ctx.strokeStyle = "blue";
		ctx.beginPath();
		//ctx.lineWidth=0.95;
		ctx.arc(Geowars.blue_x, Geowars.blue_y, 2.0, 0, Math.PI*2, true);
		ctx.closePath();
		ctx.stroke();

		/*ctx.fillStyle = "Red";
		Geowars.circle(Geowars.red_x, Geowars.red_y,2.5);
		ctx.beginPath();
		ctx.strokeStyle = "black";
		Geowars.circle(Geowars.red_x, Geowars.red_y, 0.5);
		ctx.stroke();
		ctx.fillStyle = "Blue";
		Geowars.circle(Geowars.blue_x, Geowars.blue_y,2.5);
		ctx.beginPath();
		ctx.strokeStyle = "black";
		Geowars.circle(Geowars.blue_x, Geowars.blue_y, 0.5);
		ctx.stroke();*/

		Geowars.draw_mouse_coordinates(0, 0);

		// input box
		Geowars.input_box("invalid", true);
		Geowars.draw_play_type_box();

		draw_bool = true;
	},

	start_game : function() {
		winner = "not set"
		ctx.strokeStyle = "black";
		ctx.fillStyle = "black";
		Geowars.red_x = 252.5;
		Geowars.red_y = 252.5;
		Geowars.blue_x = 252.5;
		Geowars.blue_y = 257.5;
		turn = false;
		for(i = 0; i < 100; ++i){
			board[i] = new Array(100);
		}
		for(i = 0; i < 100; ++i){
			for(j = 0; j < 100; ++j){
				board[i][j] = "";	
			}
		}
		board[50][50] = "R";
		board[50][51] = "B";

		Geowars.init_draw();
		Geowars.update_board_state(252.5, 252.5, 252.5, 257.5);
		Geowars.draw_remain_time(1);
		Geowars.player_swap();
		Geowars.random_bot();
	},

	random_bot : function(){
		if(winner != "not set"){
			return;
		}
		if((turn && (player1 == "RND BOT")) || ((!turn) && (player2 == "RND BOT"))){
			var start_x;
			var start_y;
			var diagonal1;
			var limit = 8;

			if(turn){
				start_x = Geowars.red_x;
				start_y = Geowars.red_y;
				diagonal1 = red_diagonal;
			} else {
				start_x = Geowars.blue_x;
				start_y = Geowars.blue_y;
				diagonal1 = blue_diagonal;
			}
			if(diagonal1 >= 2){
				limit = 4;
			}
			var len = 0;
			var i;
			var j;
			var end_x;
			var end_y;
			while(len == 0){
				end_x = start_x;
				end_y = start_y;

				direction = Math.round(Math.random()*10000)%limit;
				i = direction_array[direction*2];
				j = direction_array[direction*2 + 1];
				while(true){
					end_x += i*5;
					end_y += j*5;
				
					if(Geowars.is_out_boundary(Math.floor(end_x/5), Math.floor(end_y/5)) || board[Math.floor(end_x/5)][Math.floor(end_y/5)] != ""){
						if(i != 0 && j != 0){
							diagonal = true;
						} else {
							diagonal = false;
						}
						break;	
					}
					len++	
				}
			}
			var length;
			do {
				if(len == 1){
					length = 1;
					break;
				}
				length = Math.round(Math.random()*10000)%len;
			} while(length == 0);
			new_moves = new Array();

			new_moves.push(start_x)
			new_moves.push(start_y);
			var k = 0;
			while(k < length){
				start_x = start_x + i*5;	
				start_y = start_y + j*5;	
				new_moves.push(start_x)
				new_moves.push(start_y);
				k++;
			}
			if(turn){
				Geowars.red_x = start_x;
				Geowars.red_y = start_y;
			} else {
				Geowars.blue_x = start_x;
				Geowars.blue_y = start_y;
			}

			if(diagonal){
				if(turn){
					red_diagonal++;
				} else {
					blue_diagonal++;
				}
			}
			if(Geowars.draw_cover()){
				for(var i = 60; i > 0; --i){
					clearTimeout(timeout_var[i]);	
				}
			}
			Geowars.update_board_state(Geowars.red_x, Geowars.red_y, Geowars.blue_x, Geowars.blue_y);
			Geowars.player_swap();
			Geowars.input_box("valid", false);
		}
		setTimeout(Geowars.random_bot, 500);
	},

	main : function(){
		var canvas = document.getElementById('geowars')	
		if(canvas.getContext){
			ctx = canvas.getContext('2d');

			if(!draw_bool){
				Geowars.start_game();
			}
		}
	}
};
