const fs = require('fs');
const {StringDecoder} = require('string_decoder');
const decoder = new StringDecoder('utf8');

let cnt = 0;

for (let i = 0; i < 8; i++) {
    let fileName = `./fingerprint_feature/true1/${i}.txt`;
    let templetArray = [];
    try {
        let templetData = decoder.write(fs.readFileSync(fileName));
        templetArray = templetData.split('\n').slice(0, -1);
    } catch (err) {
        console.log(err);
    }
    for (let j = 0; j < 20; j++) {
        for (let k = j + 1; k < 20; k++) {
            let targetData = `${templetArray[j]}\n${templetArray[k]}`;
            let targetFileName = `./fingerprint_feature/newTrue1/${cnt}.txt`;
            try {
                fs.appendFileSync(targetFileName, targetData);
                console.log(`Data[${j}][${k}] of ${fileName} have been wrote in ${targetFileName}`);
            } catch (err) {
                console.log(err);
            }
            cnt++;
        }
    }
}
