const canvas = document.querySelector("canvas")
canvas.width = window.innerWidth
canvas.height = window.innerHeight
canvas.style.background = "url(./assets/space.jpg)"
canvas.style.backgroundSize = "cover"
canvas.style.backgroundPosition = "center"
const tool = canvas.getContext("2d")
let invaderImg = new Image()
invaderImg.src = "./assets/invader.svg"
let galaxian = new Image()
galaxian.src = "./assets/galaxian.svg"
let laserShot = new Audio("./assets/short-laser.wav")
const energy = document.querySelector(".energy span")
const pause = document.querySelector(".pause")
const score = document.querySelector(".score span")
const health = document.querySelector(":root")
const startBtn = document.querySelector(".start")
startBtn.addEventListener("click", play)
let bullets = []
let invaders = []
let points = 0, tic = 0, rf = 1, gameState = true
let g //g --> galaxian
let sid, pid // pid --> invaders-pattern-id

class Galaxian {
    constructor(x, y, width, height) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.speed = 20
    }

    draw() {
        tool.drawImage(galaxian, this.x, this.y, this.width, this.height)
    }

    setControls() {
        window.addEventListener("keydown", (e) => {
            // console.log("keydown for galaxian...")
            if (e.key == "ArrowRight" && this.x + this.width + this.speed < window.innerWidth && gameState) this.x += this.speed
            else if (e.key == "ArrowLeft" && this.x - this.speed > 0 && gameState) this.x -= this.speed
        })
    }

    setBullets() {
        window.addEventListener("click", () => {
            if (gameState && tic + 1 >= 3) {
                let bullet = new Bullet(this.x + this.width / 2 - 1, canvas.height - this.height - 20)
                let lBullet = new Bullet(this.x + this.width / 5.4, canvas.height - this.height - 20)
                let rBullet = new Bullet(this.x + (this.width - this.width / 5), canvas.height - this.height - 20)
                bullets.push(bullet)
                bullets.push(lBullet)
                bullets.push(rBullet)
                // console.log("fired...")
                laserShot.play()
                setTimeout(() => {
                    laserShot.pause()
                    laserShot.currentTime = 0
                }, 100)
            }
            else tic++
        })
    }


    didCollideWithGalaxian(invader) {
        if ((this.x >= invader.x && this.x - 5 <= invader.x + invader.width - 10) || (this.x <= invader.x && this.x + this.width >= invader.x + invader.width) || (this.x + this.width - 5 >= invader.x && this.x + this.width <= invader.x + invader.width)) {
            if (this.y <= invader.y + invader.height - 25 && this.y + this.height >= invader.y + invader.height - 25) {
                invader.exists = false
                if (5 * rf > 65 && 5 * rf <= 95) {
                    health.style.setProperty('--health', `${getComputedStyle(health).getPropertyValue('--red')}`)
                } else if (5 * rf >= 100) {
                    energy.style.width = `calc(100% - ${5 * (rf++)}%)`
                    gameState = false
                    clearInterval(sid)
                    setTimeout(() => {
                        alert('Game Over 😭. Enter or click Ok to restart')
                        restart()
                    }, 100);
                    return
                }
                energy.style.width = `calc(100% - ${5 * (rf++)}%)`
            }

        }
    }
}

class Bullet {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.width = 4
        this.height = 20
        this.color = "#ffff00"
        this.exists = true
    }

    draw() {
        tool.beginPath();
        tool.fillStyle = this.color
        tool.fillRect(this.x - 1, this.y, this.width, this.height)
        tool.fill()
    }

    update() {
        this.y -= 8;
    }
}

class Invader {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.width = 45
        this.height = 45
        this.exists = true
        this.energy = 3
        this.speed = random(2, 6)
    }
    draw() {
        tool.drawImage(invaderImg, this.x, this.y, this.width, this.height)
    }
    update() {
        this.y += this.speed
    }
}


function setPause() {
    window.addEventListener("keydown", (e) => {
        // console.log("keydown to check pause...")
        if (e.key == " ") {
            gameState = !gameState
            if (gameState) {
                pause.style.visibility = "hidden"
                createInvaders()
                invadersInPattern()
                start()
            } else {
                clearInterval(sid)
                clearInterval(pid)
                pause.style.visibility = "visible"
            }
            pause.classList.toggle("animate")
        }
    })
}

function play() {
    startBtn.removeEventListener("click", play)
    startBtn.remove()
    tic++
    invadersInPattern()
    setPause()
    createInvaders()
    createGalaxian()
    start()
}

function createInvaders() {
    if (gameState) {
        sid = setInterval(() => {
            let invader = new Invader(random(200, window.innerWidth - 200), -10)
            // let invader = new Invader(600, -10)
            invaders.push(invader)
        }, 1000)
    }
}

function invadersInPattern() {
    pid = setInterval(() => {
        clearInterval(sid)
        setTimeout(() => {
            for (let row = 0, x = 220, y = -220; row <= 4; row++, y += 50, x += 100) {
                for (let col = row, tx = x; col <= 8; col++, tx += 100) {
                    if (row == col || row + col == 8) {
                        let invader = new Invader(tx, y)
                        invader.speed = 5
                        invaders.push(invader)
                    }
                }
            }
        }, 5000)
        setTimeout(() => {
            createInvaders()
        }, 7000)
    }, 30000)
}

function createGalaxian() {
    g = new Galaxian(window.innerWidth / 2 - 120 / 2, canvas.height - 65 / 2 - 45, 120, 65)
    g.setControls()
    g.setBullets()
}

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function didCollideWithBullet(bullet, invader) {
    if (bullet.x > invader.x && bullet.x + bullet.width < invader.x + invader.width && bullet.y < invader.y + invader.height) {
        if (invader.energy == 1) {
            invader.exists = false
            points += 5 * invader.speed
            score.innerText = `${points}`
        }
        invader.energy--;
        bullet.exists = false
    }
}

function start() {
    if (!gameState) return
    tool.clearRect(0, 0, window.innerWidth, window.innerHeight)
    g.draw()
    invaders.forEach((invader, index) => {
        if (!invader.exists || invader.y > window.innerHeight) invaders.splice(index, 1)
        else {
            invader.draw()
            invader.update()
        }

    })
    if (bullets.length > 0) {
        bullets.forEach((bullet, index) => {
            if (!bullet.exists || bullet.y < 0) bullets.splice(index, 1)
            else {
                bullet.draw()
                bullet.update()
            }
        })
    }
    invaders.forEach(invader => {
        bullets.forEach(bullet => didCollideWithBullet(bullet, invader))
        g.didCollideWithGalaxian(invader)
    })

    requestAnimationFrame(start)
}

function restart() {
    clearInterval(pid)
    clearInterval(sid)
    score.innerText = 0
    points = 0
    rf = 1
    energy.style.width = "100%"
    health.style.setProperty('--health', `${getComputedStyle(health).getPropertyValue('--blue')}`)
    if (bullets.length > 0) bullets.splice(0, bullets.length)
    if (invaders.length > 0) invaders.splice(0, invaders.length)
    g.x = window.innerWidth / 2 - 120 / 2
    g.y = canvas.height - 65 / 2 - 45
    gameState = true
    createInvaders()
    start()
}

