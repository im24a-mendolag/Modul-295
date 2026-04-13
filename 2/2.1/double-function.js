function double(value, callback) {
    return callback(value*2)
}

double(5, function(result) {
  console.log('Das Ergebnis ist:', result);
});