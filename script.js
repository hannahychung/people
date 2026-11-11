
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, getDocs } from 'firebase/firestore/lite';
import { query, where } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBZparRjp3BsP54HTp7bbVP87nD9dvFXuA",
    authDomain: "people-d7cb8.firebaseapp.com",
    projectId: "people-d7cb8",
    storageBucket: "people-d7cb8.firebasestorage.app",
    messagingSenderId: "325924022254",
    appId: "1:325924022254:web:971841c7f2f59ebec710ff",
    measurementId: "G-BK2MHSRYSD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);



const stage = document.getElementById("stage");
const gallery = document.getElementById("gallery");
const viewer = document.getElementById("viewer");
var note = "";

const figures = {
    a: "images/person_a.svg",
    b: "images/person_b.svg",
    c: "images/person_c.svg",
    d: "images/person_d.svg",
    e: "images/person_e.svg",
    f: "images/person_f.svg",
    g: "images/person_g.svg",
    h: "images/person_h.svg",
    i: "images/person_i.svg",
    j: "images/person_j.svg",
    k: "images/person_k.svg",
    l: "images/person_l.svg",
    m: "images/person_m.svg",
    n: "images/person_n.svg",
    o: "images/person_o.svg",
    p: "images/person_p.svg",
    q: "images/person_q.svg",
    r: "images/person_r.svg",
    s: "images/person_s.svg",
    t: "images/person_t.svg",
    u: "images/person_u.svg",
    v: "images/person_v.svg",
    w: "images/person_w.svg",
    x: "images/person_x.svg",
    y: "images/person_y.svg",
    z: "images/person_z.svg",
};

function random(min, max) {
    return Math.random() * (max - min) + min;
}

document.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();

    if (!viewer.hidden) {
        if (event.key === "Escape") closeViewer();
        return;
    }

    if (event.key === " " || event.key.startsWith("Arrow")) {
        event.preventDefault();
    }

    if (event.key === "Backspace" || event.key === "Delete") {
        event.preventDefault();
        if (stage.lastElementChild) {
            stage.lastElementChild.remove();
            note = note.slice(0, -1);
        }
        return;
    }



    if (event.key === "Enter") {
        saveSnapshot();
        return;
    }

    if (!figures[key]) return;

    // true for "A", false for "a"
    const isUpper = event.key !== key;
    note += key;

    spawnFigure(figures[key], isUpper);
});

function spawnFigure(src, isUpper) {
    const img = document.createElement("img");
    img.src = src;
    img.className = "figure";

    const size = 140;
    img.style.width = size + "px";

    const x = random(0, stage.clientWidth - size);
    const y = random(0, stage.clientHeight - size);
    const rotation = random(-180, 180);

    img.style.left = x + "px";
    img.style.top = y + "px";
    img.style.transform = `rotate(${rotation}deg)`;

    if (isUpper) {
        img.style.filter = "brightness(0) invert(1)";
    }

    stage.appendChild(img);
}

function takeSnapshot(scale) {
    const w = stage.clientWidth;
    const h = stage.clientHeight;

    const box = document.createElement("div");
    box.className = "snapshot-box";
    box.style.width = w * scale + "px";
    box.style.height = h * scale + "px";
    box.style.overflow = "hidden";
    box.style.position = "relative";

    const copy = stage.cloneNode(true);
    copy.removeAttribute("id");
    copy.classList.add("snapshot-copy");
    copy.style.width = w + "px";
    copy.style.height = h + "px";
    copy.style.position = "absolute";
    copy.style.left = "0";
    copy.style.top = "0";
    copy.style.transformOrigin = "top left";
    copy.style.transform = `scale(${scale})`;
    copy.style.pointerEvents = "none";

    box.appendChild(copy);
    return box;
}

function formatTimestamp(date) {
    return date.toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
    });
}

//saving a snapshot to firestore

async function saveNote(timestamp) {
    try {
        const docRef = await addDoc(collection(db, "notes"), {
            note: note,
            timestamp: timestamp
        });
        console.log("Document written with ID: ", docRef.id);
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}

function saveSnapshot() {
    if (!stage.children.length) return;

    const timestamp = new Date();

    saveNote(timestamp);

    //loading a snapshot
    const thumbWidth = 140;
    const scale = thumbWidth / stage.clientWidth;

    const item = document.createElement("div");
    item.className = "snapshot-item";

    const thumb = takeSnapshot(scale);
    thumb.classList.add("thumb");
    thumb.style.cursor = "pointer";

    thumb._snapshotHTML = stage.innerHTML;
    thumb._w = stage.clientWidth;
    thumb._h = stage.clientHeight;
    thumb._timestamp = timestamp;
    thumb._note = note;

    thumb.addEventListener("click", () => openSnapshot(thumb));

    const label = document.createElement("div");
    label.className = "snapshot-label";
    label.textContent = formatTimestamp(timestamp);
    label.title = timestamp.toISOString();

    item.appendChild(thumb);
    item.appendChild(label);
    gallery.appendChild(item);

    stage.innerHTML = "";
    gallery.scrollTop = gallery.scrollHeight;
    console.log(note);
    note = "";
}

function openSnapshot(thumb) {
    const w = thumb._w;
    const h = thumb._h;
    const scale = Math.min(
        (window.innerWidth * 0.9) / w,
        (window.innerHeight * 0.9) / h,
        1
    );

    const copy = document.createElement("div");
    copy.className = stage.className;
    copy.innerHTML = thumb._snapshotHTML;
    copy.style.cssText = `
        position: relative;
        width: ${w}px;
        height: ${h}px;
        transform-origin: top left;
        transform: scale(${scale});
    `;

    const box = document.createElement("div");
    box.style.cssText = `
        width: ${w * scale}px;
        height: ${h * scale}px;
        overflow: hidden;
    `;
    box.appendChild(copy);

    viewer.innerHTML = "";
    viewer.appendChild(box);
    viewer.hidden = false;

    viewer.hidden = false;

    const caption = document.createElement("div");
    caption.style.cssText = "color: black; margin-top: 8px; text-align: center;";

    if (thumb._note) {
        const noteEl = document.createElement("div");
        noteEl.textContent = thumb._note;
        noteEl.style.cssText = "font-size: 1.1rem;";
        caption.appendChild(noteEl);
    }

    const timeEl = document.createElement("div");
    timeEl.textContent = formatTimestamp(thumb._timestamp);
    timeEl.style.cssText = "font-size: 0.8rem; opacity: 0.6;";
    caption.appendChild(timeEl);

    viewer.appendChild(caption);
}

function closeViewer() {
    viewer.hidden = true;
    viewer.innerHTML = "";
}

viewer.addEventListener("click", closeViewer);