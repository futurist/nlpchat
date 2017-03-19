var defaultData = [{
  text: 'root',
  'class': 'asdfas',
  _static: true,
  children: [
    {
      text: 'A',
      _close: true,
      children: [{
        name: 'A1',
        font: 'red',
        children: null
      }, {
        text: 'A2'
      }]
    },
    { text: 'B' },
    { text: 'B' },
    { text: 'B' },
    { text: 'B' },
    { text: 'B' },
    { text: 'B' },
    { text: 'B' },
    { text: 'B' },
    { text: 'B' },
    { text: 'B' },
    { text: 'B' },
    { text: 'B' },
    { text: 'B' },
    { text: 'B' },
    { text: 'B' },
    { text: 'B' },
  ]
}]


// Initialize Firebase
var config = {
  apiKey: 'AIzaSyDMj1X8SQ4_gvy28yNGYbypnezoqjr9dfw',
  // authDomain: '',
  databaseURL: 'https://treeformat.firebaseio.com',
  storageBucket: 'gs://treeformat.appspot.com'
};
firebase.initializeApp(config);
console.log(firebase.database().ref('/data').once('value', e=>console.log(e)))

var _working

function working (){
  return _working
}

function saveData(data){
  _working = true
  return firebase.database().ref('/data').set(data).then(data=>{
    _working = false
    return data
  }, err=>{
    _working = false
    // console.log(err)
    return new Error(err)
  })
}

function loadData() {
  _working = true
  return firebase.database().ref('/data').once('value').then(data=>{
    // console.log(data.val())
    _working = false
    return data.val()
  }, err=>{
    _working = false
    // console.log(err)
    return new Error(err)
  })
}

module.exports = {
  saveData,
  loadData,
  working
}

