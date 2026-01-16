const imageInput = document.getElementById("imageInput");
const cameraBtn = document.getElementById("cameraBtn");
const videoFeed = document.getElementById("videoFeed");
const decodedImage = document.getElementById("decodedImage");
const viewContainer = document.getElementById("viewContainer");
const controls = document.getElementById("controls");
const buttons = document.querySelectorAll(".channel-btn");
const mainContainer = document.querySelector(".container");

let currentStream = null;

/* Handle static image upload */
imageInput.addEventListener("change", function (event) {
  stopCamera();
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      decodedImage.src = e.target.result;
      showView("image");
      setFilter("red");
    };
    reader.readAsDataURL(file);
  }
});

/* Request camera access and start live stream */
cameraBtn.addEventListener("click", async () => {
  try {
    /* Using 'environment' facing mode for rear camera on mobile devices */
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
    });
    currentStream = stream;
    videoFeed.srcObject = stream;
    showView("video");
    setFilter("red");
  } catch (err) {
    console.error("Camera access denied:", err);
    alert("Camera access is required for live view.");
  }
});

function stopCamera() {
  if (currentStream) {
    currentStream.getTracks().forEach((track) => track.stop());
    currentStream = null;
  }
}

function showView(type) {
  viewContainer.classList.remove("hidden");
  controls.classList.remove("hidden");
  if (type === "video") {
    videoFeed.classList.remove("hidden");
    decodedImage.classList.add("hidden");
  } else {
    videoFeed.classList.add("hidden");
    decodedImage.classList.remove("hidden");
  }
}

function setFilter(color) {
  mainContainer.className = `container theme-${color}`;

  const target = videoFeed.classList.contains("hidden")
    ? decodedImage
    : videoFeed;

  /* Apply filter class to the active view element */
  [videoFeed, decodedImage].forEach((el) => {
    el.classList.remove("filter-red", "filter-green", "filter-blue");
  });
  target.classList.add(`filter-${color}`);

  buttons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.filter === color);
  });
}

buttons.forEach((btn) => {
  btn.addEventListener("click", () => setFilter(btn.dataset.filter));
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js");
  });
}
