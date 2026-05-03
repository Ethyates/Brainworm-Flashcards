let cards = [];
let editingCardId = null;

let studyDeck = [];
let incorrectCards = [];
let currentIndex = 0;
let correctCount = 0;
let isFlipped = false;

const cardForm = document.getElementById("card-form");
const questionInput = document.getElementById("question-input");
const answerInput = document.getElementById("answer-input");
const categoryInput = document.getElementById("category-input");
const formMessage = document.getElementById("form-message");

const cardList = document.getElementById("card-list");
const searchInput = document.getElementById("search-input");
const categoryFilter = document.getElementById("category-filter");
const studyCategory = document.getElementById("study-category");

const startStudyBtn = document.getElementById("start-study-btn");
const studyStartMessage = document.getElementById("study-start-message");
const studySetup = document.getElementById("study-setup");
const studyCardArea = document.getElementById("study-card-area");
const resultsArea = document.getElementById("results-area");

const studyProgress = document.getElementById("study-progress");
const cardInner = document.getElementById("card-inner");
const questionText = document.getElementById("question-text");
const answerText = document.getElementById("answer-text");

const flipCardBtn = document.getElementById("flip-card-btn");
const correctBtn = document.getElementById("correct-btn");
const incorrectBtn = document.getElementById("incorrect-btn");

const resultsText = document.getElementById("results-text");
const reviewMissedBtn = document.getElementById("review-missed-btn");
const studyAgainBtn = document.getElementById("study-again-btn");
const returnLibraryBtn = document.getElementById("return-library-btn");

const navButtons = document.querySelectorAll(".app-nav button");
const sections = document.querySelectorAll(".app-section");

function saveCards() {
  localStorage.setItem("brainwormCards", JSON.stringify(cards));
}

function loadCards() {
  const savedCards = localStorage.getItem("brainwormCards");

  if (savedCards) {
    cards = JSON.parse(savedCards);
  }
}

function showSection(sectionId) {
  sections.forEach(section => {
    section.classList.add("hidden");
  });

  document.getElementById(sectionId).classList.remove("hidden");
}

function showMessage(element, message) {
  element.textContent = message;

  setTimeout(() => {
    element.textContent = "";
  }, 2500);
}

function getCategories() {
  const categories = cards.map(card => card.category);
  return [...new Set(categories)].sort();
}

function updateCategoryMenus() {
  const categories = getCategories();

  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  studyCategory.innerHTML = `<option value="all">All Categories</option>`;

  categories.forEach(category => {
    categoryFilter.innerHTML += `<option value="${category}">${category}</option>`;
    studyCategory.innerHTML += `<option value="${category}">${category}</option>`;
  });
}

function renderCards() {
  const searchTerm = searchInput.value.toLowerCase();
  const selectedCategory = categoryFilter.value;

  let filteredCards = cards.filter(card => {
    const matchesSearch =
      card.question.toLowerCase().includes(searchTerm) ||
      card.answer.toLowerCase().includes(searchTerm);

    const matchesCategory =
      selectedCategory === "all" || card.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  cardList.innerHTML = "";

  if (filteredCards.length === 0) {
    cardList.innerHTML = `<p>No cards found.</p>`;
    return;
  }

  filteredCards.forEach(card => {
    const cardElement = document.createElement("div");
    cardElement.className = "library-card";

    cardElement.innerHTML = `
      <h3>${card.category}</h3>
      <p><strong>Q:</strong> ${card.question}</p>
      <p><strong>A:</strong> ${card.answer}</p>

      <div class="card-actions">
        <button class="edit-btn" data-id="${card.id}">Edit</button>
        <button class="delete-btn" data-id="${card.id}">Delete</button>
      </div>
    `;

    cardList.appendChild(cardElement);
  });
}

function addOrUpdateCard(event) {
  event.preventDefault();

  const question = questionInput.value.trim();
  const answer = answerInput.value.trim();
  const category = categoryInput.value.trim();

  if (!question || !answer || !category) {
    showMessage(formMessage, "Please fill out every field.");
    return;
  }

  const duplicateCard = cards.find(card =>
    card.question.toLowerCase() === question.toLowerCase() &&
    card.id !== editingCardId
  );

  if (duplicateCard) {
    showMessage(formMessage, "That question already exists.");
    return;
  }

  if (editingCardId) {
    const card = cards.find(card => card.id === editingCardId);

    card.question = question;
    card.answer = answer;
    card.category = category;

    editingCardId = null;
    document.getElementById("save-card-btn").textContent = "Add Card";
    showMessage(formMessage, "Card updated.");
  } else {
    const newCard = {
      id: Date.now(),
      question,
      answer,
      category
    };

    cards.push(newCard);
    showMessage(formMessage, "Card added.");
  }

  cardForm.reset();
  saveCards();
  updateCategoryMenus();
  renderCards();
}

function handleCardActions(event) {
  const cardId = Number(event.target.dataset.id);

  if (event.target.classList.contains("delete-btn")) {
    cards = cards.filter(card => card.id !== cardId);
    saveCards();
    updateCategoryMenus();
    renderCards();
  }

  if (event.target.classList.contains("edit-btn")) {
    const card = cards.find(card => card.id === cardId);

    questionInput.value = card.question;
    answerInput.value = card.answer;
    categoryInput.value = card.category;

    editingCardId = cardId;
    document.getElementById("save-card-btn").textContent = "Update Card";
    showSection("create-section");
  }
}

function startStudySession() {
  const selectedCategory = studyCategory.value;

  studyDeck = cards.filter(card => {
    return selectedCategory === "all" || card.category === selectedCategory;
  });

  if (studyDeck.length === 0) {
    showMessage(studyStartMessage, "No cards available for that selection.");
    return;
  }

  incorrectCards = [];
  currentIndex = 0;
  correctCount = 0;
  isFlipped = false;

  studySetup.classList.add("hidden");
  resultsArea.classList.add("hidden");
  studyCardArea.classList.remove("hidden");

  renderStudyCard();
}

function renderStudyCard() {
  const currentCard = studyDeck[currentIndex];

  isFlipped = false;
  cardInner.classList.remove("flipped");

  studyProgress.textContent = `Card ${currentIndex + 1} of ${studyDeck.length}`;
  questionText.textContent = currentCard.question;
  answerText.textContent = currentCard.answer;
}

function flipCard() {
  isFlipped = !isFlipped;
  cardInner.classList.toggle("flipped", isFlipped);
}

function markCardCorrect() {
  correctCount++;
  moveToNextCard();
}

function markCardIncorrect() {
  incorrectCards.push(studyDeck[currentIndex]);
  moveToNextCard();
}

function moveToNextCard() {
  currentIndex++;

  if (currentIndex >= studyDeck.length) {
    endStudySession();
  } else {
    renderStudyCard();
  }
}

function endStudySession() {
  studyCardArea.classList.add("hidden");
  resultsArea.classList.remove("hidden");

  const totalCards = studyDeck.length;
  const missedCount = incorrectCards.length;

  resultsText.textContent = `You got ${correctCount}/${totalCards} correct. ${missedCount} card${missedCount === 1 ? "" : "s"} need review.`;

  if (missedCount === 0) {
    reviewMissedBtn.classList.add("hidden");
  } else {
    reviewMissedBtn.classList.remove("hidden");
  }
}

function reviewMissedCards() {
  studyDeck = [...incorrectCards];
  incorrectCards = [];
  currentIndex = 0;
  correctCount = 0;
  isFlipped = false;

  resultsArea.classList.add("hidden");
  studyCardArea.classList.remove("hidden");

  renderStudyCard();
}

function resetStudyArea() {
  studyDeck = [];
  incorrectCards = [];
  currentIndex = 0;
  correctCount = 0;
  isFlipped = false;

  studySetup.classList.remove("hidden");
  studyCardArea.classList.add("hidden");
  resultsArea.classList.add("hidden");
}

navButtons.forEach(button => {
  button.addEventListener("click", () => {
    showSection(button.dataset.section);
  });
});

cardForm.addEventListener("submit", addOrUpdateCard);
cardList.addEventListener("click", handleCardActions);
searchInput.addEventListener("input", renderCards);
categoryFilter.addEventListener("change", renderCards);

startStudyBtn.addEventListener("click", startStudySession);
flipCardBtn.addEventListener("click", flipCard);
correctBtn.addEventListener("click", markCardCorrect);
incorrectBtn.addEventListener("click", markCardIncorrect);
reviewMissedBtn.addEventListener("click", reviewMissedCards);
studyAgainBtn.addEventListener("click", resetStudyArea);

returnLibraryBtn.addEventListener("click", () => {
  resetStudyArea();
  showSection("library-section");
});

loadCards();
updateCategoryMenus();
renderCards();
showSection("create-section");