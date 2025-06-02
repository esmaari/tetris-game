
const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');


const canvasPlayer = document.getElementById('player');
const playerContext = canvasPlayer.getContext('2d');

let ersterStein = true;

context.scale(20,20);
playerContext.scale(20,20);

function arenaSweepStep1() {
	let index = 0;
	outer: for (let y = arena.length -1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) { //wenn Row nicht full voll, dann macht weiter
                continue outer;
            }
        }

		arena[y].fill(8);
		window.setTimeout( arenaSweep,200, y + index);
		index++;
		player.score +=1 * 10;
	}

function arenaSweep(y) {
		const row = arena.splice(y, 1)[0].fill(0); 
		arena.unshift(row);
        ++y;        
    }
}

function collide(arena, player) {
    const m = player.matrix;
    const o = player.pos;
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
               (arena[y + o.y] &&
                arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}


	
function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function createPiece(type)
{
    if (type === 'I') {
        return [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
        ];
    } else if (type === 'L') {
        return [
            [0, 2, 0],
            [0, 2, 0],
            [0, 2, 2],
        ];
    } else if (type === 'J') {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [3, 3, 0],
        ];
    } else if (type === 'O') {
        return [
            [4, 4],
            [4, 4],
        ];
    } else if (type === 'Z') {
        return [
            [5, 5, 0],
            [0, 5, 5],
            [0, 0, 0],
        ];
    } else if (type === 'S') {
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ];
    } else if (type === 'T') {
        return [
            [0, 7, 0],
            [7, 7, 7],
            [0, 0, 0],
        ];
    } else if (type === 'black') {
        return [
            [8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8]
        ];
    }
}

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x,
                                 y + offset.y,
                                 1, 1);
				context.strokeStyle = "white";
				context.lineWidth   = 0.1;
				context.strokeRect(x + offset.x,
                                 y + offset.y,
                                 1, 1);
            }if (value === 8) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x,
                                 y + offset.y,
                                 1, 1);
            }
        });
    });
}

function drawPlayerNext(matrix, offset) {
	playerContext.clearRect ( 0, 0, canvasPlayer.width, canvasPlayer.height );
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                playerContext.fillStyle = colors[value];
                playerContext.fillRect(x + offset.x, y + offset.y, 1, 1);
				playerContext.strokeStyle = "white";
				playerContext.lineWidth   = 0.1;
				playerContext.strokeRect(x + offset.x,
                                 y + offset.y,
                                 1, 1);
            }
        });
    });
}

function draw() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);

	drawPlayerNext(player.matrixNext,{x: 6, y: 2} );
    
	drawMatrix(player.matrix, player.pos)
	drawMatrix(arena, {x: 0, y: 0});
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
		playerReset(); 
		arenaSweepStep1();
		updateScore();
    }
    dropCounter = 0;
}


function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir;
    }
}

function playerReset() {
    const pieces = 'TJLOSZI';		
		if ( ersterStein ){
			player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
			ersterStein = false;
		} else {
			player.matrix = player.matrixNext;
		}
    
	player.matrixNext = createPiece(pieces[pieces.length * Math.random() | 0]);
	player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);

    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
		
		player.score = 0;
		player.level = 1;
        updateScore();
    }
}

function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
	while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

function rotate(matrix, dir){
	for (let y = 0; y < matrix.length; ++y ) {
		for ( let x = 0; x < y; ++x ) {
	//transpose:
			[ 
				matrix[x][y],
				matrix[y][x],
			] = [
				matrix[y][x],
				matrix[x][y],
			];
		}
	}
	//reverse:
	if ( dir > 0 ) { // wenn die positiv ist
		matrix.forEach(row => row.reverse() );
	}else{
		matrix.reverse();
	}
}

const player = {
    pos: {x: 0, y: 0},
    matrix: null,
	matrixNext:null,
    score: 0,
	level:1,
};

function levelUp(speed){
	
	if (player.score >= 400 ) {
		speed = 100;
		player.level=10;
		
	}else if (player.score >= 300 ) {
		speed = 250;
		player.level=9;
		
	}else if (player.score >= 250 ) {
		speed = 300;
		player.level=8;
	}else if (player.score >= 200 ) {
		speed = 400;
		player.level=7;
		
	}else if (player.score >= 150 ) {
		speed = 500;
		player.level=6;
		
	}else if (player.score >= 120 ) {
		speed = 600;
		player.level=5;
		
	}else if (player.score >= 90 ) {
		speed = 700;
		player.level=4;
		
	}else if (player.score >= 60 ) {
		speed = 800;
		player.level=3;
	
	}else if (player.score >= 30 ) {
		speed = 900;
		player.level=2;
	}
	return speed;
}

let dropCounter = 0;
let lastTime = 0;
let dropInterval = 1000;

function update(time = 0){
	const deltaTime = time - lastTime;
	lastTime = time;
	dropCounter +=deltaTime;
	
	if(dropCounter > dropInterval) {
		playerDrop();
	}

	draw();
	requestAnimationFrame(update);

	dropInterval = levelUp(1000);
	updateLevel();
	
	
}
	
const colors = [
    null,
    '#FF0D72',
    '#0DC2FF',
    '#0DFF72',
    '#F538FF',
    '#FF8E0D',
    '#FFE138',
    '#3877FF',
	'#000000',
];

const arena = createMatrix(12,20);

function updateScore() {
    document.querySelector('#score').innerHTML = player.score;	
}

function updateLevel() {
    document.querySelector('#level').innerHTML = player.level;
}

document.addEventListener('keydown', event => {
	
	if (event.keyCode === 37) {
		playerMove(-1);
    } else if (event.keyCode === 39) {
        playerMove(1);
    } else if (event.keyCode === 40) {
        playerDrop();
	} else if (event.keyCode === 90) { 
        playerRotate(-1);
	} else if (event.keyCode === 38) { 
        playerRotate(1);
	} 
	
});

playerReset(); 
updateScore();
updateLevel();
update();

	
