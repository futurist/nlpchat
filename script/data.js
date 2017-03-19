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

function saveData(data){
  firebase.database().ref('/data').set(data).catch(e=>{
    console.log(e)
  })
}

function loadData() {
  firebase.database().ref('/data').once('value').then(data=>{
    console.log(data.val())
  })
}

module.exports = defaultData

{
  saveData,
  loadData
}

