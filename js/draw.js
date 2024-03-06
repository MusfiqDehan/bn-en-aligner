const app = document.querySelector("#app");
const form = document.querySelector("form");
const src_inp = form.querySelector("input[name=source]");
const tgt_inp = form.querySelector("input[name=target]");
const aligns_inp = form.querySelector("input[name=aligns]");

const src = app.querySelector("#source");
const tgt = app.querySelector("#target");
const alignsEl = app.querySelector("#alignments");

const error = document.querySelector("#error");

function copyToClipboard(id) {
    var copyText = document.getElementById(id);
    var text = copyText.value;

    navigator.clipboard
        .writeText(text)
        .then(function () {
            console.log("Copied the text: " + text);
        })
        .catch(function (err) {
            console.error("Could not copy text: ", err);
        });
}

//==============================================================================
const banglaTexts = [
    "এতে কুটনৈতিক ভুল বোঝাবুঝির কারণে বিরক্ত মুসোলিনি ২৮শে অক্টবর ১৯৪০ আলবেনিয়া থেকে গ্রিস আক্রমণ করলেন",
    "৬ই এপ্রিল একই দিনে আকাশ থেকে বোমাবর্ষণ এবং বুলগেরিয়া ও অস্ট্রিয়া দিয়ে সৈন্য পাঠিয়ে জার্মানী গ্রিস ও যুগোস্লাভিয়া আক্রমণ করল ",
];

const englishTexts = [
    "In this due to misunderstanding frustrated Mussolini on 28th October 1940 attacked Greece from Albania",
    "In the same day of 6th April Germany attacked Greece and Yugoslavia by bombarding from the air and by sending armies through Bulgaria and Austria",
];

//==============================================================================

alignIndexes = [];

let bnIdx = 0;
let enIdx = 0;

function fetchInputs() {
    src_inp.value = banglaTexts[bnIdx++];
    tgt_inp.value = englishTexts[enIdx++];

    if (bnIdx === banglaTexts.length || enIdx === englishTexts.length) {
        bnIdx = 0;
        enIdx = 0;
    }
}

function storeAligns() {
    alignIndexes.push(aligns_inp.value);
    alignIndexes.value = "";

    alert("Total " + alignIndexes.length + " Alignment(s) stored!");
}

function saveAsText() {
    var content = "";

    for (var i = 0; i < alignIndexes.length; i++) {
        content += alignIndexes[i];
        content += "\n";
    }

    // Build a data URI:
    uri = "data:application/octet-stream," + encodeURIComponent(content);

    // Click on the file to download
    // You can also do this as a button that has the href pointing to the data URI
    location.href = uri;
}

//=============================================================================

function createAlignsFromStr(align_str) {
    try {
        // Will also throw an error when giving a negative value
        const aligns = align_str
            .split(" ")
            .map((pair) => pair.split("-", 2).map((x) => parseInt(x)));

        if (aligns.length < 1) {
            throw TypeError;
        }

        for (let align of aligns) {
            if (align.length != 2) {
                throw TypeError;
            } else if (Number.isNaN(align)) {
                throw TypeError;
            }

            for (let a of align) {
                if (Number.isNaN(a)) {
                    throw TypeError;
                }
            }
        }
        errorHandling("");
        return aligns;
    } catch (error) {
        errorHandling(
            "Something went wrong when parsing the alignments. Make sure that they are in the correct format and not negative, e.g. 0-0 1-0 2-2"
        );
        return false;
    }
}

function createStrFromAligns(aligns) {
    return aligns.map((arr) => arr.map(String).join("-")).join(" ");
}

function createSentences(tokens, parent) {
    const sideStr = parent.id == "source" ? "src" : "tgt";
    for (let [index, token] of tokens.entries()) {
        let el = document.createElement("span");
        el.className = "word";
        el.textContent = token;
        el.dataset.side = sideStr;
        el.dataset.index = index;
        parent.appendChild(el);
    }
}

function setWordAligned(word, aligned_idx) {
    aligned_idx = aligned_idx.toString();
    if ("aligned" in word.dataset) {
        let aligned_idxs = JSON.parse(word.dataset.aligned).map(String);
        aligned_idxs.push(aligned_idx);
        // Only unique items
        aligned_idxs = [...new Set(aligned_idxs)];
        word.dataset.aligned = JSON.stringify(aligned_idxs);
    } else {
        word.dataset.aligned = JSON.stringify([aligned_idx]);
    }
}

function removeWordAligned(word, aligned_idx) {
    aligned_idx = aligned_idx.toString();
    aligned_idxs = JSON.parse(word.dataset.aligned).map(String);
    const idx_in_arr = aligned_idxs.indexOf(aligned_idx);

    if (idx_in_arr != -1) {
        aligned_idxs.splice(idx_in_arr, 1);
    }
    word.dataset.aligned = JSON.stringify(aligned_idxs);
}

function drawAligns(aligns) {
    clearDrawBoard();

    const drawboard = document.querySelector("#alignments > svg");
    const drawboardHeight = drawboard.getBoundingClientRect().height;
    const src_words = src.querySelectorAll("span.word");
    const tgt_words = tgt.querySelectorAll("span.word");

    for (let align of aligns) {
        const src = src_words[align[0]];
        const tgt = tgt_words[align[1]];
        setWordAligned(src, align[1]);
        setWordAligned(tgt, align[0]);

        const srcRect = src.getBoundingClientRect();
        const tgtRect = tgt.getBoundingClientRect();
        const start = {
            x: src.offsetLeft + srcRect.width / 2,
            y: 8,
        };
        const end = {
            x: tgt.offsetLeft + tgtRect.width / 2,
            y: drawboardHeight - 8,
        };

        let line = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line"
        );
        line.setAttribute("x1", start.x);
        line.setAttribute("x2", end.x);
        line.setAttribute("y1", start.y);
        line.setAttribute("y2", end.y);
        line.dataset.src = align[0];
        line.dataset.tgt = align[1];
        drawboard.appendChild(line);
    }
}

function emptyElements(els) {
    if (!Array.isArray(els)) {
        els = [els];
    }

    for (el of els) {
        while (el.firstChild) {
            el.removeChild(el.lastChild);
        }
    }
}

function errorHandling(message) {
    if (message != "") {
        error.innerHTML = "<p>" + message + "</p>";
        app.style.display = "none";
        error.style.display = "block";
    } else {
        emptyElements(error);
        app.style.display = "block";
        error.style.display = "none";
    }
}

function getMaxWidth(...els) {
    return Math.max(...els.map((el) => el.getBoundingClientRect().width));
}

function clearDrawBoard() {
    alignsEl.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0"></svg>';
    const drawboard = alignsEl.querySelector("svg");
    const drawboardRect = drawboard.parentNode.getBoundingClientRect();
    drawboard.setAttribute("width", getMaxWidth(src, tgt, alignsEl));
    drawboard.setAttribute("height", drawboardRect.height);
}

function parseText() {
    const src_strings = src_inp.value.split(" ");
    const tgt_strings = tgt_inp.value.split(" ");
    emptyElements([src, tgt]);
    createSentences(src_strings, src);
    createSentences(tgt_strings, tgt);

    src.querySelectorAll("span.word").forEach((el) => {
        el.addEventListener("mouseover", (evt) => {
            if (!evt.target.classList.contains("alignable")) {
                highlight(evt.target, "src");
            }
        });
        el.addEventListener("mouseleave", (evt) => removeHighlights());
    });

    tgt.querySelectorAll("span.word").forEach((el) => {
        el.addEventListener("mouseover", (evt) => {
            if (!evt.target.classList.contains("alignable")) {
                highlight(evt.target, "tgt");
            }
        });
        el.addEventListener("mouseleave", (evt) => removeHighlights());
    });
}

function parseAligns() {
    aligns_str = aligns_inp.value.trim();

    let aligns;
    if (aligns_str) {
        aligns = createAlignsFromStr(aligns_str);
    } else {
        clearDrawBoard();
        aligns = false;
    }

    if (aligns != false) {
        const n_src_tokens = src.querySelectorAll("span.word").length;
        const n_tgt_tokens = tgt.querySelectorAll("span.word").length;
        const src_ids = aligns.map((align) => align[0]);
        const tgt_ids = aligns.map((align) => align[1]);
        if (
            Math.max(...src_ids) >= n_src_tokens.length ||
            Math.max(...tgt_ids) >= n_tgt_tokens.length
        ) {
            errorHandling(
                "The alignments do not match the number of source or target tokens you have given."
            );
        } else {
            // Clear any previous errors
            errorHandling("");
            drawAligns(aligns);
        }
    }
}

function highlight(word, side) {
    removeHighlights();
    if ("aligned" in word.dataset) {
        // Because all other `dataset` items below are str, convert indices to str
        const aligned_idxs = JSON.parse(word.dataset.aligned).map(String);
        let lines = Array.from(alignsEl.querySelectorAll("line"));
        let words;
        if (side == "src") {
            words = tgt.querySelectorAll("span.word");
            // Only include lines whose source is the current word's ID
            lines = lines.filter(
                (line) => line.dataset.src == word.dataset.index
            );
        } else {
            words = src.querySelectorAll("span.word");
            // Only include lines whose target is the current word's ID
            lines = lines.filter(
                (line) => line.dataset.tgt == word.dataset.index
            );
        }
        // Only include words whose index is in the aligned idxs
        words = Array.from(words).filter((word) =>
            aligned_idxs.includes(word.dataset.index)
        );
        const elements = [...words, ...lines, word];
        elements.forEach((el) => el.classList.add("highlight"));
    }
}

function removeHighlights() {
    const elements = [
        ...tgt.querySelectorAll("span.word"),
        ...src.querySelectorAll("span.word"),
        ...alignsEl.querySelectorAll("line"),
    ];

    elements.forEach((el) => {
        if (!("clicked" in el.dataset)) {
            el.classList.remove("highlight");
        }
    });
}

form.addEventListener("submit", (evt) => {
    evt.preventDefault();
    parseText();
    parseAligns();
});

window.addEventListener("resize", (evt) => {
    parseText();
    parseAligns();
});

app.addEventListener("mouseleave", (evt) => {
    removeHighlights();
});

// Trigger submit for the first load
form.querySelector("input[type=submit]").click();

/* ALIGNER */
let sourceClicked = false;
let targetClicked = false;

function addOrRemoveAlignable(word1, word2) {
    let new_align;
    if (word1.dataset.side == "src") {
        new_align = [word1.dataset.index, word2.dataset.index].join("-");
    } else {
        new_align = [word2.dataset.index, word1.dataset.index].join("-");
    }

    let align_pairs = aligns_inp.value.trim();

    if (align_pairs) {
        align_pairs = align_pairs.split(" ");
    } else {
        align_pairs = [];
    }

    if (align_pairs.includes(new_align)) {
        // Remove alignment
        removeWordAligned(word1, word2.dataset.index);
        removeWordAligned(word2, word1.dataset.index);
        align_pairs.splice(align_pairs.indexOf(new_align), 1);
    } else {
        // Add alignment
        setWordAligned(word1, word2.dataset.index);
        setWordAligned(word2, word1.dataset.index);
        align_pairs.push(new_align);
    }

    if (align_pairs.length == 0) {
        aligns_inp.value = "";
    } else {
        // Not the most efficient way to sort the alignments, but hey...
        // So before we work with strings, but we want to sort the alignments,
        // so we convert the string to integer alignments, then sort them,
        // and then convert them back
        align_pairs = createAlignsFromStr(align_pairs.join(" "));
        aligns_inp.value = createStrFromAligns(align_pairs.sort());
    }

    parseAligns();
}

function align(side, evt) {
    if (evt.target.tagName == "SPAN") {
        const otherClicked = side == "src" ? targetClicked : sourceClicked;
        const otherParent = side == "src" ? tgt : src;
        const thisParent = side == "src" ? src : tgt;

        if (otherClicked) {
            const otherClickedEl = otherParent.querySelector(
                "span.word[data-clicked='true']"
            );
            addOrRemoveAlignable(evt.target, otherClickedEl);

            thisParent
                .querySelectorAll("span.word")
                .forEach((el) => el.classList.remove("alignable", "removable"));
            delete otherClickedEl.dataset.clicked;
            if (side == "src") {
                targetClicked = false;
            } else {
                sourceClicked = false;
            }
        } else {
            const prevThisClicked = thisParent.querySelector(
                "span.word[data-clicked='true']"
            );
            if (prevThisClicked) {
                delete prevThisClicked.dataset.clicked;
                otherParent
                    .querySelectorAll("span.word")
                    .forEach((el) =>
                        el.classList.remove("alignable", "removable")
                    );
            }

            evt.target.dataset.clicked = true;
            highlight(evt.target, side);

            otherParent
                .querySelectorAll("span.word")
                .forEach((el) => el.classList.add("alignable"));
            if ("aligned" in evt.target.dataset) {
                const aligned_idxs = JSON.parse(evt.target.dataset.aligned).map(
                    String
                );
                Array.from(otherParent.querySelectorAll("span.word"))
                    .filter((el) => aligned_idxs.includes(el.dataset.index))
                    .forEach((el) => el.classList.add("removable"));
            }

            if (side == "src") {
                sourceClicked = true;
            } else {
                targetClicked = true;
            }
        }
    }
}

// To stop the alignment process when an element has already been clicked
window.addEventListener("click", (evt) => {
    if (
        evt.target.tagName != "SPAN" &&
        !evt.target.classList.contains("word")
    ) {
        const clickedEls = app.querySelectorAll(
            "span.word[data-clicked='true']"
        );

        Array.from(clickedEls).forEach((el) => delete el.dataset.clicked);

        app.querySelectorAll("span.word").forEach((el) =>
            el.classList.remove("alignable", "removable")
        );

        targetClicked = false;
        sourceClicked = false;
        removeHighlights();
    }
});

src.addEventListener("click", align.bind(this, "src"));
tgt.addEventListener("click", align.bind(this, "tgt"));
