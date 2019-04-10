const fs = require('fs');
const {StringDecoder} = require('string_decoder');
const decoder = new StringDecoder('utf8');

let fileName = `./fingerprint_feature/newTrue/0.txt`;
let templetArray = [];
try {
    let templetData = decoder.write(fs.readFileSync(fileName));
    templetArray = templetData.split('\n');
} catch (err) {
    console.log(err);
}
let formerArray = templetArray[0].split(' ');
let latterArray = templetArray[1].split(' ');
let differ = 0;
formerArray = formerArray.map(x => parseInt(x, 16));
latterArray = latterArray.map(x => parseInt(x, 16));
console.log(formerArray);
console.log(latterArray);
for (let i = 0; i < formerArray.length; i++) {
    console.log(Math.pow(formerArray[i] - latterArray[i], 2));
    differ += Math.pow(formerArray[i] - latterArray[i], 2);
}