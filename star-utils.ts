import * as THREE from 'three';

/* code to scrape star data from wikipedia tables

var rows = temp0.querySelectorAll('tr');    // temp0 should be the tbody

var COLUMN_COUNT = 11;
var SYSTEM_INDEX = 0;
var STAR_INDEX = 1;
var DISTANCE_INDEX = 2;
var STELLAR_CLASS_INDEX = 3;
var RIGHT_ASCENSION_INDEX = 7;
var DECLINATION_INDEX = 8;

var rowData = [];
var rowSpans = {};
for (var i = 0; i < rows.length; i++) {
    var columns = rows[i].querySelectorAll('td');
    var columnIndex = 0;
    var newRow = [];
    // console.log(columns, rowSpans);
    var columnSpan = undefined;
    for (var j = 0; j < COLUMN_COUNT; j++) {
        // if (i === 4) console.log(j, columnIndex, columns, rowSpans, newRow);
        if (rowSpans[j] !== undefined && rowSpans[j].span > 1) {
            newRow.push(rowSpans[j].value);
            rowSpans[j].span--;
        } else if (columnSpan !== undefined && columnSpan.span > 1) {
            newRow.push(columnSpan.value);
            columnSpan.span--;
        } else {
            var column = columns[columnIndex];
            if (column === undefined) continue;
            var columnValue = column.innerText;
            rowSpans[j] = { span: column.rowSpan, value: columnValue };
            columnSpan = { span: column.colSpan, value: columnValue };
            newRow.push(columnValue);
            columnIndex++;
        }
    }
    rowData.push(newRow);
}

var rowStrings = [];
for (var i = 0; i < rowData.length; i++) {
    var row = rowData[i];
    var system = /(.*)\s*\(?/.exec(row[SYSTEM_INDEX])[1].trim();
    var star = /(.*)\s*\(?/.exec(row[STAR_INDEX])[1].trim();
    var distance = parseFloat(/(\d+\.\d+)/.exec(row[DISTANCE_INDEX])[1]);
    var cls = row[STELLAR_CLASS_INDEX][0];
    var rightAscension = row[RIGHT_ASCENSION_INDEX];
    var declination = row[DECLINATION_INDEX];
    var result = "{ name: \"" + star + "\", class: \"" + cls + "\", distance: " + distance + ", rightAscension: \"" + rightAscension + "\", declination: \"" + declination + "\" }"
    rowStrings.push(result);
}

console.log(rowStrings.join(',\n'));
*/

/*
G - G-type main sequence star (sol-like)
M - red dwarf
K - K-type main sequence star (orange dwarf)
L - brown dwarf
T - brown dwarf
Y - brown dwarf
A - A-type main sequence star (dwarf star)
D - white dwarf
F - F-type main sequence star
*/
export type StellarClass = 'G' | 'M' | 'K' | 'L' | 'T' | 'Y' | 'A' | 'D' | 'F' | 'B' | 'O' | 'S' | 'W' | 'R' | 'C' | 'P' | 'N';
export const STELLAR_CLASSES: StellarClass[] = ['G', 'M', 'K', 'L', 'T', 'Y', 'A', 'D', 'F', 'B', 'O', 'S', 'W', 'R', 'C', 'P', 'N'];
export type LightYears = number;
export type SiderealTime = string;
export type Degrees = string;

export function getAngleFromSiderealTime(time: SiderealTime | number): number {
    if (typeof time === 'number') return time;

    let re = /(\d{2})\s*h?H?\s*(\d{2})\s*m?M?\s*(\d+(\.\d+)?)+/;
    let result = re.exec(time);
    let hours = parseInt(result[1]);
    let minutes = parseInt(result[2]);
    let seconds = parseFloat(result[3]);

    let angle = hours * 15;
    angle += minutes * (15 / 60);
    angle += seconds * (15 / 60 / 60);

    return angle;
}

export function getAngleFromDegrees(degrees: Degrees | number): number {
    if (typeof degrees === 'number') return degrees;

    let re = /(-|−|\+)?(\d{2})°?\s*(\d{2})′?\s*(\d+(\.\d+)?)/;
    let result = re.exec(degrees);
    let sign = result[1];
    let angle = parseInt(result[2]);
    let minutes = parseInt(result[3]);
    let seconds = parseInt(result[4]);

    angle += minutes / 60;
    angle += seconds / 60 / 60;
    if (sign !== '+') angle *= -1;

    return angle;
}

export function getDirectionFromRaDec(rightAscension: SiderealTime | number, declination: Degrees | number): THREE.Vector3 {
    let rightAscensionAngle = getAngleFromSiderealTime(rightAscension);
    let declinationAngle = getAngleFromDegrees(declination);

    // y is above vertical, direction-agnostic
    let y = Math.sin(Math.PI * declinationAngle / 180.0);
    let length = Math.cos(Math.PI * declinationAngle / 180.0);

    // x/z plane is galactic plane
    let x = Math.cos(Math.PI * rightAscensionAngle / 180.0) * length;
    let z = Math.sin(Math.PI * rightAscensionAngle / 180.0) * length;

    return new THREE.Vector3(x, y, z);
}

export function getPositionFromRaDec(distance: LightYears, rightAscension: SiderealTime | number, declination: Degrees | number): THREE.Vector3 {
    return getDirectionFromRaDec(rightAscension, declination).multiplyScalar(distance);
}