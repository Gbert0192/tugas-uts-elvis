const getRandomDelivery = () => {
  const randomNum = Math.floor(Math.random() * 5) + 1;
  if (randomNum === 1) {
    return 10000;
  } else if (randomNum === 2) {
    return 12000;
  } else if (randomNum === 3) {
    return 18000;
  } else if (randomNum === 4) {
    return 20000;
  } else if (randomNum === 5) {
    return 22000;
  }
};

module.exports = { getRandomDelivery };
