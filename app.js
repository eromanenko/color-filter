const imageInput = document.getElementById("imageInput");
const cameraBtn = document.getElementById("cameraBtn");
const switchBtn = document.getElementById("switchBtn");
const freezeBtn = document.getElementById("freezeBtn");
const stopBtn = document.getElementById("stopBtn");
const videoFeed = document.getElementById("videoFeed");
const decodedImage = document.getElementById("decodedImage");
const viewContainer = document.getElementById("viewContainer");
const controls = document.getElementById("controls");
const buttons = document.querySelectorAll(".channel-btn");
const mainContainer = document.querySelector(".container");

let currentStream = null;
let isFrozen = false;
let currentFacingMode = "environment";

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

async function startCamera() {
  stopCamera(false);
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: currentFacingMode },
    });
    currentStream = stream;
    videoFeed.srcObject = stream;

    cameraBtn.classList.add("hidden");
    switchBtn.classList.remove("hidden");
    freezeBtn.classList.remove("hidden");
    stopBtn.classList.remove("hidden");

    showView("video");
    const activeBtn = document.querySelector(".channel-btn.active");
    setFilter(activeBtn ? activeBtn.dataset.filter : "red");
  } catch (err) {
    console.error("Camera access error:", err);
    alert("Unable to access camera.");
  }
}

cameraBtn.addEventListener("click", startCamera);

switchBtn.addEventListener("click", () => {
  currentFacingMode =
    currentFacingMode === "environment" ? "user" : "environment";
  startCamera();
});

freezeBtn.addEventListener("click", () => {
  if (isFrozen) {
    videoFeed.play();
    freezeBtn.textContent = "❄️ Freeze";
  } else {
    videoFeed.pause();
    freezeBtn.textContent = "▶️ Unfreeze";
  }
  isFrozen = !isFrozen;
});

stopBtn.addEventListener("click", () => stopCamera(true));

function stopCamera(fullReset = true) {
  if (currentStream) {
    currentStream.getTracks().forEach((track) => track.stop());
    currentStream = null;
  }

  if (fullReset) {
    videoFeed.pause();
    videoFeed.srcObject = null;
    isFrozen = false;
    freezeBtn.textContent = "❄️ Freeze";

    cameraBtn.classList.remove("hidden");
    switchBtn.classList.add("hidden");
    freezeBtn.classList.add("hidden");
    stopBtn.classList.add("hidden");

    viewContainer.classList.add("hidden");
    controls.classList.add("hidden");
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
    navigator.serviceWorker.register("./sw.js").then((reg) => {
      /* Checks for updates on every page load */
      reg.update();
    });
  });
}
