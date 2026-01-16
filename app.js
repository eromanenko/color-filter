const imageInput = document.getElementById("imageInput");
const cameraBtn = document.getElementById("cameraBtn");
const landingCameraBtn = document.getElementById("landingCameraBtn");
const rotateBtn = document.getElementById("rotateBtn");
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
const versionLabel = document.getElementById("versionLabel");

if (versionLabel) versionLabel.textContent = "v14.0";

let currentStream = null;
let isFrozen = false;
let currentFacingMode = "environment";

let scale = 1;
let translateX = 0;
let translateY = 0;
let rotation = 0; // State variable for rotation angle
let lastTouchX = 0;
let lastTouchY = 0;
let lastHypot = 0;

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
      resetTransform();
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
    resetTransform();

    switchBtn.classList.remove("hidden");
    rotateBtn.classList.remove("hidden");
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

// Rotate current view by 90 degrees clockwise
rotateBtn.addEventListener("click", () => {
  rotation = (rotation + 90) % 360;
  applyTransform();
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
    rotateBtn.classList.add("hidden");
    freezeBtn.classList.add("hidden");
    stopBtn.classList.add("hidden");
    resetTransform();
  }
}

function showView(type) {
  mainTitle.classList.add("hidden");
  landingControls.classList.add("hidden");
  menuToggle.classList.remove("hidden");
  viewContainer.classList.remove("hidden");
  rotateBtn.classList.remove("hidden");

  if (type === "video") {
    videoFeed.classList.remove("hidden");
    decodedImage.classList.add("hidden");
  } else {
    videoFeed.classList.add("hidden");
    decodedImage.classList.remove("hidden");
  }
}

function setFilter(color) {
  appContainer.className = `container theme-${color}`;
  viewContainer.classList.remove("filter-red", "filter-green", "filter-blue");
  viewContainer.classList.add(`filter-${color}`);
  buttons.forEach((btn) =>
    btn.classList.toggle("active", btn.dataset.filter === color)
  );
}

function resetTransform() {
  scale = 1;
  translateX = 0;
  translateY = 0;
  rotation = 0;
  applyTransform();
}

function applyTransform() {
  const target = videoFeed.classList.contains("hidden")
    ? decodedImage
    : videoFeed;
  /* Rotation added to the transformation string */
  if (target)
    target.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale}) rotate(${rotation}deg)`;
}

viewContainer.addEventListener("touchstart", (e) => {
  if (e.touches.length === 1) {
    lastTouchX = e.touches[0].clientX;
    lastTouchY = e.touches[0].clientY;
  } else if (e.touches.length === 2) {
    lastHypot = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
  }
});

viewContainer.addEventListener("touchmove", (e) => {
  if (e.touches.length === 1) {
    const deltaX = e.touches[0].clientX - lastTouchX;
    const deltaY = e.touches[0].clientY - lastTouchY;
    translateX += deltaX;
    translateY += deltaY;
    lastTouchX = e.touches[0].clientX;
    lastTouchY = e.touches[0].clientY;
  } else if (e.touches.length === 2) {
    const currentHypot = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
    const zoomFactor = currentHypot / lastHypot;
    scale *= zoomFactor;
    scale = Math.min(Math.max(1, scale), 10);
    lastHypot = currentHypot;
  }
  applyTransform();
});

buttons.forEach((btn) =>
  btn.addEventListener("click", () => setFilter(btn.dataset.filter))
);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js");
  });
}
