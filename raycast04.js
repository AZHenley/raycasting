class Raycaster04 {
    constructor() {
      this.canvas = document.getElementById('raycast04');
      document.getElementById('raycast04').tabIndex = 0;
      this.ctx = this.canvas.getContext('2d');
      this.player = {
        x: 1,
        y: 1,
        angle: 1,
        fov: Math.PI / 4
        };
      this.keyState = {};
      this.map = [
            [1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 0, 1, 0, 0, 1],
            [1, 0, 1, 0, 0, 1, 0, 0, 1],
            [1, 0, 0, 1, 0, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1]
        ];

    document.addEventListener('keydown', function(event) {
        this.keyState[event.code] = true;
    }.bind(this));
    
    document.addEventListener('keyup', function(event) {
        this.keyState[event.code] = false;
    }.bind(this));

    this.canvas.addEventListener('focus', () => this.focused = true);
    this.canvas.addEventListener('blur', () => this.focused = false);

    this.gameLoop = this.gameLoop.bind(this);
    this.gameLoop();
    }

    castRay(rayAngle) {
        let x = this.player.x;
        let y = this.player.y;
        let dx = Math.cos(rayAngle);
        let dy = Math.sin(rayAngle);

        // Increment x and y until we hit a wall
        let i = 0;
        while (this.map[Math.floor(y)][Math.floor(x)] === 0) {
            x += dx * 0.1;
            y += dy * 0.1;
            i++;
            if (i > 400) break;  // Prevent infinite loops
        }
        
        const distance = Math.sqrt((x - this.player.x) ** 2 + (y - this.player.y) ** 2);
        const wallHeight = 300 / distance;

        return { distance, wallHeight };
    }

    drawWallSlice(i, distance, wallHeight, ditherPatternSize, sliceWidth) {
        // Calculate darkness based on distance
        const darknessFactor = 1 + (distance / 4); 

        for (let j = 0; j < wallHeight; j++) {
            let yPosition = Math.floor(300 - wallHeight / 2 + j);

            // Create a dithering pattern based on the pixel's coordinates
            let dither = ((i + yPosition) % ditherPatternSize < ditherPatternSize / 2) ? 10 : 0;

            // Adjust color
            let baseColor = 180 + dither;
            let adjustedColor = Math.floor(baseColor / darknessFactor);

            this.ctx.fillStyle = `rgb(${adjustedColor}, 0, ${adjustedColor})`;
            this.ctx.fillRect(i * sliceWidth, yPosition, sliceWidth, 1);
        }
    }

    raycast() {
        const rays = 200;
        const screenWidth = 800; 
        const sliceWidth = screenWidth / rays;
        const angleStep = this.player.fov / rays;
        const ditherPatternSize = 8;  

        // Sky
        this.ctx.fillStyle = 'rgb(20, 0, 20)';
        this.ctx.fillRect(0, 0, 800, 300);  

        // Ground
        this.ctx.fillStyle = 'rgb(60, 0, 60)';
        this.ctx.fillRect(0, 300, 800, 300); 

        // Walls
        for (let i = 0; i < rays; i++) {
            const rayAngle = this.player.angle - (this.player.fov / 2) + i * angleStep;
            const { distance, wallHeight } = this.castRay(rayAngle);
            this.drawWallSlice(i, distance, wallHeight, ditherPatternSize, sliceWidth);
        }
    }

isPlayerTouchingWall() {
    const floorX = Math.floor(this.player.x);
    const floorY = Math.floor(this.player.y);

    if (floorX < 0 || floorX >= this.map[0].length || floorY < 0 || floorY >= this.map.length) {
        return true; // Consider out-of-bounds as 'wall'
    }

    return this.map[floorY][floorX] !== 0;
}


updatePlayer() {
    const speed = 0.025;
    const angularSpeed = 0.025;
    const oldX = this.player.x; const oldY = this.player.y;

    if (this.keyState["KeyW"]) {
        this.player.x += Math.cos(this.player.angle) * speed;
        this.player.y += Math.sin(this.player.angle) * speed;
    }
    if (this.keyState["KeyS"]) {
        this.player.x -= Math.cos(this.player.angle) * speed;
        this.player.y -= Math.sin(this.player.angle) * speed;
    }
    if (this.keyState["KeyA"]) {
        this.player.angle -= angularSpeed;
    }
    if (this.keyState["KeyD"]) {
        this.player.angle += angularSpeed;
    }

    // Keep the angle between 0 and 2*PI
    if (this.player.angle < 0) this.player.angle += 2 * Math.PI;
    if (this.player.angle >= 2 * Math.PI) this.player.angle -= 2 * Math.PI;

    if (this.isPlayerTouchingWall()) {
        this.player.x = oldX;
        this.player.y = oldY;
    }
};

// Update gameLoop function to include updatePlayer
gameLoop() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Update player state based on key presses
    if (this.focused) this.updatePlayer();

    // Rendering logic
    this.raycast();

    requestAnimationFrame(this.gameLoop);
}

}


const RC04 = new Raycaster04();