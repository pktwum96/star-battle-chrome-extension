const EIGHT_BY_EIGHT_BASE = 8;
const TEN_BY_TEN_BASE = 10;
const TWELVE_BY_TWELVE_BASE = 12;
const FOURTEEN_BY_FOURTEEN_BASE = 14;
const CIRCLE_SELECTOR = "fa-circle";
const STAR_SELECTOR = "fa-star";
const DUPLICATE_STAR_SELECTOR = "double-star";

const BOX_ID_SELECTOR = "box";

const bases = [
  EIGHT_BY_EIGHT_BASE,
  TEN_BY_TEN_BASE,
  TWELVE_BY_TWELVE_BASE,
  FOURTEEN_BY_FOURTEEN_BASE,
];
let tempBase = EIGHT_BY_EIGHT_BASE;

// No definitive way of determining if the user is playing 8x8 or 14x14 etc. We check to see if we can find the last box if it were a higher base
for (const base of bases) {
  const boxId = `${BOX_ID_SELECTOR + (base * base - 1)}`;
  const lastBox = document.getElementById(boxId);

  if (lastBox) {
    tempBase = base;
  } else {
    break;
  }
}

const GAME_BASE = tempBase;
console.log(GAME_BASE);

const boxes = document.querySelectorAll(".box");

const boxGroupsMap = new Map();
const historyMap = new Map();

boxes.forEach((box) => {
  const groupName = getGroupName(box);

  if (boxGroupsMap.has(groupName)) {
    boxGroupsMap.get(groupName)?.push(box);
  } else {
    boxGroupsMap.set(groupName, [box]);
  }

  box.addEventListener("click", () => onBoxClick(box));
});

function onBoxClick(box) {
  const triggererId = box.id;
  if (isStarred(box)) {
    const groupName = getGroupName(box);
    circleOutGroup(groupName, box);
    circleOutRowsAndColumns(box);
    circleOutAdjacentDiagonals(box);
  } else if (!isCircled(box)) {
    undoAllActions(triggererId);
  }
}

function circleOutRowsAndColumns(box) {
  const triggererId = box.id;
  const idNumber = Number(triggererId.replace(BOX_ID_SELECTOR, ""));

  const rowsBottom = idNumber - (idNumber % GAME_BASE);
  const rowsTop = rowsBottom + GAME_BASE;

  for (let i = rowsBottom; i < rowsTop; i++) {
    if (i === idNumber) {
      continue;
    }
    const rowBox = document.getElementById(`${BOX_ID_SELECTOR + i}`);
    implementEncircling(rowBox, box);
  }

  const colEnd = idNumber % GAME_BASE;

  for (let i = colEnd; i < GAME_BASE * GAME_BASE; i += GAME_BASE) {
    if (i === idNumber) {
      continue;
    }

    const colBox = document.getElementById(`${BOX_ID_SELECTOR + i}`);
    implementEncircling(colBox, box);
  }
}

function circleOutGroup(groupName, triggerer) {
  const boxesInGroup = boxGroupsMap.get(groupName);
  boxesInGroup?.forEach((box) => {
    implementEncircling(box, triggerer);
  });
}

function circleOutAdjacentDiagonals(box) {
  const lowestPossibleBox = 0;
  const highestPossibleBox = GAME_BASE * GAME_BASE - 1;

  const idNumber = Number(box.id.replace(BOX_ID_SELECTOR, ""));

  const diagonals = [
    { offset: -GAME_BASE - 1 }, // Left Top Diagonal
    { offset: -GAME_BASE + 1 }, // Right Top Diagonal
    { offset: +GAME_BASE + 1 }, // Right Bottom Diagonal
    { offset: +GAME_BASE - 1 }, // Left Bottom Diagonal
  ];

  diagonals.forEach((diagonal) => {
    const newId = idNumber + diagonal.offset;

    if (newId >= lowestPossibleBox && newId <= highestPossibleBox) {
      const diagonalBox = document.getElementById(BOX_ID_SELECTOR + newId);
      if (diagonalBox) {
        implementEncircling(diagonalBox, box);
      }
    }
  });
}

function implementEncircling(box, triggerer) {
  const triggererId = triggerer.id;
  if (isCircled(box)) {
  } else if (isStarred(box)) {
    // TODO: Implement Duplicate star selector
    // box.classList.add(DUPLICATE_STAR_SELECTOR);
    // triggerer.classList.add(DUPLICATE_STAR_SELECTOR);
  } else {
    markAsCircle(box, triggererId);
  }
}

function isCircled(box) {
  return box.classList.contains(CIRCLE_SELECTOR);
}

function isStarred(box) {
  return box.classList.contains(STAR_SELECTOR);
}

function getGroupName(box) {
  let groupName = "";
  box.classList.forEach((className) => {
    if (className.startsWith("group")) {
      groupName = className;
    }
  });
  return groupName;
}

function markAsCircle(box, triggererId) {
  box.classList.add(CIRCLE_SELECTOR);
  if (historyMap.has(triggererId)) {
    historyMap.get(triggererId)?.push(box);
  } else {
    historyMap.set(triggererId, [box]);
  }
}

function undoAllActions(triggererId) {
  if (historyMap.has(triggererId)) {
    historyMap.get(triggererId)?.forEach((box) => {
      box.classList.remove(CIRCLE_SELECTOR);

      // TODO Duplicates should be removed as well
      // box.classList.remove(DUPLICATE_STAR_SELECTOR);
    });
    historyMap.delete(triggererId);
  }
}
