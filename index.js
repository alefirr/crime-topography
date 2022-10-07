let names = {};
let data = [];

const parseData = async () => {
  await Promise.all([
    fetch('./names.json')
      .then((response) => response.json())
      .then((json) => (names = json)),
    fetch('./events.json')
      .then((response) => response.json())
      .then((json) => (data = json)),
  ]);
};

parseData().then(() =>
  
);
