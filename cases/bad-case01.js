// bad-case01.js
// 這是一個充滿壞味道的典型 Legacy Code 範例，用來測試 Persona 的吐槽能力
const fs = require('fs');

var globalData = null;

function DO_IT(cb) {
    fs.readFile('./config.txt', function(err, result) {
        if(err) {
            console.log("error");
        } else {
            try {
                let parsed = JSON.parse(result);
                fs.readdir(parsed.dir, function(err2, files) {
                    if(err2) console.log("error2");
                    globalData = files;
                    
                    let out = [];
                    for(var i=0; i<files.length; i++) {
                        fs.readFile(parsed.dir + '/' + files[i], function(err3, data) {
                            if(!err3) {
                                out.push(data.toString());
                            }
                            if(i === files.length - 1) { // 錯誤的異步處理機制，這裡一定會出事
                                cb(out);
                            }
                        });
                    }
                });
            } catch(e) {
                // 吃掉所有的錯
            }
        }
    });
}

module.exports = DO_IT;
