class ListNode {
    constructor(key, value) {
        this.prev = null;
        this.next = null;
        this.key = key;
        this.value = value;
    }
}

class LRUCache {

    constructor(capacity) {
        this.capacity = capacity;
        this.map = new Map();
        this.head = new ListNode(0);
        this.tail = new ListNode(0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }

    refresh(node) {
        this.remove(node);
        this.insert(node);
    }

    remove(node) {
        node.prev.next = node.next;
        node.next.prev = node.prev; 
    }

    insert(node) {
        var head = this.head;
        var temp = head.next;
        head.next = node;
        node.prev = head;
        node.next = temp;
        temp.prev = node;
    }

    read(key) {
        if (!this.map.has(key)) {
            return null;
        }
        var node = this.map.get(key);
        this.refresh(node);
        return node.value;
    }

    write(key, value) {
        if (this.map.has(key)) {
            var t = this.map.get(key);
            t.value = value;
            this.refresh(t);
            return;
        }
        var node = new ListNode(key, value);
        this.map.set(key, node);
        this.insert(node);
        if (this.map.size > this.capacity) {
            var r = this.tail.prev;
            this.remove(r);
            this.map.delete(r.key);
        }
    }

    flushCache() {
        this.map = new Map();
        this.head = new ListNode(0);
        this.tail = new ListNode(0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }

}

module.exports = LRUCache;

/*var c = new LRUCache(2);
c.put(1, 2);
c.put(3, 4);
console.log(c.get(3));
c.put(4, 5);
console.log(c.get(1));
console.log(c.get(4));
console.log(c.get(4));
console.log(c.get(3));
c.put(3, 6);
c.put(7, 8);
console.log(c.get(4));
console.log(c.get(3));*/

//["LRUCache","put","put","get","put","get","put","get","get","get"]
//[[2],[1,1],[2,2],[1],[3,3],[2],[4,4],[1],[3],[4]]

// Tests
    // Copy LeetCode LRUCache tests
    // Does fluschache work