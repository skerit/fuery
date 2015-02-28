# Fuery

A pausable function queue with optional parallel concurrency

## Install

```bash
$ npm install fuery
```

## Examples

### Create a Fuery instance

```javascript
var Fuery = require('fuery'),
    queue = new Fuery();

// Allow only 1 function to run at a time (default is unlimited)
queue.limit = 1;
```

### Queue a function

The first argument is a function that you should call when the function has completed.

```javascript
queue.add(function(done) {
    // Do stuff
    done();
});
```

You can also add your own arguments like this

```javascript
queue.add(function(done, x, y, z) {
    // Do stuff
    done();
}, [x, y, z]);
```

### Set context

You can set the context the queued functions run in.
When not set, the context defaults to null.

```javascript
queue.setContext({test: 1});
```

### Start the queue

New Fuery instances are paused upon creation, they always need to be started

```javascript
queue.start();
```

### Pause the queue

Pausing the queue is also possible, ofcourse.
You can supply a callback that will fire when all currently running functions have ended.

```javascript
queue.pause(function() {
    // All running functions are done
});
```

## License

MIT