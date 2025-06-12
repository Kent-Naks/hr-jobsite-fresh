//I have copied this .js code into html because the initial link wasn't working.

// The dodger element is to be grabbed
const dodger = document.getElementById("dodger");

// Function to move the dodger left
function moveDodgerLeft() {
  const leftNumbers = dodger.style.left.replace("px", "");
  const left = parseInt(leftNumbers, 10);

  if (left > 0) {
    dodger.style.left = `${left - 1}px`;
  }
}

// Function is to be moved the dodger right
function moveDodgerRight() {
  const leftNumbers = dodger.style.left.replace("px", "");
  const left = parseInt(leftNumbers, 10);

  if (left < 360) { // 400px (game width) - 40px (dodger width) = 360px max left position
    dodger.style.left = `${left + 1}px`;
  }
}

// I've moved the vent listener for keydown events
document.addEventListener("keydown", function (event) {
  if (event.key === "ArrowLeft") {
    moveDodgerLeft();
  }
  if (event.key === "ArrowRight") {
    moveDodgerRight();
  }
});