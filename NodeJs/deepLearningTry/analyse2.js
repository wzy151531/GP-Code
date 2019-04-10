const fs = require('fs');
const {StringDecoder} = require('string_decoder');
const decoder = new StringDecoder('utf8');

let differArray = [];

for (let i = 0; i < 100; i++) {
    let fileName = `./fingerprint_feature/true/${i}.txt`;
    let templetArray = [];
    try {
        let templetData = decoder.write(fs.readFileSync(fileName));
        templetArray = templetData.split('\n').slice(0, -1);
    } catch (err) {
        console.log(err);
    }
    let firstArray = templetArray[0].split(' ');
    let secondArray = templetArray[1].split(' ');
    let thirdArray = templetArray[2].split(' ');
    let forthArray = templetArray[3].split(' ');
    let finalArray = [];
    firstArray = firstArray.map(x => parseInt(x, 16));
    secondArray = secondArray.map(x => parseInt(x, 16));
    thirdArray = thirdArray.map(x => parseInt(x, 16));
    forthArray = forthArray.map(x => parseInt(x, 16));
    for (let i = 0; i < firstArray.length; i++) {
        finalArray[i] = (firstArray[i] + secondArray[i] + thirdArray[i]) / 3;
    }
    let finalArrayDis = 0;
    let forthArrayDis = 0;
    for (let i = 0; i < forthArray.length; i++) {
        finalArrayDis += finalArray[i] * finalArray[i];
        forthArrayDis += forthArray[i] * forthArray[i];
    }
    let differ = Math.sqrt(finalArrayDis) - Math.sqrt(forthArrayDis);
    console.log(`./fingerprint_feature/true/${i}.txt:differ is ${Math.abs(differ)}`);
    differArray.push(Math.abs(differ));
}

const average = arr => arr.reduce((acc, val) => acc + val, 0) / arr.length;

console.log(`average of newFalse is ${average(differArray)}`);