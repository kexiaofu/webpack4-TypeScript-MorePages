const fs = require('fs');
const path = require('path');
const getAllScript = (filePath, ext = '.ts') => {
  let result = {};
  let getScript = (fp) => {
    let arr = fs.readdirSync(fp), fpNormalize = '', extname = '';
    arr.map(item => {
      fpNormalize = path.normalize(fp + '/' + item);
      extname = path.extname(fpNormalize);
      if(fs.statSync(fpNormalize).isFile()) {
        if (ext === extname) {
          result[item.replace(extname, '')] = fpNormalize;
        }
      } else {
        getScript(fpNormalize)
      }
    });
  };
  getScript(filePath);
  return result;
};

exports.getAllScript = getAllScript;