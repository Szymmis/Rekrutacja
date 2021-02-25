function setVH() {
  const vh = window.innerHeight / 100;
  console.log("resizing", { vh });
  document.documentElement.style.setProperty("--vh", `${vh}px`);
  console.log(document.documentElement.style.getPropertyValue("--vh"));
}

$(() => {
  setVH();

  if (window.innerWidth > 600) {
    $(window).on("resize", () => setVH());
  }

  getCats(30);

  $(".bar input").on("keydown", (e) => {
    if (e.key == "Enter") searchCats();
    else if (e.key == "," || e.key == ".") e.preventDefault();
  });
  $("#search-button").on("click", () => searchCats());

  $("#filter-ids .up").on("click", () => {
    sortCats((a, b) => (a._id > b._id ? 1 : -1));
  });
  $("#filter-ids .down").on("click", () => {
    sortCats((a, b) => (a._id < b._id ? 1 : -1));
  });

  $("#filter-dates .up").on("click", () => {
    sortCats((a, b) => (a.createdAt > b.createdAt ? 1 : -1));
  });
  $("#filter-dates .down").on("click", () => {
    sortCats((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  });

  $("#reload").on("click", () => getCats(CATS_DATA.length));

  $("#popup-box").on("mousedown", (e) => e.stopPropagation());
  $("#popup").on("mousedown", hidePopup);
  $("#popup-close").on("click", hidePopup);
});

let CATS_DATA = [];

function searchCats() {
  const val = parseInt($(".bar input").val());
  if (!isNaN(val) && val > 0) {
    getCats(Math.min(val, 99));
  }
}

function sortCats(func) {
  CATS_DATA.sort(func);
  reloadCats();
}

async function getCats(amount) {
  await fetchCats(amount);
  reloadCats();
}

async function fetchCats(amount) {
  console.log(amount);
  await fetch(`https://cat-fact.herokuapp.com/facts/random?amount=${amount}`)
    .then((res) => res.json())
    .then((data) => (CATS_DATA = data));
  if (amount == 1) CATS_DATA = [CATS_DATA];
  CATS_DATA.forEach((e) => {
    e.img = Math.floor(Math.random() * 2);
  });
}

function formatDate(date) {
  return date != undefined ? date.substr(0, date.indexOf("T")) : "";
}

function reloadCats() {
  $("#content").empty();
  CATS_DATA.forEach((e) => {
    const { _id, createdAt, text, img } = e;
    $("#content").append(
      createCatElement(_id, formatDate(createdAt), text, img)
    );
  });
}

function showPopup(id, date, text, img) {
  $("#popup h1").text(`id: ${id}`);
  $("#popup h3").text(date);
  $("#popup p").text(text);
  $("#popup-icon").attr("src", `gfx/cat${img}.svg`);
  $("#popup").css("visibility", "visible");
}

function hidePopup() {
  $("#popup").css("visibility", "hidden");
}

function createCatElement(id, date, text, img) {
  const box = $(
    `<div class="box">
        <div class="cat">
        </div>
    </div>`
  );
  const cat = box.find(".cat");
  cat.append(`<img src="gfx/cat${img}.svg" />`);
  cat.append(
    `<div class="info">
        <h1>id: ${id?.length > 12 ? id.substr(0, 12) + "..." : id}</h1>
        <h3>${date}</h3>
        <p>${
          text?.split(" ").length > 8
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
