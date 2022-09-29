const modules = require("../services/modules");
const log4js = require('log4js');
log4js.configure({
    appenders: { service: { type: 'file', filename: './../service.log' } },
    categories: { default: { appenders: ['service'], level: 'error' } },
});

const logger = log4js.getLogger('service');

const home = async (req, res) => {    
    res.status(200).json('grafana import tool is running!');
};

const importToGrafana = async (req, res) => {
    try {
        const result = await modules.grafanaImportService.getGrafanaImport(req);
        console.log(result);
        res.status(200).json(result);
    } catch (err) {
        console.log(err);
        logger.error(JSON.stringify(err) + " CONTROLLER");
        return res.status(500).json(err);
    }
};

module.exports = {
    home,
    importToGrafana
};
