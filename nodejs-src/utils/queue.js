class Queue {
    
    constructor() {
        this.items = [];
    }

    enqueue(element) {
        this.items.push(element);
    }

    dequeue() {
        if (!this.isEmpty()) 
            return this.items.shift();
        return null;
    }

    head() {
        if (!this.isEmpty()) {
            return this.items[0];
        }
    }

    isEmpty() {
        return this.items.length == 0;
    }

}

module.exports = Queue;

// Tests
    // Basic queue tests