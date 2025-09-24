const display = document.getElementById("display");
const buttons = document.querySelectorAll("button");
let currentInput = "";

buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const value = btn.textContent;

    if (value === "C") {
      currentInput = "";
      display.textContent = "0";
    } else if (value === "=") {
      try {
        currentInput = eval(currentInput).toString();
        display.textContent = currentInput;
      } catch {
        display.textContent = "Error";
      }
    } else {
      currentInput += value;
      display.textContent = currentInput;
    }
  });
});
