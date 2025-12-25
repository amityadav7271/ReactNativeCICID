// Polyfill for Array.prototype.toReversed for Node.js compatibility
if (!Array.prototype.toReversed) {
  Array.prototype.toReversed = function() {
    return [...this].reverse();
  };
}