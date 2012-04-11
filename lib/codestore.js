/*var codestore = {};
codestore.webdb = {};

codestore.webdb.db = null;

codestore.webdb.open = function() {
  var dbSize = 5 * 1024 * 1024; // 5MB
  codestore.webdb.db = openDatabase("codestore", "1.0", "Code Store", dbSize);
  
  codestore.webdb.db.transaction(function(tx) {
    tx.executeSql("CREATE TABLE IF NOT EXISTS " +
                  "code(ID INTEGER PRIMARY KEY ASC,label TEXT,source TEXT,timestamp DATETIME)", []);
  });
}

codestore.webdb.onError = function(tx, e) {
  alert("There has been an error storing data in the code store: " + e.message);
}

codestore.webdb.onSuccess = function(tx, r) {
  // re-render the data.
  // loadTodoItems is defined in Step 4a
  //html5rocks.webdb.getAllTodoItems(loadTodoItems);
}

codestore.webdb.upsertCode = function(id,label,code) {
  var db = codestore.webdb.db;
  var timestamp = new Date();
  if(typeof(id) == 'undefined') {
    tx.executeSql("INSERT INTO todo(todo, added_on) VALUES (?,?)",
      [todoText, addedOn],
      codestore.webdb.onSuccess,
      codestore.webdb.onError);
  } else {
  }
  
  
  
  db.transaction(function(tx){
    
}

codestore.webdb.getAllTodoItems = function(renderFunc) {
  var db = codestore.webdb.db;
  db.transaction(function(tx) {
    tx.executeSql("SELECT * FROM todo", [], renderFunc,
        codestore.webdb.onError);
  });
}

html5rocks.webdb.deleteTodo = function(id) {
  var db = html5rocks.webdb.db;
  db.transaction(function(tx){
    tx.executeSql("DELETE FROM todo WHERE ID=?", [id],
        html5rocks.webdb.onSuccess,
        html5rocks.webdb.onError);
    });
}
*/