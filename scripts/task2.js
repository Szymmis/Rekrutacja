$(() => {
  loadTasksFromMemory();

  hideWorksersList();
  initWorkers();

  $(document).on("mousedown", () => hideWorksersList());
  $("#task-creator-workers-button").on("mousedown", (e) => {
    toggleWorkersList();
    e.stopPropagation();
  });
  $("#task-creator-workers-list").on("mousedown", (e) => e.stopPropagation());

  $("#task-creator-add").on("click", () => {
    if (
      addTask("01.01.2000", $("#task-creator textarea").val(), ACTIVE_WORKER)
    ) {
      $("#task-creator textarea").val("");
      selectWorker(undefined);
    }
  });

  const btn_all = $("#center-toolbar--show-all");
  const btn_todo = $("#center-toolbar--show-todo");
  const btn_done = $("#center-toolbar--show-done");

  btn_all.on("click", function () {
    filterTasks(filterMethods.ALL);
    btn_all.addClass("--active");
    btn_todo.removeClass("--active");
    btn_done.removeClass("--active");
  });
  btn_done.on("click", () => {
    filterTasks(filterMethods.DONE);
    btn_all.removeClass("--active");
    btn_todo.removeClass("--active");
    btn_done.addClass("--active");
  });
  btn_todo.on("click", () => {
    filterTasks(filterMethods.TODO);
    btn_all.removeClass("--active");
    btn_todo.addClass("--active");
    btn_done.removeClass("--active");
  });
});

const WORKERS = [
  { id: 0, name: "Adam Nowak", src: "gfx/pan1.png" },
  { id: 1, name: "Michał Potoczek", src: "gfx/pan2.png" },
  { id: 2, name: "Antoni Worek", src: "gfx/pan3.png" },
  { id: 3, name: "Gabriel Mazurek", src: "gfx/pan4.png" },
  { id: 4, name: "Marcin Kwiatkowski", src: "gfx/pan5.png" },
  { id: 5, name: "Amadeusz Czarnecki", src: "gfx/pan6.png" },
];

let ACTIVE_WORKER = undefined;

function toggleWorkersList() {
  const workers = $("#task-creator-workers");
  workers.hasClass("--active") ? hideWorksersList() : showWorkersList();
}

function showWorkersList() {
  $("#task-creator-workers").addClass("--active");
}

function hideWorksersList() {
  $("#task-creator-workers").removeClass("--active");
}

function selectWorker(worker) {
  if (ACTIVE_WORKER != undefined && ACTIVE_WORKER.id != undefined)
    $(`#worker-${ACTIVE_WORKER.id}`).removeClass("--active");
  if (worker != undefined && worker.id != undefined) {
    $(`#worker-${worker.id}`).addClass("--active");
    $("#task-creator-workers-button b").text(worker.name);
  } else {
    $("#task-creator-workers-button b").text("Pracownik");
  }
  ACTIVE_WORKER = worker;
}

function createWorkerElement(worker) {
  const { id, name, src } = worker;
  const element = $(
    `<div class="worker" id="worker-${id}">
      <img src="${src}" alt="" />
      <p>${name}</p>
      <img class="icon-done" src="gfx/done.svg" alt="">
    </div>`
  );

  element.on("click", (e) => {
    selectWorker(worker);
    // e.stopPropagation();
    hideWorksersList();
  });

  return element;
}

function initWorkers() {
  const list = $("#task-creator-workers-list>div");
  list.empty();
  WORKERS.forEach((w) => list.append(createWorkerElement(w)));
}

const filterMethods = {
  ALL: 0,
  DONE: 1,
  TODO: 2,
};

let FILTER_METHOD = filterMethods.ALL;

let ID_COUNTER = localStorage.getItem("ID_COUNTER") | 0;
let TASKS = [];

function createTaskElement(task) {
  const { id, date, description } = task;
  const owner = WORKERS[task.owner];
  const element = $(
    `<div id="task-${id}" class="task">
      <h1><img src="${owner.src}"/><b>${owner.name}</b></h1>
      <h3>${date}</h3>
      <p>
        ${description}
      </p>
      <img src="gfx/${task.done ? "checked" : "check"}.svg" class="task-done" />
      <img src="gfx/delete.svg" class="task-delete" />
    </div>`
  );

  element.find(".task-done").on("click", () => taskToggle(task));
  element.find(".task-delete").on("click", () => removeTask(task));

  return element;
}

function addTask(date, description, owner) {
  if (description.length > 2 && owner != undefined) {
    const task = {
      id: ID_COUNTER++,
      date,
      description,
      done: false,
      owner: owner.id,
    };
    TASKS.push(task);
    $("#task-list").append(createTaskElement(task));
    updateCounters();
    filterTasks(FILTER_METHOD);

    saveTasksToMemory();
    return true;
  }
  return false;
}

function loadTasksFromMemory() {
  let data = localStorage.getItem("tasks");
  if (data != undefined) {
    TASKS = JSON.parse(data);
    FILTER_METHOD = filterMethods.ALL;
    filterTasks(FILTER_METHOD);
  }
}

function saveTasksToMemory() {
  localStorage.setItem("tasks", JSON.stringify(TASKS));
  localStorage.setItem("ID_COUNTER", ID_COUNTER);
}

function removeTask(task) {
  console.log("removing", task, task.id, $(`#task-${task.id}`));
  $(`#task-${task.id}`).remove();
  TASKS = TASKS.filter((e) => e.id != task.id);
  updateCounters();

  saveTasksToMemory();
}

function taskToggle(task) {
  task.done = !task.done;
  $(`#task-${task.id} .task-done`).attr(
    "src",
    task.done ? "gfx/checked.svg" : "gfx/check.svg"
  );
  updateCounters();
  filterTasks(FILTER_METHOD);

  saveTasksToMemory();
}

function updateCounters() {
  const all = TASKS.length;
  const done = TASKS.reduce((p, c) => (c.done ? p + 1 : p), 0);
  const todo = all - done;

  $("#summary-all").text(todo + done);
  $("#summary-todo").text(todo);
  $("#summary-done").text(done);
}

function filterTasks(method) {
  FILTER_METHOD = method;
  let array =
    method > 0 ? TASKS.filter((a) => (method == 1 ? a.done : !a.done)) : TASKS;
  const list = $("#task-list");
  list.empty();
  array.forEach((e) => list.append(createTaskElement(e)));
  updateCounters();
}

const LOREM = `Suspendisse egestas est eget ex dignissim pellentesque. Nam
porttitor libero eget velit tincidunt, id accumsan massa feugiat.
Nam cursus venenatis turpis eget viverra. Suspendisse ullamcorper
ligula ut ultrices lobortis. Etiam congue vel ante id tempus.
Pellentesque quis velit augue. Mauris quis risus venenatis,
elementum sem a, bibendum magna. Nulla eget metus felis.`;
