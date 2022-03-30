
const fs = require('fs')

// const makeArrayFromTextFile = (path) => {
//     const text = fs.readFileSync(path, 'utf-8')
//     const textByLine = text.split('\n')
//     return textByLine
// }

// const array = makeArrayFromTextFile('../texts/banglaTexts.txt')

// console.log(array)


var convert = document.getElementById('convert');
//click can also be antother event
convert.addEventListener('click', function () {
    const path = '../texts/banglaTexts.txt'
    const text = fs.readFileSync(path, 'utf-8')
    const textByLine = text.split('\n')
    return textByLine
});

console.log(textByLine)




// converting an array into text file
// const arrayToTextFile = (array, path) => {
//     const text = array.join('\n')
//     fs.writeFileSync(path, text, 'utf-8')
// }
var myarray = ["ram", "ram", "jan", "jan", "feb", "feb"]

var content = "";

for (var i = 0; i < myarray.length; i++) {
    content += myarray[i];
    content += "\n";
}

// Build a data URI:
uri = "data:application/octet-stream," + encodeURIComponent(content);

// Click on the file to download
// You can also do this as a button that has the href pointing to the data URI
location.href = uri;

<a href="data:text/plain;base64,SGVsbG8gV29ybGQh" download="hello.txt">Text file</a>