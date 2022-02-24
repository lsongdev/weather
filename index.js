import { ready } from 'https://lsong.org/scripts/dom.js';
import { h, render, useState, useEffect } from 'https://lsong.org/scripts/react/index.js';
import { openweathermap } from './openweathermap.js';

const appid = 'f59d0e42623911baec74ffbda1a8c7e7';
const api = openweathermap({ appid });

const WeatherItem = ({ weather: data }) => {
  const { main, visibility, weather, wind, dt_txt = 'Now' } = data || {};
  const { temp, temp_min, temp_max, feels_like, humidity, pressure } = main;
  const [w1] = weather;
  const icon = `http://openweathermap.org/img/w/${w1.icon}.png`;

  return h('div', { className: "weather-item card" }, [
    dt_txt && h('h3', null, dt_txt),
    h('div', { className: '' }, [
      h('img', { src: icon, alt: w1.description }),
      h('span', null, `${w1.description}`),
    ]),
    h('div', null, [
      h('h3', { className: "temp" }, `${temp.toFixed(1)}°C`),
      h('small', null, `${temp_min.toFixed(1)}°C ~ ${temp_max.toFixed(1)}°C`),
    ]),
    h('ul', { className: "today-detail" }, [
      h('li', null, `Feels like: ${feels_like.toFixed(1)}°C`),
      h('li', null, `Humidity: ${humidity}%`),
      h('li', null, `Pressure: ${pressure}hPa`),
      h('li', null, `Visibility: ${visibility}m`),
      h('li', null, [
        h('span', null, `Wind: ${wind.speed.toFixed(1)} m/s`),
        h('span', { className: 'wind-direction', style: `transform: rotate(${wind.deg}deg);` }, '↑'),
        wind.gust && h('span', null, ` Gust: ${wind.gust.toFixed(1)} m/s`),
      ]),
    ]),
  ]);
};

const groupByDay = (list = []) => {
  return list.reduce((group, item) => {
    const [date] = item.dt_txt.split(' ');
    group[date] = group[date] || [];
    group[date].push({ ...item, dt_txt: item.dt_txt.split(' ')[1] });
    return group;
  }, {});
};

const WeatherDay = ({ date, items }) => {
  return h('div', { className: "weather-day" }, [
    h('h2', null, new Date(date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })),
    h('div', { className: 'weather-day-items scrollbar-hide' }, items.map(item => h(WeatherItem, { key: item.dt_txt, weather: item })))
  ]);
};

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  return h('form', { onSubmit: handleSubmit, className: 'search-bar input-group width-full' }, [
    h('input', {
      className: 'input',
      type: 'search',
      value: query,
      onChange: (e) => setQuery(e.target.value),
      placeholder: 'Enter city name...'
    }),
    h('button', { type: 'submit', className: 'button' }, 'Search')
  ]);
};

const App = () => {
  const [city, setCity] = useState('beijing');
  const [current, setCurrentWeather] = useState();
  const [forecast, setForecastWeather] = useState();
  const [error, setError] = useState(null);

  const fetchWeatherData = async (city) => {
    try {
      setError(null);
      const [currentData, forecastData] = await Promise.all([
        api.current(city),
        api.forecast(city)
      ]);
      setCurrentWeather(currentData);
      setForecastWeather(forecastData);
    } catch (err) {
      setError('Failed to fetch weather data. Please try again.');
      console.error('Error fetching weather data:', err);
    }
  };

  useEffect(() => {
    fetchWeatherData(city);
  }, [city]);

  const handleSearch = (query) => {
    setCity(query);
  };

  const { name = 'Weather' } = current || {};
  const { city: { country, coord } = {}, list } = forecast || {};
  const group = groupByDay(list);

  return h('div', { className: 'weather-app' }, [
    h('h1', null, 'Weather'),
    h(SearchBar, { onSearch: handleSearch }),
    error && h('p', { className: 'error' }, error),
    current && [
      h('h2', null, [
        h(coord ? 'a' : 'span', { href: coord && `https://maps.lsong.org/?lat=${coord.lat}&lon=${coord.lon}` }, name),
        country && h('small', {}, ` (${country})`),
      ]),
      h(WeatherItem, { weather: current }),
    ],
    forecast && h('div', { className: 'forecast' },
      Object.entries(group).map(([date, items]) => h(WeatherDay, { key: date, date, items }))
    ),
  ]);
};

ready(() => {
  const app = document.getElementById('app');
  render(h(App), app);
});