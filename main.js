$(() => {
  getCats(30);

  $("#search-button").on("click", async function () {
    const val = parseInt($(".bar input").val());
    if (!isNaN(val) && val > 0) {
      getCats(Math.min(val, 50));
    }
  });

  $("#filter-ids .up").on("click", () => {
    CATS_DATA.sort((a, b) => (a._id > b._id ? 1 : -1));
    reloadCats();
  });
  $("#filter-ids .down").on("click", () => {
    CATS_DATA.sort((a, b) => (a._id < b._id ? 1 : -1));
    reloadCats();
  });

  $("#filter-dates .up").on("click", () => {
    CATS_DATA.sort((a, b) => (a.date > b.date ? 1 : -1));
    reloadCats();
  });
  $("#filter-dates .down").on("click", () => {
    CATS_DATA.sort((a, b) => (a.date < b.date ? 1 : -1));
    reloadCats();
  });

  $("#reload").on("click", () => {
    getCats(CATS_DATA.length);
  });

  $("#popup").on("mousedown", function () {
    $(this).css("visibility", "hidden");
  });

  $("#popup-box").on("mousedown", (e) => {
    e.stopPropagation();
  });

  $("#popup-close").on("click", function () {
    $("#popup").css("visibility", "hidden");
  });
});

let CATS_DATA = [];

async function getCats(amount) {
  await fetchCats(amount);
  reloadCats();
}

async function fetchCats(amount) {
  await fetch(`https://cat-fact.herokuapp.com/facts/random?amount=${amount}`)
    .then((res) => res.json())
    .then((data) => (CATS_DATA = data));
  CATS_DATA.forEach((e) => {
    e.date = e.createdAt.substr(0, e.createdAt.indexOf("T"));
  });
}

function reloadCats() {
  $("#content").empty();
  CATS_DATA.forEach((e) => {
    const { _id, date, text } = e;
    $("#content").append(createCatElement(_id, date, text));
  });
}

function showPopup(id, date, text, img) {
  $("#popup h1").text(id);
  $("#popup h3").text(date);
  $("#popup p").text(text);
  $("#popup-icon").attr("src", `gfx/cat${img}.svg`);
  $("#popup").css("visibility", "visible");
}

function createCatElement(id, date, text) {
  const box = $(
    `<div class="box">
        <div class="cat">
        </div>
    </div>`
  );
  const cat = box.find(".cat");
  const img = Math.floor(Math.random() * 2);
  cat.append(`<img src="gfx/cat${img}.svg" />`);
  cat.append(
    `<div class="info">
        <h1>id: ${id.length > 12 ? id.substr(0, 12) + "..." : id}</h1>
        <h3>${date}</h3>
        <p>${
          text.split(" ").length > 8
            ? text
                .split(" ")
                .slice(0, 8)
                .reduce((p, c) => `${p} ${c}`) + "..."
            : text
        }</p>
    </div>`
  );

  box.on("click", () => {
    showPopup(id, date, text, img);
  });

  return box;
}
