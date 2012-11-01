function(key, values) {
  var result = { total_amount : 0 }
  values.forEach(function(val) {
    if (val.count) {  
      result.total_amount += val.count;
    }
  });
  return result;
}
