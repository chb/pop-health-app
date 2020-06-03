export default {
    startYear: +(process.env.REACT_APP_START_YEAR || new Date().getFullYear() - 1)
};
