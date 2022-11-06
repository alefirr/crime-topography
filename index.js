let names = {};
let data = [];
const north = 52.37778;
const south = 44.38639;
const east = 40.22361;
const west = 22.13806;

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

const getDateFormat = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}-${month < 10 ? `0${month}` : `${month}`}-${
    day < 10 ? `0${day}` : `${day}`
  }`;
};
const sortDates = (date) =>
  data.filter(
    (item) =>
      getDateFormat(new Date(item.from)) === getDateFormat(new Date(date)) ||
      (getDateFormat(new Date(item.from)) <= getDateFormat(new Date(date)) &&
        getDateFormat(new Date(item.till)) >= getDateFormat(new Date(date)))
  );
const displayDots = (lat, lon) => {
  if (lat === undefined || lon === undefined) return;

  const dotLat = ((north - lat) / (north - south)) * 100;
  const dotLon = ((lon - west) / (east - west)) * 100;
  const dot = document.createElement('div');

  dot.className = 'dot';
  dot.style.top = `${dotLat}%`;
  dot.style.left = `${dotLon}%`;

  document.getElementById('current').appendChild(dot);
};

const displayEvents = (date) => {
  [...document.getElementsByClassName('dot')].forEach((e) => e.remove());
  sortDates(date).forEach((item) => {
    displayDots(item?.lat, item?.lon);
  });
};

const findEarliestDate = () => {
  const earliestDate = data.reduce((a, b) => {
    return new Date(a.from) < new Date(b.from) ? a : b;
  });
  return new Date(earliestDate.from).getTime();
};

const findLatestDate = () => {
  const latestDate = data.reduce((a, b) => {
    return new Date(a.till) > new Date(b.till) ? a : b;
  });
  return new Date(latestDate.till).getTime();
};

const countAffectedPeople = (date) => {
  const sortedData = sortDates(date).filter((item) => item.affected_type);
  const { killed, injured, missing, raped } = getAffectedData(sortedData);

  document.getElementById('killed').textContent = killed;
  document.getElementById('injured').textContent = injured;
  document.getElementById('raped').textContent = raped;
  document.getElementById('missing').textContent = missing;
};

const getAffectedData = (sortedData) => {
  let killed = 0;
  let injured = 0;
  let missing = 0;
  let raped = 0;

  sortedData.forEach((item) => {
    switch (item.affected_type.join('')) {
      case '2': {
        killed += +item.affected_number.join('');
        break;
      }
      case '3': {
        injured += +item.affected_number.join('');
        break;
      }
      case '4': {
        raped += +item.affected_number.join('');
        break;
      }
      case '6': {
        missing += +item.affected_number.join('');
        break;
      }
    }
  });
  return { killed, injured, missing, raped };
};
const showData = (currentDate) => {
  const date = getDateFormat(new Date(currentDate));
  displayEvents(date);
  countAffectedPeople(date);
};

const setBubble = (input, bubble) => {
  const val = input.value;
  const min = input.min;
  const max = input.max;
  const percent = Number(((val - min) / (max - min)) * 1025);
  bubble.textContent = new Date(+val).toLocaleDateString();
  bubble.style.left = `calc(
    ${percent}px + 60px +
    ${bubble.offsetWidth / 2}px)`;
};

const onInputChange = (e, input, bubble) => {
  showData(+e.target?.value);
  document.getElementById('timeline').setAttribute('value', +e.target?.value);

  setBubble(input, bubble);
};

const onBtnClick = (input, bubble) => {
  let img = document.getElementById('play-1');
  let currentDate = document.getElementById('timeline').value;

  if (img.src.indexOf('images/Play.svg') > -1) {
    const showIntervalData = () => {
      showData(currentDate);
      setBubble(input, bubble);
      currentDate = +currentDate + 86400000;
      document.getElementById('timeline').setAttribute('value', currentDate);
    };
    interval = setInterval(showIntervalData, 200);
    img.setAttribute('src', 'images/Pause.svg');
  } else {
    clearInterval(interval);
    img.setAttribute('src', 'images/Play.svg');
  }
};

const onInput = () => {
  const input = document.getElementById('timeline');
  const bubble = document.getElementById('bubble');
  const playButton = document.getElementById('play-button');

  const firstDay = findEarliestDate();
  const latestDay = findLatestDate();
  playButton.addEventListener('click', () => onBtnClick(input, bubble));

  input.setAttribute('min', firstDay);
  input.setAttribute('max', latestDay);
  input.addEventListener('input', (e) => onInputChange(e, input, bubble));

  showData(firstDay);
  setBubble(input, bubble);
};

parseData().then(() => onInput());
