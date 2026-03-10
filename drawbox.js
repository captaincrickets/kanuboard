/*
drawbox.js     
*/

let canvas = document.getElementById("drawboxcanvas");
let context = canvas.getContext("2d");

canvas.style.touchAction = "none";

context.fillStyle = "white";
context.fillRect(0, 0, canvas.width, canvas.height);

let restore_array = [];
let start_index = -1;
let stroke_color = "black";
let stroke_width = "2";
let is_drawing = false;

function change_color(element) {
  stroke_color = element.style.background;
}

function start(event) {
    is_drawing = true;
    context.beginPath();
    context.moveTo(getX(event), getY(event));
    event.preventDefault();
}

function draw(event) {
  if (!is_drawing) return;
  context.lineTo(getX(event), getY(event));
  context.strokeStyle = stroke_color;
  context.lineWidth = stroke_width;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.stroke();
  event.preventDefault();
}

function stop(event) {
  if (!is_drawing) return;
  context.stroke();
  context.closePath();
  is_drawing = false;
  restore_array.push(context.getImageData(0, 0, canvas.width, canvas.height));
  start_index++;
  event.preventDefault();
}

function getX(event) {
    const rect = canvas.getBoundingClientRect();
    if (event.touches) {
        return (event.touches[0].clientX - rect.left) * (canvas.width / rect.width);
    } else {
        return (event.clientX - rect.left) * (canvas.width / rect.width);
    }
}

function getY(event) {
    const rect = canvas.getBoundingClientRect();
    if (event.touches) {
        return (event.touches[0].clientY - rect.top) * (canvas.height / rect.height);
    } else {
        return (event.clientY - rect.top) * (canvas.height / rect.height);
    }
}

canvas.addEventListener("mousedown", start, false);
canvas.addEventListener("mousemove", draw, false);
canvas.addEventListener("mouseup", stop, false);
canvas.addEventListener("mouseout", stop, false);

canvas.addEventListener("touchstart", start, false);
canvas.addEventListener("touchmove", draw, false);
canvas.addEventListener("touchend", stop, false);

function Restore() {
  if (start_index <= 0) {
    Clear();
  } else {
    start_index--;
    restore_array.pop();
    context.putImageData(restore_array[start_index], 0, 0);
  }
}

function Clear() {
  context.fillStyle = "white";
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillRect(0, 0, canvas.width, canvas.height);
  restore_array = [];
  start_index = -1;
}

context.drawImage = function() {
	console.warn("noo >:(");
};

document.getElementById("submit").addEventListener("click", async () => {
    const status = document.getElementById("status");

    const blank = document.createElement("canvas");
    blank.width = canvas.width;
    blank.height = canvas.height;

    if (canvas.toDataURL() === blank.toDataURL()) {
        status.textContent = "Draw something first!";
        return;
    }

    status.textContent = "Uploading...";

    try {
        const imageData = canvas.toDataURL("image/png");

        // Fire-and-forget POST
        fetch(API_URL, {
            mode: "no-cors",  // keep this
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "drawing", image: imageData })
        });

        // Since you cannot read the response, assume success
        status.textContent = "Upload sent!";
        Clear();
        loadGallery();  // You can still try to refresh the gallery
    } catch (err) {
        console.error(err);
        status.textContent = "Upload failed (network error)";
    }
});

async function loadGallery() {
    const gallery = document.getElementById("gallery");

    // Fetch your JSON normally (no need to reverse/no-cors if public)
    const response = await fetch(API_URL);
    const images = await response.json();

    gallery.innerHTML = "";

    images
        .filter(i => i.type === "drawing")
        .reverse()
        .forEach(img => {
            const div = document.createElement("div");

            // Convert Google Drive ID to direct view link
            const driveUrl = `https://drive.google.com/uc?export=view&id=${img.content}`;

            div.innerHTML = `
                <a href="${driveUrl}" target="_blank">
                    <img src="${driveUrl}" width="300">
                </a>
                <p>${new Date(img.timestamp).toLocaleString()}</p>
            `;

            gallery.appendChild(div);
        });
}

loadGallery();