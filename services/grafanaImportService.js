const https = require('https');
var axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const dotenv = require("dotenv"); 
dotenv.config();

const {high_level_application_metrics} = require('../dashboards/high_level_application_metrics');
const {node_service_level_metrics_dashboard} = require('../dashboards/node_service_level_metrics_dashboard');
const {nodejs_application_dashboard} = require('../dashboards/nodejs_application_dashboard');        
const {nodejs_request_flow_dashboard} = require('../dashboards/nodejs_request_flow_dashboard');    

const grafanaService = axios.create({
    baseURL: process.env.GRAFANA_URL,
    headers: {
        'Accept': 'application/json',
        Authorization: `Bearer ${process.env.GRAFANA_API_KEY}`
    },    
    httpsAgent: new https.Agent({ rejectUnauthorized: false })
});


const getGrafanaImport = async (req, res) => {
                             
    try{             
        const prometheusInstanceMsg = await validatePrometheusInstance();
        if(prometheusInstanceMsg === 'prometheus instance created'){
            const folderUid = await validateFolder();

            if(folderUid !== null)
                return await validateDashboards(folderUid);
            else   
                return "FOLDER_ERROR: error while creating or searching for folder";
        }else
            return prometheusInstanceMsg;        
    } catch (error) {
        return null;
    }         
};

async function validatePrometheusInstance(){
    try{
        //const getAllDataSources = await grafanaService.get('/api/datasources');        
        const prometheusInstance = await grafanaService.get(`/api/datasources/name/${process.env.DATASOURCE_NAME}`);                        
        if(prometheusInstance.status === 200 && prometheusInstance.statusText === 'OK')
            return "prometheus instance created";
        else
            return "PROMETHEUS_INSTANCE_ERROR: error while searching for instance";
    }catch(error){
        try{
            const createDataSource = await grafanaService.post('/api/datasources',
                    {
                        "name":process.env.DATASOURCE_NAME,
                        "type":"prometheus",
                        "url":process.env.DATASOURCE_URL,
                        "access":"proxy",
                        "basicAuth":false
                    });  
            if(createDataSource.status === 200 && createDataSource.statusText === 'OK')
                return "prometheus instance created";
            else
                return "PROMETHEUS_INSTANCE_ERROR: error while creating datasource";
        }catch(error){
            return error.response.data;
        }        
    }       
};

async function validateFolder(){
    const getAllFolders = await grafanaService.get('/api/folders');  
    const expectedfolderTitle = "NS " + process.env.NAMESPACE + " Overview";
        
    var isFolderInGrafana = false; 
    var folderUid = null;
    for(var i = 0; i < getAllFolders.data.length; i++){
        var folder = getAllFolders.data[i];
        if(folder.title === expectedfolderTitle){
            isFolderInGrafana = true;
            folderUid = folder.uid;
            break;
        }
    }

    if(!isFolderInGrafana){
        folderUid = uuidv4();
        try{
            const createFolder = await grafanaService.post('/api/folders',
            {
                "uid": folderUid,
                "title": "NS " + process.env.NAMESPACE + " Overview"
            });              
        }catch(error){
            folderUid = null;
        }                
    }
    return folderUid;
};

async function validateDashboards(folderUid){
    try{
        high_level_application_metrics.folderUid = folderUid;
        node_service_level_metrics_dashboard.folderUid = folderUid;
        nodejs_application_dashboard.folderUid = folderUid;
        nodejs_request_flow_dashboard.folderUid = folderUid;
                     
        const createHLAMdb = await grafanaService.post('/api/dashboards/db',high_level_application_metrics);                
        const createNSLMdb = await grafanaService.post('/api/dashboards/db',node_service_level_metrics_dashboard);                
        const createNAdb = await grafanaService.post('/api/dashboards/db',nodejs_application_dashboard);                
        const createNRFdb = await grafanaService.post('/api/dashboards/db',nodejs_request_flow_dashboard);                
    
        if(createHLAMdb.status === 200 && createHLAMdb.statusText === 'OK' &&
            createNSLMdb.status === 200 && createNSLMdb.statusText === 'OK' &&
            createNAdb.status === 200 && createNAdb.statusText === 'OK' &&
            createNRFdb.status === 200 && createNRFdb.statusText === 'OK')
            return "added prometheus instance,folder and dashboards";
        else
            return "DASHBOARD_ERROR: something went wrong while creating dashboards";
    }catch(error){
        return error.response.data;
    }
};

module.exports = {
    getGrafanaImport,    
};
