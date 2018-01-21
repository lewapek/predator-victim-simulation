var canvasSize = 620;

var initialPredatorsCoefficient;
var initialVictimsCoefficient;
var initialFoodCoefficient;
var initialPredatorEnergy;
var initialVictimEnergy;
var predatorEnergyInc;
var predatorEnergyDec;
var victimEnergyInc;
var victimEnergyDec;
var newPredatorProbability;
var newVictimProbability;
var newFoodProbability;
var predatorMoveMaxStep;
var victimMoveMaxStep;
var stayProbability;
var millisecondsSpeed;
var borderMode;
var resolution;
var graphUpdateWaitTrials;
var backgroundType;
var predatorColor;
var victimColor;
var foodColor;

var doublePredatorMoveMaxStep;
var doubleVictimMoveMaxStep;

var field;
var energy;
var stopper;

var predatorImage = new Image();
var victimImage = new Image();
var foodImage = new Image();
predatorImage.src = 'assets/red.png';
victimImage.src = 'assets/yellow.png';
foodImage.src = 'assets/blue.png';

var predatorsNumber;
var victimsNumber;
var foodNumber;

var predatorsGraph;
var victimsGraph;
var foodGraph;

var graphIndex;
var graphUpdate;
var nbBox;

var entities = {
    nothing: 0,
    predator: 1,
    victim: 2,
    food: 3
}

function isEntityCorrect(entity) {
    return entity >= entities.nothing && entity <= entities.food;
}

function createState() {
    var chances = Math.random();

    if (chances < initialPredatorsCoefficient) {
        ++predatorsNumber;
        return entities.predator;
    }

    if (chances < initialPredatorsCoefficient + initialVictimsCoefficient) {
        ++victimsNumber;
        return entities.victim;
    }

    if (chances < initialPredatorsCoefficient + initialVictimsCoefficient + initialFoodCoefficient) {
        ++foodNumber;
        return entities.food;
    }

    return entities.nothing;
}

function setParameters() {
    millisecondsSpeed = Number(document.getElementById("millisecondsSpeed").value);
    initialPredatorsCoefficient = Number(document.getElementById("initialPredatorsCoefficient").value);
    initialVictimsCoefficient = Number(document.getElementById("initialVictimsCoefficient").value);
    initialFoodCoefficient = Number(document.getElementById("initialFoodCoefficient").value);
    initialPredatorEnergy = Number(document.getElementById("initialPredatorEnergy").value);
    initialVictimEnergy = Number(document.getElementById("initialVictimEnergy").value);
    predatorEnergyInc = Number(document.getElementById("predatorEnergyInc").value);
    predatorEnergyDec = Number(document.getElementById("predatorEnergyDec").value);
    victimEnergyInc = Number(document.getElementById("victimEnergyInc").value);
    victimEnergyDec = Number(document.getElementById("victimEnergyDec").value);
    newPredatorProbability = Number(document.getElementById("newPredatorProbability").value);
    newVictimProbability = Number(document.getElementById("newVictimProbability").value);
    newFoodProbability = Number(document.getElementById("newFoodProbability").value);
    predatorMoveMaxStep = Number(document.getElementById("predatorMoveMaxStep").value);
    victimMoveMaxStep = Number(document.getElementById("victimMoveMaxStep").value);
    stayProbability = Number(document.getElementById("stayProbability").value);
    borderMode = document.getElementById("borderMode");
    borderMode = borderMode.options[borderMode.selectedIndex].text;
    resolution = Number(document.getElementById("resolution").value);
    graphUpdateWaitTrials = Number(document.getElementById("graphUpdateWaitTrials").value);
    backgroundType = document.getElementById("backgroundType");
    backgroundType = backgroundType.options[backgroundType.selectedIndex].text;
    predatorColor = document.getElementById("predatorColor");
    predatorColor = predatorColor.options[predatorColor.selectedIndex].text;
    victimColor = document.getElementById("victimColor");
    victimColor = victimColor.options[victimColor.selectedIndex].text;
    foodColor = document.getElementById("foodColor");
    foodColor = foodColor.options[foodColor.selectedIndex].text;

    predatorImage.src = "assets/" + predatorColor + '.png';
    victimImage.src = "assets/" + victimColor + '.png';
    foodImage.src = "assets/" + foodColor + '.png';

    if(backgroundType == "Gradient") {
        document.body.style.background = 'repeating-linear-gradient(black, dimgray)';
    } else {
        document.body.style.background = backgroundType.toLowerCase();
    }

    doublePredatorMoveMaxStep = 2 * predatorMoveMaxStep;
    doubleVictimMoveMaxStep = 2 * victimMoveMaxStep;
    graphIndex = graphUpdate = 0;
    predatorsNumber = victimsNumber = foodNumber = 0;

    field = new Array(resolution);
    energy = new Array(resolution);
    for(var i = 0; i < resolution; ++i) {
        field[i] = new Array(resolution);
        energy[i] = new Array(resolution);
    }

    predatorsGraph = new Array(canvasSize);
    victimsGraph = new Array(canvasSize);
    foodGraph = new Array(canvasSize);
    for (var i = 0; i < canvasSize; ++i) {
        predatorsGraph[i] = victimsGraph[i] = foodGraph[i] = 0;
    }

    nbBox = resolution * resolution;
}

function start() {
    if (stopper != undefined) {
        clearTimeout(stopper);
    }

    setParameters();

    var cells = document.getElementById("cells");
    var plot = document.getElementById("plot");

    cells.width = cells.height = plot.width = plot.height = canvasSize;

    var cells2DContext = cells.getContext('2d');
    cells2DContext.fillRect(0, 0, cells.width, cells.height);

    var plot2DContext = plot.getContext('2d');
    plot2DContext.fillRect(0, 0, plot2DContext.width, plot2DContext.height);

    predatorsNumber = victimsNumber = foodNumber = 0;
    for (var i = 0; i < resolution; i++) {
        for (var j = 0; j < resolution; j++) {
            field[i][j] = createState();
            // setup energy
            if (field[i][j] == entities.predator) {
                energy[i][j] = initialPredatorEnergy;
            } else if (field[i][j] == entities.victim) {
                energy[i][j] = initialVictimEnergy;
            } else {
                energy[i][j] = 0;
            }
        }
    }

    launchSimulation(cells2DContext, plot2DContext);
}

function updateGraph() {
    graphUpdate = (graphUpdate + 1) % graphUpdateWaitTrials;
    if (graphUpdate == 0) {
        predatorsGraph[graphIndex] = predatorsNumber;
        victimsGraph[graphIndex] = victimsNumber;
        foodGraph[graphIndex] = foodNumber;
        ++graphIndex;
        graphIndex %= canvasSize;
        graphUpdate = 0;
    }
}

function launchSimulation(cells2DContext, plot2DContext) {
    paint(cells2DContext, plot2DContext);

    for (var i = 0; i < resolution; i++) {
        for (var j = 0; j < resolution; j++) {
            var entity = field[i][j];

            if (!isEntityCorrect(entity) || entity == entities.food) {
                continue;
            }

            if (entity == entities.nothing) {
                if (Math.random() <= newFoodProbability) {
                    field[i][j] = entities.food;
                    ++foodNumber;
                }
                continue;
            }

            //random stay
            if (Math.random() <= stayProbability) {
                continue;
            }

            var maxMoveStep, doubleMaxMoveStep;
            if(entity == entities.predator) {
                maxMoveStep = predatorMoveMaxStep;
            } else if(entity == entities.victim) {
                maxMoveStep = victimMoveMaxStep;
            }
            doubleMaxMoveStep = 2 * maxMoveStep;

            var neighbourX = Math.ceil(Math.random() * (1 + doubleMaxMoveStep)) - 1 - maxMoveStep;
            var neighbourY;

            if (neighbourX != 0) {
                neighbourY = Math.ceil(Math.random() * (1 + doubleMaxMoveStep)) - 1 - maxMoveStep;
            } else {
                if(Math.random() > 0.5) {
                    neighbourY = 1 + Math.ceil(Math.random() * (maxMoveStep - 1));
                } else {
                    neighbourY = -1 - Math.ceil(Math.random() * (maxMoveStep - 1));
                }
            }

            var newPositionX = i + neighbourX;
            var newPositionY = j + neighbourY;

            if(borderMode == "No border") {
                if (newPositionX < 0) {
                    newPositionX += resolution;
                } else if (newPositionX >= resolution) {
                    newPositionX -= resolution;
                }

                if (newPositionY < 0) {
                    newPositionY += resolution;
                } else if (newPositionY >= resolution) {
                    newPositionY -= resolution;
                }
            } else if(borderMode == "Wall") {
                if (newPositionX < 0) {
                    newPositionX = -newPositionX;
                } else if (newPositionX >= resolution) {
                    newPositionX = 2 * resolution - newPositionX - 1;
                }

                if (newPositionY < 0) {
                    newPositionY = -newPositionY;
                } else if (newPositionY >= resolution) {
                    newPositionY = 2 * resolution - newPositionY - 1;
                }
            } else if(borderMode == "Abyss") {
                if(newPositionX < 0 || newPositionX >= resolution || newPositionY < 0 || newPositionY >= resolution) {
                    field[i][j] = entities.nothing; // death

                    if(entity == entities.predator) {
                        --predatorsNumber;
                    } else if(entity == entities.victim) {
                        --victimsNumber;
                    }

                    continue;
                }
            } else {
                continue;
            }

            var newEntity = field[newPositionX][newPositionY];

            if (entity == entities.predator) {
                if (newEntity == entities.victim) {
                    energy[i][j] += predatorEnergyInc;
                    if (Math.random() > newPredatorProbability) {
                        field[newPositionX][newPositionY] = entities.nothing;
                        energy[newPositionX][newPositionY] = 0;
                    } else {
                        field[newPositionX][newPositionY] = entities.predator;
                        energy[newPositionX][newPositionY] = initialPredatorEnergy;
                        ++predatorsNumber;
                    }
                    --victimsNumber;
                } else if(newEntity == entities.food) { // predator moves on, destroys food, but does not gain energy
                    field[newPositionX][newPositionY] = entities.predator;
		    energy[newPositionX][newPositionY] = energy[i][j] - predatorEnergyDec;
                    field[i][j] = entities.nothing;
                    energy[i][j] = 0;
                    --foodNumber;
                } else {
                    energy[i][j] -= predatorEnergyDec;
                    if (energy[i][j] < 0) {
                        field[i][j] = entities.nothing; // predator dead
                        energy[i][j] = 0;
                        --predatorsNumber;
                    } else if (newEntity == entities.nothing) {//predator didn't eat victim, didn't die, so he moves on
                        field[i][j] = entities.nothing;
                        field[newPositionX][newPositionY] = entities.predator;
                        energy[newPositionX][newPositionY] = energy[i][j];
                        energy[i][j] = 0;
                    }
                }
            } else if (entity == entities.victim) {
                if (newEntity == entities.predator) {
                    field[i][j] = entities.nothing; // predator ate victim
                    energy[newPositionX][newPositionY] += predatorEnergyInc;
                    energy[i][j] = 0;
                    --victimsNumber;
                } else if (newEntity == entities.food) {
                    --foodNumber;
                    field[newPositionX][newPositionY] = entities.victim;
                    energy[newPositionX][newPositionY] = energy[i][j] + victimEnergyInc;
                    if (Math.random() > newVictimProbability) {
                        field[i][j] = entities.nothing; // no new victim born
                        energy[i][j] = 0;
                    } else {
                        field[i][j] = entities.victim;
                        energy[i][j] = initialVictimEnergy;
                        ++victimsNumber;
                    }
                } else if (newEntity == entities.nothing) { // victim moves
                    field[i][j] = entities.nothing;
                    field[newPositionX][newPositionY] = entities.victim;
                    energy[newPositionX][newPositionY] = energy[i][j] - victimEnergyDec;
                    energy[i][j] = 0;
                    if(energy[newPositionX][newPositionY] < 0) {
                        field[newPositionX][newPositionY] = entities.nothing;
                        energy[newPositionX][newPositionY] = 0;
                        --victimsNumber;
                    }
                } else {
                    energy[i][j] -= victimEnergyDec;
                    if(energy[i][j] < 0) {
                        field[i][j] = entities.nothing;
                        energy[i][j] = 0;
                        --victimsNumber;
                    }
                }
            }
        }
    }

    updateGraph();
    stopper = setTimeout(launchSimulation, millisecondsSpeed, cells2DContext, plot2DContext);
}

function paint(cells2DContext, plot2DContext) {
    cells2DContext.canvas.width = plot2DContext.canvas.width = canvasSize;

    plot2DContext.strokeStyle = predatorColor;
    plot2DContext.beginPath();
    plot2DContext.moveTo(0, canvasSize - predatorsGraph[graphIndex] * canvasSize / nbBox);
    for (var i = 1; i < canvasSize; i++) {
        plot2DContext.lineTo(i, canvasSize - predatorsGraph[(graphIndex + i) % canvasSize] * canvasSize / nbBox);
    }
    plot2DContext.stroke();

    plot2DContext.strokeStyle = victimColor;
    plot2DContext.beginPath();
    plot2DContext.moveTo(0, canvasSize - victimsGraph[graphIndex] * canvasSize / nbBox);
    for (var i = 1; i < canvasSize; i++) {
        plot2DContext.lineTo(i, canvasSize - victimsGraph[(graphIndex + i) % canvasSize] * canvasSize / nbBox);
    }
    plot2DContext.stroke();

    plot2DContext.strokeStyle = foodColor;
    plot2DContext.beginPath();
    plot2DContext.moveTo(0, canvasSize - foodGraph[graphIndex] * canvasSize / nbBox);
    for (var i = 1; i < canvasSize; i++) {
        plot2DContext.lineTo(i, canvasSize - foodGraph[(graphIndex + i) % canvasSize] * canvasSize / nbBox);
    }
    plot2DContext.stroke();

    //cells drawing
    var box = canvasSize / resolution;
    for (var i = 0; i < resolution; i++) {
        for (var j = 0; j < resolution; j++) {
            var entity = field[i][j];
            if (entity != entities.nothing) {
                cells2DContext.drawImage(entity == entities.predator ? predatorImage : (entity == entities.victim ? victimImage : foodImage), box * i, box * j, box, box);
            }
        }
    }
    cells2DContext.save();
}
