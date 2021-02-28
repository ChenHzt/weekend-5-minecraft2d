class Element {
    constructor(_htmlElement, _value) {
        this.htmlElement = _htmlElement;
        this.value = _value;
    }

    addStyleClass(cls) {
        this.htmlElement.classList.add(cls);
    }
    removeStyleClass(cls) {
        this.htmlElement.classList.remove(cls);
    }
}
tileENUM = { sky: 'sky', dirt: 'dirt', dirtTop: 'dirtTop', cloud: 'cloud', tree: 'tree', trunk: 'trunk', rock: 'rock' };
class Tile extends Element {

    constructor(_htmlElement, _value, _row, _col) {
        super(_htmlElement, tileENUM[_value]);
        this.row = _row;
        this.col = _col;
    }

    set type(type) {
        if (!tileENUM[type])
            throw `tile of type ${type} does not exsist`;
        this.value = type;
        this.htmlElement.setAttribute('data-type', tileENUM[type]);
    }

}

class Tool extends Element {
    // static currentTool;
    constructor(_htmlElement, _value) {
        super(_htmlElement, _value);
    }

    /**
     * @param {boolean} bool
     */
    set current(bool) {
        bool ? this.addStyleClass('tools__item--current') : this.removeStyleClass('tools__item--current');
    }
}

class InventoryItem extends Element {
    // static currentTool;
    constructor(_htmlElement, _value, _count) {
        super(_htmlElement, _value);
        this.count = _count;
    }

    /**
     * @param {boolean} bool
     */
    set current(bool) {
        bool ? this.addStyleClass('inventory__item--current') : this.removeStyleClass('inventory__item--current');
    }

    myCount(value) {
        console.log(value);
        this.count = value;
        this.htmlElement.lastElementChild.setAttribute('data-count', `${this.count}`);
    }
}

class Game {
    constructor(rows, cols) {
        this.size = { rows: rows, cols: cols }
        this.gameMatrix = [...Array(rows)].map(e => Array(cols));
        this.currentTool = 'none';
        this.tools = new Map(Array.from(document.querySelectorAll('.tools__item')).map((el) => [el.getAttribute('data-tool'), new Tool(el, el.getAttribute('data-tool'))]));
        // console.log(this.tools);
        this.tools.forEach((tool,type) => tool.htmlElement.addEventListener('click', (event) => this.toolPicked(tool,type)));
        // this.tools.forEach((tool,type,map) => console.log(tool,type,map));
        this.worldElement = document.querySelector('.world ul');
        this.createWorld();
        this.worldMap = [...Array(this.size.rows)].map(e => Array(this.size.cols));
        for (let i = 0; i < this.size.rows; i++)
            for (let j = 0; j < this.size.cols; j++)
            {
                this.worldMap[i][j] = new Tile(this.worldElement.querySelector(`li[data-col='${j}'][data-row='${i}']`), 'sky', i, j);
                this.worldMap[i][j].htmlElement.addEventListener('click', (event) => this.tileClicked(this.worldMap[i][j]));
            }
        this.occupied = new Array(this.size.cols).map(el => false);
        this.buildRandomMap(5, 5, 5);

        this.inventoryObj = {
            rock: 0,
            dirt: 0,
            dirtTop: 0,
            tree: 0,
            trunk: 0
        }
        this.inventory = new Map(Array.from(document.querySelectorAll('.inventory__item')).map((el) => [el.getAttribute('data-item'), new InventoryItem(el, el.getAttribute('data-item'),0)]));
        this.inventory.forEach((i,type) => i.htmlElement.addEventListener('click', (event) => this.useInventoryItem(i,type)));
        // this.worldElement.addEventListener('click', (event) => this.tileClicked())
    }

    toolPicked(tool, type) {
        this.currentTool = type;
        this.worldElement.setAttribute('data-current-tool', this.currentTool);
        this.tools.forEach((t) => t.current = false)
        tool.current = true;
        this.inventory.forEach((i) => i.current = false);
    }

    createWorld() {
        console.log('building world map')
        this.worldElement.style.display = 'grid';
        this.worldElement.style.gridTemplateColumns = `repeat(${this.size.cols},auto)`;
        this.worldElement.style.gridTemplateRows = `repeat(${this.size.rows},auto)`;
        let str = '';
        for (let i = 0; i < this.size.rows; i++)
            for (let j = 0; j < this.size.cols; j++) {
                str += `<li data-col=${j} data-row=${i} class='tile' data-type='sky'></li>`
            }
        const myFragment = document.createRange().createContextualFragment(str);
        this.worldElement.appendChild(myFragment);
    }

    getRandomNumber(min, max) {
        return (Math.floor(Math.random() * (max - min)) + min);
    }

    createDirt() {
        this.dirtStartRow = this.getRandomNumber(14, 17);
        for (let j = 0; j < this.size.cols; j++)
            this.worldMap[this.dirtStartRow][j].type = 'dirtTop';

        for (let i = this.dirtStartRow + 1; i < this.size.rows; i++)
            for (let j = 0; j < this.size.cols; j++)
                this.worldMap[i][j].type = 'dirt';
    }


    createCloud = () => {
        const startCol = this.getRandomNumber(0, this.size.cols);
        const startRow = this.getRandomNumber(0, 5);
        const cloudMatrix = [
            [0, 1, 1, 0, 0],
            [1, 1, 1, 1, 1],
            [0, 1, 1, 1, 0]
        ]

        console.log(startRow, startCol);
        for (let i = 0; i < cloudMatrix.length && i + startRow < this.dirtStartRow; i++)
            for (let j = 0; j + startCol < this.size.cols && j < cloudMatrix[i].length; j++)
                if (cloudMatrix[i][j] === 1) this.worldMap[i + startRow][j + startCol].type = 'cloud';
    }

    ocupied(start) {
        for (let i = start; i < start + 7 && i < this.size.cols; i++)
            if (this.occupied[i]) return true;
        return false;
    }

    createTree = () => {
        const trees = {
            0: [
                [1, 1, 1, 1, 1, 1],
                [1, 1, 1, 1, 1, 1],
                [1, 1, 1, 1, 1, 1],
                [1, 1, 1, 1, 1, 1],
                [1, 1, 1, 1, 1, 1],
                [1, 1, 1, 1, 1, 1],
                [0, 0, 2, 2, 0, 0],
                [0, 0, 2, 2, 0, 0],
                [0, 0, 2, 2, 0, 0],
                [0, 0, 2, 2, 0, 0],
                [0, 0, 2, 2, 0, 0]
            ],
            1: [
                [0, 0, 1, 1, 0, 0],
                [1, 1, 1, 1, 1, 0],
                [1, 1, 1, 1, 1, 1],
                [1, 1, 1, 1, 1, 1],
                [0, 1, 1, 1, 1, 0],
                [0, 0, 1, 1, 0, 0],
                [0, 0, 2, 2, 0, 0],
                [0, 0, 2, 2, 0, 0],
                [0, 0, 2, 2, 0, 0],
                [0, 0, 2, 2, 0, 0],
                [0, 0, 2, 2, 0, 0]
            ],
            2: [
                [0, 0, 1, 1, 0, 0],
                [0, 1, 1, 1, 1, 0],
                [1, 1, 1, 1, 1, 1],
                [1, 1, 1, 1, 1, 1],
                [0, 1, 1, 1, 1, 0],
                [0, 0, 1, 1, 0, 0],
                [0, 0, 2, 2, 0, 0],
                [0, 0, 2, 2, 0, 0],
                [0, 0, 2, 2, 0, 0],
                [0, 0, 2, 2, 0, 0],
                [0, 0, 2, 2, 0, 0],
                [0, 0, 2, 2, 0, 0],
                [0, 0, 2, 2, 0, 0]
            ]
        }
        const randomTree = trees[Math.floor(Math.random() * 3)];
        let startCol
        do {
            startCol = this.getRandomNumber(0, this.size.cols - 4);
        } while (this.ocupied(startCol));

        // startCol = Math.max(0,startCol);
        for (let i = 0; i < randomTree.length; i++) {
            let j;
            for (j = 0; j + startCol < this.size.cols && j < randomTree[i].length; j++) {
                switch (randomTree[i][j]) {
                    case 0:
                        break;
                    case 1:
                        this.worldMap[this.dirtStartRow - randomTree.length + i][j + startCol].type = 'tree'
                        break;
                    case 2:
                        this.worldMap[this.dirtStartRow - randomTree.length + i][j + startCol].type = 'trunk';
                        break;
                }
                this.occupied[j + startCol] = true;
                this.occupied[j + startCol + 1] = true;
            }

        }
    }

    createRocks = () => {
        const rocks = {
            0: [
                [0, 0, 1, 0, 0],
                [0, 1, 1, 1, 0],
                [1, 1, 1, 1, 1]
            ],
            1: [
                [0, 1, 0, 0, 0],
                [0, 1, 1, 1, 0],
                [1, 1, 1, 1, 1],
                [1, 1, 1, 1, 1],
            ],
            2: [
                [1, 1],
                [1, 1]
            ]
        }
        const randomRock = rocks[Math.floor(Math.random() * 3)];
        let startCol;
        do {
            startCol = this.getRandomNumber(0, this.size.cols - 4);
        } while (this.ocupied(startCol));

        // startCol = Math.max(0,startCol);
        for (let i = 0; i < randomRock.length; i++)
            for (let j = 0; j + startCol < this.size.cols && j < randomRock[i].length; j++) {
                if (randomRock[i][j] === 1) this.worldMap[this.dirtStartRow - randomRock.length + i][j + startCol].type = 'rock'
                this.occupied[j + startCol] = true;
                this.occupied[j + startCol + 1] = true;
            }
    }

    buildRandomMap(treesCount, rocksCount, cloudCount) {
        // this.dirtStartRow = Math.floor(Math.random() * 4) + 13;
        this.createDirt();

        for (let i = 0; i < cloudCount; i++) {
            this.createCloud();
        }
        for (let i = 0; i < rocksCount; i++) {
            this.createRocks();
        }

        for (let i = 0; i < treesCount; i++) {
            this.createTree();
        }
    }

    isCorrectTool(toolType, tileType) {
        return ((tileType === 'rock' && toolType === 'pickaxe')
            || ((tileType === 'tree' || tileType === 'trunk') && toolType === 'axe')
            || ((tileType === 'dirt' || tileType === 'dirtTop') && toolType === 'shovel'))
    }

    canBeCut(tile) {
        if (this.worldMap[tile.row][tile.col - 1] && this.worldMap[tile.row][tile.col - 1].value === tileENUM.sky
            || this.worldMap[tile.row][tile.col - (-1)] && this.worldMap[tile.row][tile.col - (-1)].value === tileENUM.sky
            || this.worldMap[tile.row - 1][tile.col].value && this.worldMap[tile.row - 1][tile.col].value === tileENUM.sky
            || this.worldMap[tile.row - (-1)][tile.col].value && this.worldMap[tile.row - (-1)][tile.col].value === tileENUM.sky)
            return true;
        return false;
    }

    tileClicked(tile) {
        if (this.isCorrectTool(this.currentTool, tile.value) && this.canBeCut(tile)) {
            this.inventory.get(tile.value).myCount( this.inventory.get(tile.value).count + 1);
            this.worldMap[tile.row][tile.col].type = 'sky';
            
        }

        else if (this.inventory.has(this.currentTool)
            && tile.value === 'sky'
            && this.inventory.get(this.currentTool).count > 0) {
            this.worldMap[tile.row][tile.col].type = this.currentTool;
            this.inventory.get(this.currentTool).myCount( this.inventory.get(this.currentTool).count - 1);
        }
    }

    useInventoryItem(item, type) {
        
        this.inventory.forEach((i) => i.current = false);
        item.current = true;
        this.tools.forEach((t) => t.current = false);
        this.currentTool = type;
        this.worldElement.setAttribute('data-current-tool', item);
    }
}




const game = new Game(20, 100);