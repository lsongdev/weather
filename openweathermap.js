
export const openweathermap = ({ appid, units = 'metric' } = {}) => {
  const api = `https://api.openweathermap.org/data/2.5`;
  return {
    /**
     * https://openweathermap.org/current
     * @param {*} q 
     */
    async current(q) {
      const res = await fetch(`${api}/weather?q=${q}&appid=${appid}&units=${units}`);
      return await res.json();
    },
    async forecast(q) {
      const res = await fetch(`${api}/forecast?q=${q}&appid=${appid}&units=${units}`);
      return await res.json();
    },
    async forecast_daily(q) {
      const res = await fetch(`${api}/forecast/daily?q=${q}&appid=${appid}&units=${units}`);
      return await res.json();
    },
  };
};