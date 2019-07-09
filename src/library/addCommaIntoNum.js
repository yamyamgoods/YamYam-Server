function addCommaIntoNum(num) {
  const regexp = /\B(?=(\d{3})+(?!\d))/g;

  return num.toString().replace(regexp, ',');
}

module.exports = {
  addCommaIntoNum,
};
