// ELEMENTS SELECTORS
const form = document.getElementById("submit-form");
const buttons = document.getElementById("buttons");
const queueList = document.getElementById("queue-list");

form.addEventListener("change", handleFormChange);  

buttons.addEventListener("click", (event) => {
  event.preventDefault();
  submitForm("http://localhost:3000/aws_report/handle-files?command=" + event.srcElement.id);
});

function handleFormChange(event) {
  window.files = event.target.files;

  Array.from(files).forEach( file => {
    createFileOnQueue(file.name);
  })
}

function createFileOnQueue(filename) {
  // Create the li element
  const liElement = document.createElement("li");
  liElement.classList.add("row");

  // Create the div.content element
  const contentDiv = document.createElement("div");
  contentDiv.classList.add("content");

  // Create the div.file-details element
  const detailsDiv = document.createElement("div");
  detailsDiv.classList.add("file-details");
  
  // Create the icon
  const iconElement = document.createElement("i");
  iconElement.classList.add("fas", "fa-file-alt");
  
  // Create file div
  const fileDiv = document.createElement("div");
  detailsDiv.classList.add("file");

  const filenameSpan = document.createElement("span");
  filenameSpan.classList.add("filename");
  filenameSpan.textContent = `${filename}`;

  const statusSpan = document.createElement("span");
  statusSpan.classList.add("filename");
  statusSpan.textContent = `• Waiting Action`;
  
  fileDiv.appendChild(filenameSpan);
  fileDiv.appendChild(statusSpan);

  // Create the span.percent element
  const percentSpan = document.createElement("span");
  percentSpan.classList.add("percent");
  percentSpan.textContent = "50%";
  // TODO - SET THE PERCENTAGE OF THE UPLOAD

  // Append the <i> element to the div.file-details
  detailsDiv.appendChild(iconElement);
  // Append the span.filename and span.percent elements to the div.file-details
  detailsDiv.appendChild(fileDiv);
  detailsDiv.appendChild(percentSpan);

  // Create the div.progress-bar element
  const progressBarDiv = document.createElement("div");
  progressBarDiv.classList.add("progress-bar");

  // Create the div.current-progress element
  const currentProgressDiv = document.createElement("div");
  currentProgressDiv.classList.add("current-progress");
  // TODO -> SET THE WIDTH OF THE CURRENT PROGRESS DIV TO THE PERCENTAGE OF THE UPLOAD

  // Append the div.current-progress to the div.progress-bar
  progressBarDiv.appendChild(currentProgressDiv);

  // Append the div.file-details and div.progress-bar elements to the div.content
  contentDiv.appendChild(detailsDiv);
  contentDiv.appendChild(progressBarDiv);

  // Append the div.content element to the li element
  liElement.appendChild(contentDiv);
  liElement.id = filename;

  // APPEND TO QUEUE LIST
  queueList.appendChild(liElement);
}

function submitForm(path) {
  handleFileUploadProgress(path, new FormData(form));
}

function handleFileUploadProgress(path, data) {
  uploadFile(path, data);
  console.log(data)
  // ADD TO QUEUE LIS

  // HANDLE PROGRESS
}

function uploadFile(path, data) {
  const xhr = new XMLHttpRequest(); // create a new XMLHttpRequest object
  xhr.open("POST", path, true); // set up the request

  xhr.setRequestHeader("enctype", "multipart/form-data"); // set the enctype header
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      // handle the response
      console.log(xhr.responseText);
    }
  };
  console.log(data);
  xhr.send(data);
}
