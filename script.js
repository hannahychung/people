
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";
import {
    getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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
let figureData = [];

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
    0: "images/person_0.svg",
    1: "images/person_1.svg",
    2: "images/person_2.svg",
    3: "images/person_3.svg",
    4: "images/person_4.svg",
    5: "images/person_5.svg",
    6: "images/person_6.svg",
    7: "images/person_7.svg",
    8: "images/person_8.svg",
    9: "images/person_9.svg"
};

function random(min, max) {
    return Math.random() * (max - min) + min;
}

//keeping track of new snapshots

function listenForSnapshots() {
    const q = query(collection(db, "notes"), orderBy("timestamp", "asc"));

    onSnapshot(
        q,
        (querySnapshot) => {
            querySnapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                    const d = change.doc.data();
                    if (!d.figures) return;
                    const ts = d.timestamp ? d.timestamp.toDate() : new Date();

                    addSnapshotToGallery({
                        id: change.doc.id,
                        note: d.note,
                        figures: d.figures,
                        w: d.stageWidth,
                        h: d.stageHeight,
                        timestamp: ts,
                    });
                }
            });

            gallery.scrollTop = gallery.scrollHeight;
        },
        (error) => {
            console.error("Error listening for notes: ", error);
        }
    );
}

listenForSnapshots();

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
            figureData.pop();
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
    note += isUpper ? key.toUpperCase() : key;  // optional: keeps case in the caption
    spawnFigure(key, isUpper);
});

function renderFigure(container, { key, upper, x, y, rotation }) {
    const img = document.createElement("img");
    img.src = figures[key];
    img.className = "figure";
    img.style.width = "140px";
    img.style.left = x + "px";
    img.style.top = y + "px";
    img.style.transform = `rotate(${rotation}deg)`;
    if (upper) img.style.filter = "brightness(0) invert(1)";
    container.appendChild(img);
}

function spawnFigure(key, isUpper) {
    const size = 140;
    const data = {
        key,
        upper: isUpper,
        x: random(0, stage.clientWidth - size),
        y: random(0, stage.clientHeight - size),
        rotation: random(-180, 180),
    };
    figureData.push(data);
    renderFigure(stage, data);
}

function takeSnapshot(source, w, h, scale) {
    const box = document.createElement("div");
    box.className = "snapshot-box";
    box.style.width = w * scale + "px";
    box.style.height = h * scale + "px";
    box.style.overflow = "hidden";
    box.style.position = "relative";

    const copy = source.cloneNode(true);
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

async function saveNote({ text, figs, w, h }) {
    try {
        const docRef = await addDoc(collection(db, "notes"), {
            note: text,
            figures: figs,
            stageWidth: w,
            stageHeight: h,
            timestamp: serverTimestamp(),
        });
        console.log("Document written with ID: ", docRef.id);
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}

function saveSnapshot() {
    if (!stage.children.length) return;

    saveNote({
        text: note,
        figs: [...figureData],
        w: stage.clientWidth,
        h: stage.clientHeight,
    });

    stage.innerHTML = "";
    figureData = [];
    note = "";
}

function addSnapshotToGallery({ note: text, figures: figs, w, h, timestamp }) {
    // rebuild the stage from data
    const source = document.createElement("div");
    source.className = stage.className;
    source.style.cssText = `position: relative; width: ${w}px; height: ${h}px;`;
    figs.forEach((f) => renderFigure(source, f));

    const scale = 140 / w;

    const item = document.createElement("div");
    item.className = "snapshot-item";

    const thumb = takeSnapshot(source, w, h, scale);
    thumb.classList.add("thumb");
    thumb.style.cursor = "pointer";
    thumb._snapshotHTML = source.innerHTML;
    thumb._w = w;
    thumb._h = h;
    thumb._timestamp = timestamp;
    thumb._note = text;
    thumb.addEventListener("click", () => openSnapshot(thumb));

    const label = document.createElement("div");
    label.className = "snapshot-label";
    label.textContent = formatTimestamp(timestamp);
    label.title = timestamp.toISOString();

    item.appendChild(thumb);
    item.appendChild(label);
    gallery.appendChild(item);
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