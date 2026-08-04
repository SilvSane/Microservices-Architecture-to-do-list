const GATEWAY_URL = window.GATEWAY_URL || "http://localhost:3000";

const USER_ID = 1; //fix jwt later

async function loadTasks() {
  const res = await fetch(`${GATEWAY_URL}/tasks`, {
    //method: 'GET',
    headers: { "x-user-id": USER_ID },
  });
  const tasks = await res.json();
  document.getElementById("task-list").innerHTML = tasks
    .map((ts) => `<li>${ts.title}</li>`)
    .join("");
}

async function addTask() {
  const title = document.getElementById("title").value;

  const res = await fetch(`${GATEWAY_URL}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-user-id": USER_ID },
    body: JSON.stringify({ title }),
  });
  const tasks = await res.json();
  document.getElementById("title").value = "";
  loadTasks();
}

loadTasks();
