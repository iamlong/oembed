
  var async = require('async');
  // run 'my_task' 100 times, with parallel limit of 10

  var my_task = function(callback) { callback(null, 'one');console.log('test') };
  var when_done = function(err, results) { console.log('done')};

  // create an array of tasks
  var async_queue = Array(100).fill(my_task);

  async.parallelLimit(async_queue, 1, when_done);