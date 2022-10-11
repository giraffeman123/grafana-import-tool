
const cleanMetricsPrefixStr = (str) => {
    if(/-/.test(str) === true)
        return str.replace(/-/,"_");
    else
        return str;
};

module.exports = {
    cleanMetricsPrefixStr,
}