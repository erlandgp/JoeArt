// Dynamic headline cycling script
const headlineWords = ["Buat", "Sebar", "Kelola", "Edit"];
let headlineIndex = 0;

function cycleHeadlineWord() {
  const headlineWordEl = document.getElementById("headline-dynamic-word");
  if (headlineWordEl) {
    headlineIndex = (headlineIndex + 1) % headlineWords.length;
    headlineWordEl.textContent = headlineWords[headlineIndex];
  }
}

document.addEventListener("DOMContentLoaded", function() {
  setInterval(cycleHeadlineWord, 3000);
});
