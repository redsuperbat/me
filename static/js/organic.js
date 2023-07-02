const element = document.querySelector(".organic");

const forest = element.textContent.toString("utf-16")

const spans = forest.split("").map((it) => {
  let el
  if(it === "\n"){
    el = document.createElement("br")
  } else {
    // Palm tree
    el = document.createElement("span");
    console.log(it.codePointAt(0));
    if (it.codePointAt(0) === String.fromCodePoint(0x1F996)) {
      el.classList.push("tree")
    };
    if (it.toString() === String.fromCodePoint(0x1F995)) {
      el.classList.push("tree")
    };
    el.textContent = it;
  }
  return el
});

element.textContent = "";

spans.forEach(span => element?.appendChild(span))
