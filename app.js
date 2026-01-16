const imageInput = document.getElementById("imageInput");
const cameraBtn = document.getElementById("cameraBtn");
const landingCameraBtn = document.getElementById("landingCameraBtn");
const switchBtn = document.getElementById("switchBtn");
const freezeBtn = document.getElementById("freezeBtn");
const stopBtn = document.getElementById("stopBtn");
const menuToggle = document.getElementById("menuToggle");
const sideMenu = document.getElementById("sideMenu");
const mainTitle = document.getElementById("mainTitle");
const landingControls = document.getElementById("landingControls");
const videoFeed = document.getElementById("videoFeed");
const decodedImage = document.getElementById("decodedImage");
const viewContainer = document.getElementById("viewContainer");
const buttons = document.querySelectorAll(".channel-btn");
const appContainer = document.getElementById("appContainer");

let currentStream = null;
let isFrozen = false;
let currentFacingMode = "environment";

menuToggle.addEventListener("click", () => {
  sideMenu.classList.toggle("active");
  menuToggle.textContent = sideMenu.classList.contains("active") ? "✕" : "☰";
});

imageInput.addEventListener("change", function (event) {
  stopCamera();
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      decodedImage.src = e.target.result;
      showView("image");
      setFilter("red");
      closeMenu();
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

    switchBtn.classList.remove("hidden");
    freezeBtn.classList.remove("hidden");
    stopBtn.classList.remove("hidden");

    showView("video");
    setFilter("red");
    closeMenu();
  } catch (err) {
    alert("Camera access error.");
  }
}

cameraBtn.addEventListener("click", startCamera);
landingCameraBtn.addEventListener("click", startCamera);

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

function closeMenu() {
  sideMenu.classList.remove("active");
  menuToggle.textContent = "☰";
}

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

    mainTitle.classList.remove("hidden");
    landingControls.classList.remove("hidden");
    menuToggle.classList.add("hidden");
    viewContainer.classList.add("hidden");
    closeMenu();

    switchBtn.classList.add("hidden");
    freezeBtn.classList.add("hidden");
    stopBtn.classList.add("hidden");
  }
}

function showView(type) {
  mainTitle.classList.add("hidden");
  landingControls.classList.add("hidden");
  menuToggle.classList.remove("hidden");
  viewContainer.classList.remove("hidden");

  if (type === "video") {
    videoFeed.classList.remove("hidden");
    decodedImage.classList.add("hidden");
  } else {
    videoFeed.classList.add("hidden");
    decodedImage.classList.remove("hidden");
  }
}

function setFilter(color) {
  /* Update UI theme */
  appContainer.className = `container theme-${color}`;

  /* Applying filter only to the visible view container ensures stability */
  viewContainer.classList.remove("filter-red", "filter-green", "filter-blue");
  viewContainer.classList.add(`filter-${color}`);

  buttons.forEach((btn) =>
    btn.classList.toggle("active", btn.dataset.filter === color)
  );
}

buttons.forEach((btn) =>
  btn.addEventListener("click", () => setFilter(btn.dataset.filter))
);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js");
  });
}
