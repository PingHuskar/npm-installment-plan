function daysDifference(d0, d1) {
  var diff = new Date(+d1).setHours(12) - new Date(+d0).setHours(12);
  return Math.round(diff / 8.64e7);
}
module.exports = daysDifference;