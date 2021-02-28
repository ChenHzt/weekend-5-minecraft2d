// const worldObj = { rows: 20, cols: 30 }
// const tileENUM = { SKY: 0, DIRT: 1, DIRT_TOP: 2, CLOUD: 3, TREE: 4, TRUNK: 5, ROCK: 6 }
// const tools = Array.from(document.querySelectorAll('.tools__item'));
// let currentTool = null;

// const world = document.querySelector('.world ul');

// const toolPicked = (tool) => {
//     currentTool = tool.getAttribute('data-tool');
//     world.setAttribute('data-current-tool', currentTool);
//     tools.forEach((t) => t.classList.remove('tools__item--current'))
//     tool.classList.add('tools__item--current');
//     inventory.forEach((i) => i.classList.remove('inventory__item--current'));
// };
// tools.forEach((tool) => tool.addEventListener('click', (event) => toolPicked(tool)));


// world.style.display = 'grid';
// world.style.gridTemplateColumns = `repeat(${worldObj.cols},auto)`;
// world.style.gridTemplateRows = `repeat(${worldObj.rows},auto)`;
// let str = '';
// for (let i = 0; i < 20; i++)
//     for (let j = 0; j < 30; j++) {
//         str += `<li data-col=${j} data-row=${i} class='tile' data-type='sky'></li>`
//     }

// const myFragment = document.createRange().createContextualFragment(str);
// world.appendChild(myFragment);

// const gameMatrix = [...Array(worldObj.rows)].map(e => Array(worldObj.cols));
// for (let i = 0; i < 20; i++)
//     for (let j = 0; j < 30; j++)
//         gameMatrix[i][j] = { tileType: tileENUM.SKY, tileElement: world.querySelector(`li[data-col='${j}'][data-row='${i}']`) };

// const createDirt = (upLine) => {
//     for (let j = 0; j < 30; j++) {
//         gameMatrix[upLine][j].tileType = tileENUM.DIRT_TOP;
//         gameMatrix[upLine][j].tileElement.setAttribute('data-type', 'dirtTop');

//     }
//     for (let i = upLine + 1; i < 20; i++)
//         for (let j = 0; j < 30; j++) {
//             gameMatrix[i][j].tileType = tileENUM.DIRT;
//             gameMatrix[i][j].tileElement.setAttribute('data-type', 'dirt');

//         }
// }

// const createCloud = (startRow, startCol) => {
//     for (let i = 0; i + startRow < 13 && i < 3; i++)
//         for (let j = 0; j + startCol < 30 && j < 5; j++) {
//             if ((i === 0 && j == 0) || (i === 0 && j == 3) || (i === 2 && j == 0) || (i === 0 && j == 4) || (i === 2 && j == 4))
//                 continue;
//             gameMatrix[i + startRow][j + startCol].tileType = tileENUM.CLOUD;
//             gameMatrix[i + startRow][j + startCol].tileElement.setAttribute('data-type', 'cloud');

//         }
// }

// const createTree = (startCol) => {
//     for (let i = 9; i < 14; i++)
//         for (let j = startCol; j < startCol + 2; j++) {
//             gameMatrix[i][j].tileType = tileENUM.TRUNK;
//             gameMatrix[i][j].tileElement.setAttribute('data-type', 'trunk');

//         }
//     for (let i = 3; i < 9; i++)
//         for (let j = startCol - 2; j < startCol + 4; j++) {
//             gameMatrix[i][j].tileType = tileENUM.TREE;
//             gameMatrix[i][j].tileElement.setAttribute('data-type', 'tree');
//         }
// }

// const createRocks = (startCol) => {
//     for (let i = 2; i >= 0; i--)
//         for (let j = startCol; j < startCol + 2 + i; j++) {
//             gameMatrix[i + 11][j].tileType = tileENUM.ROCK;
//             gameMatrix[i + 11][j].tileElement.setAttribute('data-type', 'rock');

//         }
// }

// createDirt(14);
// createCloud(3, 8);
// createCloud(1, 20);
// createTree(5);
// createTree(24);
// createRocks(1);
// let inventoryObj = {
//     rock:0,
//     dirt:0,
//     dirtTop:0,
//     tree:0,
//     trunk:0
// }

const isCorrectTool = (toolType, tileType) =>{
    return ((tileType === 'rock' && toolType === 'pickaxe')
    ||((tileType === 'tree' || tileType === 'trunk' ) && toolType === 'axe')
    ||((tileType === 'dirt' || tileType === 'dirtTop' ) && toolType === 'shovel'))
};

const canBeCut = (tile) => {
    const tileRow=tile.getAttribute('data-row');
    const tileCol=tile.getAttribute('data-col');
    const tileType= gameMatrix[tileRow][tileCol].tileType;
    if(gameMatrix[tileRow][tileCol-1].tileType === tileENUM.SKY || gameMatrix[tileRow][tileCol-(-1)].tileType === tileENUM.SKY || gameMatrix[tileRow-1][tileCol].tileType === tileENUM.SKY || gameMatrix[tileRow-(-1)][tileCol].tileType === tileENUM.SKY)
        return true;
    return false;
}

const inventory = Array.from(document.querySelectorAll('.inventory__item'));

world.addEventListener('click', (event) => {
    const tile = event.target;
    if (isCorrectTool(currentTool,tile.getAttribute('data-type')) && canBeCut(tile)) {
        const type= tile.getAttribute('data-type');
        inventoryObj[tile.getAttribute('data-type')]++;
        gameMatrix[tile.getAttribute('data-row')][tile.getAttribute('data-col')].tileType = tileENUM.SKY;
        gameMatrix[tile.getAttribute('data-row')][tile.getAttribute('data-col')].tileElement.setAttribute('data-type', 'sky');
        inventory.find((item) => item.getAttribute('data-item')===type).
             lastElementChild.setAttribute('data-count',`${inventoryObj[type]}`)
    }
    if((currentTool==='tree' || currentTool==='trunk' || currentTool==='rock' || currentTool==='dirt' || currentTool==='dirtTop') && tile.getAttribute('data-type')==='sky' && inventoryObj[currentTool]>0){
        gameMatrix[tile.getAttribute('data-row')][tile.getAttribute('data-col')].tileType = tileENUM[currentTool.toUpperCase()];
        gameMatrix[tile.getAttribute('data-row')][tile.getAttribute('data-col')].tileElement.setAttribute('data-type', currentTool);
        inventoryObj[currentTool]--;
        console.log(inventory)
        // inventory[inventory.indexOf(currentTool)].lastElementChild.setAttribute('data-count',`${inventoryObj[currentTool]}`);
        inventory.find((item) => item.getAttribute('data-item')===currentTool).
             lastElementChild.setAttribute('data-count',`${inventoryObj[currentTool]}`)
        
    }
});



const useInventoryItem =(item) =>{
    console.log('ddwe');
    inventory.forEach((i) => i.classList.remove('inventory__item--current'));
    item.classList.add('inventory__item--current');
    tools.forEach((t) => t.classList.remove('tools__item--current'));
    currentTool = item.getAttribute('data-item');
    world.setAttribute('data-current-tool','none');

}


inventory.forEach((inventoryItem) => inventoryItem.addEventListener('click', (event) => useInventoryItem(inventoryItem)));