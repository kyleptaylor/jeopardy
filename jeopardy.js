// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

let categories = [];
const numCategories = 6;
const qestionsPerCat = 5;
let api = "https://rithm-jeopardy.herokuapp.com/api/category"; // ! Needs param with ID ex: ?id=10 //
let apiCats = "https://rithm-jeopardy.herokuapp.com/api/categories?count=100";

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds() {
  const response = await axios.get(apiCats);
  allCategories = response.data;

  // Shuffle the categories array to randomize the order
  const shuffledCategories = allCategories.sort(() => Math.random() - 0.5);

  // Select the first 6 categories after shuffling
  const selectedCategories = shuffledCategories.slice(0, numCategories);

  // Extract the IDs of the selected categories
  const catIds = selectedCategories.map((cat) => cat.id);
  getCategory(catIds);
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catIds) {
  categories = [];
  for (const cat of catIds) {
    const response = await axios.get(api, { params: { id: cat } });
    data = response.data;

    // Create categoryObj to push to the catrgories object
    const categoryObj = {
      title: data.title,
      clues: data.clues.map((clue) => ({
        question: clue.question,
        answer: clue.answer,
        showing: null,
      })),
    };
    categories.push(categoryObj);
  }

  await fillTable();
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {
  const mainSection = $("#main-section");
  const table = $("<table id='jeopardy-table'></table>");
  const thead = $("<thead></thead>");
  const tbody = $("<tbody></tbody>");
  mainSection.find("#jeopardy-table").remove();

  const headerRow = $("<tr></tr>");
  categories.forEach((category) => {
    headerRow.append($(`<th class="title">${category.title}</th>`));
  });
  thead.append(headerRow);
  table.append(thead);
  for (let i = 0; i < qestionsPerCat; i++) {
    const row = $("<tr></tr>");
    for (let j = 0; j < numCategories; j++) {
      const cell = $(
        `<td class= 'cell' id='${i}-${j}'><i class="icon fa-solid fa-question"></i></td>`
      );
      row.append(cell);
    }
    tbody.append(row);
  }
  table.append(tbody);
  mainSection.append(table);
  hideLoadingView();
  $("#jeopardy-table").on("click", "td", handleClick);
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
  let $tgt = $(evt.target);
  let id = $tgt.attr("id");
  let [clueId, catId] = id.split("-");
  let clue = categories[catId].clues[clueId];
  let question = clue.question;
  let answer = clue.answer;

  if (clue.showing === null) {
    $tgt.text(question);
    clue.showing = "question";
    $tgt.addClass("question");
  } else if (clue.showing === "question") {
    $tgt.text(answer);
    clue.showing = "answer";
    $tgt.removeClass("question");
    $tgt.addClass("answer");
  } else {
    return;
  }
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
  $("#spin-container").show();
  $("#start").text("Loading...");
  $("#alex").hide();
}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
  $("#spin-container").hide();
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

function setupAndStart() {
  $("#start").on("click", function () {
    showLoadingView();
    getCategoryIds();
    $("#start").html('<i class="icon fa-solid fa-arrow-rotate-left"></i>');
  });
}

$(document).ready(function () {
  setupAndStart();
});

/** On click of start / restart button, set up game. */

// TODO
