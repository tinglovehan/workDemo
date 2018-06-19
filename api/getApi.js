const geApi=require('api.js');
const getUrl = (mold, pagemold) => {
  return geApi[mold][pagemold]
}


module.exports = {
  getUrl
}