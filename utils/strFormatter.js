
const cleanMetricsPrefixStr = (str) => {
    if(/-/.test(str) === true)
        return str.replace(/-/g,"_");
    else
        return str;
};

module.exports = {
    cleanMetricsPrefixStr,
}