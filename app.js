const addTaskBtn = document.getElementById("add-task-btn");
const todoBoard = document.getElementById("todo-board");

function attachDragEvents(target) {
  target.addEventListener("dragstart", () => {
    target.classList.add("flying");
  });

  target.addEventListener("dragend", () => {
    target.classList.remove("flying");
  });
}

addTaskBtn.addEventListener("click", () => {
  const input = prompt("What is the task");

  if (!input) return;

  const taskCard = document.createElement("p");
  taskCard.classList.add("item");
  taskCard.setAttribute("draggable", true);
  taskCard.innerText = input;

  attachDragEvents(taskCard);

  todoBoard.appendChild(taskCard);
});

const allBoards = document.querySelectorAll(".board");
const allItems = document.querySelectorAll(".item");

allItems.forEach((item) => attachDragEvents(item));

allBoards.forEach((board) => {
  board.addEventListener("dragover", () => {
    const flyingElement = document.querySelector(".flying");
    console.log(board, "Kuch to mere upar se gaya", flyingElement);

    board.appendChild(flyingElement);
  });
});
