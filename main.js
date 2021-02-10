/* Loop
---------------------------------------------------------------- */

function renderVertex(id1, face, vertex, faceId, v, htmlV) {
    const id = faceToVertex(faceId, id1);
    const x = vertex.x.toFixed(2),
        y = vertex.y.toFixed(2),
        z = vertex.z.toFixed(2),
        s = 1.5; // scale to keep the text readable
    let vertexElem = htmlV[id];

    if (!vertexElem) {
        vertexElem = htmlV[id] = document.createElement("div");
        vertexElem.className = "vertex";
        document.getElementById("scene").appendChild(vertexElem);
    }

    // show the vertex coordinates
    vertexElem.textContent = v[id] || "";

    // apply the tralsation to the vertex
    vertexElem.style.cssText =
        "-webkit-transform: translate3d(" + x + "px," + y + "px," + z + "px) scale(" + s + ");" +
        "-moz-transform: translate3d(" + x + "px," + y + "px," + z + "px) scale(" + s + ");" +
        "-ms-transform: translate3d(" + x + "px," + y + "px," + z + "px) scale(" + s + ");" +
        "transform: translate3d(" + x + "px," + y + "px," + z + "px) scale(" + s + ");";
}

function faceToVertex(faceId, localV) {
    // console.log(faceId, localV);
    const map = [
        [0, 3, 7, 4],
        [2, 1, 5, 6],
        [1, 0, 4, 5],
        [3, 2, 6, 7],
        [4, 7, 6, 5],
        [1, 2, 3, 0]
    ];
    return map[faceId][localV];
}

function renderFaces(faces, v, htmlV) {

    // shedule the next update
    // requestAnimationFrame(loop);

    // let index = 0;
    for (let i = 0; i < 6; ++i) {
        // let i = index % 6;
        const face = faces[i]
        // Extract the elements transform
        const vertexData = computeVertexData(face);
        // Draw the vertices
        renderVertex(0, face, vertexData.a, i, v, htmlV);
        renderVertex(1, face, vertexData.b, i, v, htmlV);
        renderVertex(2, face, vertexData.c, i, v, htmlV);
        renderVertex(3, face, vertexData.d, i, v, htmlV);
    }
}


/* Renders a vertex to the DOM
---------------------------------------------------------------- */




/* Returns A, B, C and D vertices of an element
---------------------------------------------------------------- */

function computeVertexData(elem) {
    const w = elem.offsetWidth,
        h = elem.offsetHeight,
        v = {
            a: {x: -w / 2, y: -h / 2, z: 0},
            b: {x: w / 2, y: -h / 2, z: 0},
            c: {x: w / 2, y: h / 2, z: 0},
            d: {x: -w / 2, y: h / 2, z: 0}
        };

    while (elem.nodeType === 1) {
        const transform = getTransform(elem);
        v.a = addVectors(rotateVector(v.a, transform.rotate), transform.translate);
        v.b = addVectors(rotateVector(v.b, transform.rotate), transform.translate);
        v.c = addVectors(rotateVector(v.c, transform.rotate), transform.translate);
        v.d = addVectors(rotateVector(v.d, transform.rotate), transform.translate);
        elem = elem.parentNode;
    }
    return v;
}


/* Returns the rotation and translation components of an element
---------------------------------------------------------------- */

function getTransform(elem) {
    var computedStyle = getComputedStyle(elem, null),
        val = computedStyle.transform ||
            computedStyle.webkitTransform ||
            computedStyle.MozTransform ||
            computedStyle.msTransform,
        matrix = parseMatrix(val),
        rotateY = Math.asin(-matrix.m13),
        rotateX,
        rotateZ;

    rotateX = Math.atan2(matrix.m23, matrix.m33);
    rotateZ = Math.atan2(matrix.m12, matrix.m11);

    /*if (Math.cos(rotateY) !== 0) {
        rotateX = Math.atan2(matrix.m23, matrix.m33);
        rotateZ = Math.atan2(matrix.m12, matrix.m11);
    } else {
        rotateX = Math.atan2(-matrix.m31, matrix.m22);
        rotateZ = 0;
    }*/

    return {
        transformStyle: val,
        matrix: matrix,
        rotate: {
            x: rotateX,
            y: rotateY,
            z: rotateZ
        },
        translate: {
            x: matrix.m41,
            y: matrix.m42,
            z: matrix.m43
        }
    };
}


/* Parses a matrix string and returns a 4x4 matrix
---------------------------------------------------------------- */

function parseMatrix(matrixString) {
    var c = matrixString.split(/\s*[(),]\s*/).slice(1, -1),
        matrix;

    if (c.length === 6) {
        // 'matrix()' (3x2)
        matrix = {
            m11: +c[0], m21: +c[2], m31: 0, m41: +c[4],
            m12: +c[1], m22: +c[3], m32: 0, m42: +c[5],
            m13: 0, m23: 0, m33: 1, m43: 0,
            m14: 0, m24: 0, m34: 0, m44: 1
        };
    } else if (c.length === 16) {
        // matrix3d() (4x4)
        matrix = {
            m11: +c[0], m21: +c[4], m31: +c[8], m41: +c[12],
            m12: +c[1], m22: +c[5], m32: +c[9], m42: +c[13],
            m13: +c[2], m23: +c[6], m33: +c[10], m43: +c[14],
            m14: +c[3], m24: +c[7], m34: +c[11], m44: +c[15]
        };

    } else {
        // handle 'none' or invalid values.
        matrix = {
            m11: 1, m21: 0, m31: 0, m41: 0,
            m12: 0, m22: 1, m32: 0, m42: 0,
            m13: 0, m23: 0, m33: 1, m43: 0,
            m14: 0, m24: 0, m34: 0, m44: 1
        };
    }
    return matrix;
}

/* Adds vector v2 to vector v1
---------------------------------------------------------------- */

function addVectors(v1, v2) {
    return {
        x: v1.x + v2.x,
        y: v1.y + v2.y,
        z: v1.z + v2.z
    };
}


/* Rotates vector v1 around vector v2
---------------------------------------------------------------- */

function rotateVector(v1, v2) {
    var x1 = v1.x,
        y1 = v1.y,
        z1 = v1.z,
        angleX = v2.x / 2,
        angleY = v2.y / 2,
        angleZ = v2.z / 2,

        cr = Math.cos(angleX),
        cp = Math.cos(angleY),
        cy = Math.cos(angleZ),
        sr = Math.sin(angleX),
        sp = Math.sin(angleY),
        sy = Math.sin(angleZ),

        w = cr * cp * cy + -sr * sp * -sy,
        x = sr * cp * cy - -cr * sp * -sy,
        y = cr * sp * cy + sr * cp * sy,
        z = cr * cp * sy - -sr * sp * -cy,

        m0 = 1 - 2 * (y * y + z * z),
        m1 = 2 * (x * y + z * w),
        m2 = 2 * (x * z - y * w),

        m4 = 2 * (x * y - z * w),
        m5 = 1 - 2 * (x * x + z * z),
        m6 = 2 * (z * y + x * w),

        m8 = 2 * (x * z + y * w),
        m9 = 2 * (y * z - x * w),
        m10 = 1 - 2 * (x * x + y * y);

    return {
        x: x1 * m0 + y1 * m4 + z1 * m8,
        y: x1 * m1 + y1 * m5 + z1 * m9,
        z: x1 * m2 + y1 * m6 + z1 * m10
    };
}

function check(v) {
    const f = new Array(6).fill(0);
    f[0] = v[0] + v[1] + v[2] + v[3];
    f[1] = v[3] + v[2] + v[6] + v[7];
    f[2] = v[4] + v[5] + v[6] + v[7];
    f[3] = v[0] + v[1] + v[4] + v[5];
    f[4] = v[5] + v[1] + v[2] + v[6];
    f[5] = v[0] + v[3] + v[4] + v[7];
    f.sort((a, b) => a - b);
    for (let i = 1; i < 6; ++i) {
        if (f[i] === f[i - 1]) {
            return false;
        }
    }
    return true;
}


function main(window, document) {
// Select the faces
    const faces = Array.from(document.querySelectorAll(".face"));

    const input = document.querySelector(".input");
    const warn1 = document.querySelector(".warn1");
    const win = document.querySelector(".win");
    const error = document.querySelector(".error");
    const arr0 = new Array(8).fill(0);
    const htmlV = new Array(8);
    renderFaces(faces, arr0, htmlV);
    input.oninput = function () {
        warn1.classList.add("hidden");
        win.classList.add("hidden");
        error.classList.add("hidden");
        const str = input.value;
        const arr = new Array(8).fill(0);
        let arrIndex = 0;
        for (let i = 0; i < str.length; ++i) {
            const candidate = str[i].charCodeAt() - '0'.charCodeAt();
            if (candidate <= 0 || candidate > 8) {
                continue;
            }
            if (arr.includes(candidate)) {
                warn1.classList.remove("hidden");
                return;
            }
            arr[arrIndex] = candidate;
            ++arrIndex;
        }
        renderFaces(faces, arr, htmlV);
        if (arrIndex === 8) {
            if (check(arr)) {
                win.classList.remove("hidden");
            } else {
                error.classList.remove("hidden");
            }
        }
        console.log(str);
    };
}

main(window, document);
