const taskInput = document.getElementById("taskInput")
const addBtn = document.getElementById("addBtn")
const taskList = document.getElementById("taskList")
const taskCount = document.getElementById("taskCount")
const filterButtons = document.querySelectorAll(".filters button")

let tasks = JSON.parse(localStorage.getItem("tasks")) || []
let currentFilter = "all"

function saveTasks(){
localStorage.setItem("tasks", JSON.stringify(tasks))
}

function renderTasks(){

taskList.innerHTML=""

let filteredTasks = tasks.filter(task=>{
if(currentFilter==="pending") return !task.completed
if(currentFilter==="completed") return task.completed
return true
})

filteredTasks.forEach((task,index)=>{

const li = document.createElement("li")

const span = document.createElement("span")
span.innerText = task.text
span.className="task-text"

if(task.completed){
span.classList.add("completed")
}

span.onclick = ()=>{
task.completed=!task.completed
saveTasks()
renderTasks()
}

const actions = document.createElement("div")
actions.className="actions"

const editBtn = document.createElement("button")
editBtn.innerText="Edit"
editBtn.className="edit"

editBtn.onclick=()=>{
const newText = prompt("Edit task",task.text)
if(newText){
task.text=newText
saveTasks()
renderTasks()
}
}

const deleteBtn = document.createElement("button")
deleteBtn.innerText="Delete"
deleteBtn.className="delete"

deleteBtn.onclick=()=>{
tasks.splice(index,1)
saveTasks()
renderTasks()
}

actions.appendChild(editBtn)
actions.appendChild(deleteBtn)

li.appendChild(span)
li.appendChild(actions)

taskList.appendChild(li)

})

taskCount.innerText = tasks.length + " tasks total"
}

function addTask(){

const text = taskInput.value.trim()

if(text==="") return

tasks.push({
text:text,
completed:false
})

taskInput.value=""
saveTasks()
renderTasks()

}

addBtn.onclick = addTask

taskInput.addEventListener("keypress",function(e){
if(e.key==="Enter"){
addTask()
}
})

filterButtons.forEach(btn=>{
btn.onclick=()=>{
filterButtons.forEach(b=>b.classList.remove("active"))
btn.classList.add("active")
currentFilter = btn.dataset.filter
renderTasks()
}
})

renderTasks()
