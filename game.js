(function (window, undefined) {
    // 'use strict';
    function Field(lines, colomns, color) {
        this.lines = lines;
        this.colomns = colomns;
        this.init(color || Field.defaultColor);
    }
    Field.defaultColor = 'black';
    Field.prototype.init = function(color) {
        this._data = [];
        this._string = '';
        this._background = [];
        for (var k = 0, len = this.lines * this.colomns, i = 0, j = 0; k < len; ++k, j = k % this.colomns, i = Math.floor(k / this.colomns)) {
            this._data.push({ color: color, x: i, y: j });
            this._background.push(`background: ${color}`);
            this._string += (j === 0 && k) ? '\n' : '';
            this._string += '%c  ';
        }
        this._string += '\n';
    };
    Field.prototype.idx = function (i, j) {
        return j === undefined ? i : (i * this.colomns + j);
    };
    Field.prototype.set = function (color, i, j) {
        var k = this.idx(this.lines - i - 1, j);
        if (k < this.length && k >= 0) {
            if (this._data[k].color != color) {
                this._background[k] = `background: ${color}`;
                this._data[k].color = color;
            }
        }
    }
    Field.prototype.print = function () {
        console.log(this._string, ...this._background);
    }
    Field.prototype.drawBorders = function() {
        var k;
        this.init('white');
        for (k = 0; k < this.colomns; ++k) {
            this.set('black', 0, k);
            this.set('black', this.lines - 1, k);
        }
        for (k = 0; k < this.lines; ++k) {
            this.set('black', k, 0);
            this.set('black', k, this.colomns - 1);
        }
    }
    Field.prototype.isBorder = function (x, y) {
        return x === 0 || y === 0 || x === (this.colomns - 1) || y === (this.lines - 1);
    }
    Object.defineProperty(Field.prototype, 'length', {
        get: function() { return this._data.length; },
        enumerable: true,
    });

    function drawBlocks(blocks, field) {
        for (var i = 0, len = blocks.length, b; i < len; ++i) {
            b = blocks[i];
            field.set('black', b.y, b.x);
        }
    }
    
    function Warship(field) {
        this.field = field;
        var x = Math.floor(field.colomns / 2);
        this.panzer = [{ x, y: 1 }, { x: x - 1, y: 1 }, { x: x + 1, y: 1}, { x, y: 2 }];
        this.bullets = [];
        this.counter = 0;
        this.draw();
    }
    Object.defineProperties(Warship.prototype, {
        x: { get: function() { return this.panzer[3].x; } },
        y: { get: function() { return this.panzer[3].y; } },
    })
    Warship.prototype.move = function(dif) {
        for (var i = 0; i < this.panzer.length; ++i) {
            this.panzer[i].x += dif;
        }
    }
    Warship.prototype.draw = function() {
        drawBlocks(this.panzer, this.field);
        drawBlocks(this.bullets, this.field);
    }
    Warship.prototype.shoot = function() {
        ++this.counter;
        var i, b;
        for (i = 0; i < this.bullets.length; ++i) {
            b = this.bullets[i];
            b.y += 1;
        }
        if (this.counter % 2) {
            this.bullets.push({ x: this.x, y: this.y + 1 });
        }
        for (i = 0; i < this.bullets.length; ++i) {
            b = this.bullets[i];
            if (b.x <= 0 || b.y <= 0 || b.x >= this.field.colomns || b.y >= this.field.lines) {
                this.bullets.splice(i--, 1);
            }
        }
    }

    function Invader(x, y, field) {
        this.field = field;
        this._data = [
            { x: x - 1, y }, { x, y }, { x: x + 1, y },
            { x: x - 2, y: y - 1 }, { x: x, y: y - 1 }, { x: x + 2, y: y - 1 },
            { x: x - 2, y: y - 2 }, { x: x - 1, y: y - 2 }, { x, y: y - 2 }, { x: x + 1, y: y - 2 }, { x: x + 2, y: y - 2 },
            { x: x - 2, y: y - 3 }, { x: x + 2, y: y - 3 }
        ];
    }
    Invader.prototype.draw = function() {
        drawBlocks(this._data, this.field);
    }
    Invader.prototype.move = function() {
        for (var i = 0; i < this._data.length; ++i) {
            this._data[i].y -= 1;
        }
    }
    Invader.prototype.is = function(x, y) {
        for (var i = 0, d; i < this._data.length; ++i) {
            d = this._data[i];
            if (d.x === x && d.y === y) {
                return true;
            }
        }
        return false;
    }
    function Invaders(field) {
        this.list = [];
        this.field = field;
        this.add();
        this.counter = 0;
    }
    Invaders.prototype.add = function() {
        var field = this.field;
        var x = Math.floor(field.colomns / 2);
        var y = field.lines - 2;
        this.list.push(new Invader(x, y, field));
        this.list.push(new Invader(x -  7, y, field));
        this.list.push(new Invader(x +  7, y, field));
        this.list.push(new Invader(x - 14, y, field));
        this.list.push(new Invader(x + 14, y, field));
    };
    Invaders.prototype.move = function() {
        ++this.counter;
        if (this.counter % 10 === 0 && this.counter) {
            this.add();
        }
        for (var i = 0; i < this.list.length; ++i) {
            this.list[i].move();
        }
    }
    Invaders.prototype.check = function(x, y) {
        var idx = -1;
        for (var i = 0; i < this.list.length; ++i) {
            if (this.list[i].is(x, y)) {
                idx = i;
                break;
            }
        }
        if (idx !== -1) {
            this.list.splice(idx, 1);
        }
        return idx;
    }
    Invaders.prototype.checks = function(bullets) {
        for (var i = 0, b; i < bullets.length; ++i) {
            b = bullets[i];
            if (this.check(b.x, b.y) !== -1) {
                bullets.splice(i, 1);
                break;
            }
        }
    }
    Invaders.prototype.draw = function() {
        for (var i = 0; i < this.list.length; ++i) {
            this.list[i].draw();
        }
    }

    initconsole();
    var matrix = new Field(30, 40, 'black');
    matrix.drawBorders();
    var warship = new Warship(matrix);
    var invaders = new Invaders(matrix);
    initkeys(warship);

    tick();
    var timerId = setInterval(tick, 2000);

    function tick() {
        scene();
    }

    function drawScene() {
        console.API.clear();

        matrix.drawBorders();
        warship.draw();
        invaders.draw();

        matrix.print();
    }

    function scene() {
        invaders.move();
        invaders.checks(warship.bullets);
        warship.shoot();// create and move bullet
        invaders.checks(warship.bullets);

        drawScene();
    }

    function initkeys(warship) {
        document.addEventListener('keypress', function(e) {
            if (e.keyCode == 37) {
                warship.move(-1);
                drawScene();
            } else if (e.keyCode == 39) {
                warship.move(+1);
                drawScene();
            }
        })
    }
    function initconsole() {
        if (typeof console._commandLineAPI !== 'undefined') {
            console.API = console._commandLineAPI; //chrome
        } else if (typeof console._inspectorCommandLineAPI !== 'undefined') {
            console.API = console._inspectorCommandLineAPI; //Safari
        } else if (typeof console.clear !== 'undefined') {
            console.API = console;
        }
    }
})(window)