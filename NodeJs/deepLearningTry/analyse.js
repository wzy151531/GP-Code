const fs = require('fs');
const {StringDecoder} = require('string_decoder');
const decoder = new StringDecoder('utf8');

let differArray = [];

for (let i = 0; i < 600; i++) {
    let fileName = `./fingerprint_feature/newTrue/${i}.txt`;
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
    for (let i = 0; i < formerArray.length; i++) {
        differ += Math.pow(formerArray[i] - latterArray[i], 2)
    }
    console.log(`./fingerprint_feature/newTrue/${i}.txt:differ is ${Math.sqrt(differ)}`);
    differArray.push(Math.sqrt(differ));
}

const average = arr => arr.reduce((acc, val) => acc + val, 0) / arr.length;

console.log(`average of newTrue is ${average(differArray)}`);