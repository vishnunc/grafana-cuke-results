var express = require('express');
var bodyParser = require('body-parser');
var _ = require('lodash');
var mongo = require('mongodb');
var ObjectID = require('bson-objectid');
var MongoClient = require('mongodb').MongoClient;
var filtertags=require('./filtertags');
//var url = "mongodb://localhost:27017/cuke";
//var db="cuke";
//var collection="debug";

var url = "mongodb://10.1.70.74:27017/Automation_Results";
var collection="Regression_Results";
var api_collection="API_Results";
var app = express();

var fs = require('fs'),
    xml2js = require('xml2js');
 
/*var parser = new xml2js.Parser();
fs.readFile('/Users/vishnu/Downloads/EBS-BD_GetOrderInfo/EBS-BD-GetOrderInfo-readyapi-project.xml', function(err, data) {
    parser.parseString(data, function (err, result) {
        console.dir(result['con:soapui-project']['con:testSuite'][0]);
        console.log('Done');
    });
});*/

app.use(bodyParser.json());



var annotation = {
  name : "annotation name",
  enabled: true,
  datasource: "generic datasource",
  showLine: true,
}

var annotations = [
  { annotation: annotation, "title": "dd", "time": 1450754160000, text: "teeext", tags: "taaags" },
  { annotation: annotation, "title": "ee", "time": 1450754160000, text: "teeext", tags: "taaags" },
  { annotation: annotation, "title": "ff ", "time": 1450754160000, text: "teeext", tags: "taaags" }
];

var tagKeys = [
  {"type":"string","text":"Country"},
  {"type":"string","text":"Country"},
  {"type":"string","text":"Country"}
];

var countryTagValues = [
  {'text': 'SE'},
  {'text': 'DE'},
  {'text': 'US'},
  {'text': 'US'}
];




  
function setCORSHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST");
  res.setHeader("Access-Control-Allow-Headers", "accept, content-type");  
}



app.all('/', function(req, res) {
  setCORSHeaders(res);
  res.send('I have a quest for you!');
  res.end();
});

app.all('/search', function(req, res){
  setCORSHeaders(res);
  console.log(req.body)
  if(req.body.target==''){
    var result = ["PassHistory","FailHistory","RunFailHistory","RunPassHistory","Runs","FeaturesRun","RecentFeaturesRun","RecentRunMetaData","Features","ScenariosRun","StepsRun","StepDetails","MetaData","TestData","ReportTable","FeaturesBrowserSummaryTable","FailureTable","APIPassSuiteHistory","APIFailSuiteHistory","APITestSuiteHistoryTable","APITestCaseHistory","APITestSteps"];
    res.json(result);
    res.end();
  }
  else{
    let tsResult = [];
    tsResult.push(getFilterValues(req.body.target));
    Promise.all(tsResult).
    then((result)=>{
      console.log(result)
      res.json(_.uniqBy(result[0].values,'text'));
      res.end();
      });
  }
  
  
});

app.all('/annotations', function(req, res) {
  setCORSHeaders(res);
  console.log(req.url);
  console.log(req.body);

  res.json(annotations);
  res.end();
});
/*app.all('/img',function(req,res){
	setCORSHeaders(res);
	var binaryBuff = Buffer.from("R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=",'base64');
	res.write(binaryBuff,'binary');
    res.end(null, 'binary');
});*/
app.all('/query', function(req, res, next){
  setCORSHeaders(res);
  console.log(req.url);
  console.log(req.body);
  
  let tsResult = [];
  req.body.targets.forEach(function(target){

      tsResult.push(getData(req.body,target.target));
  		/*if(req.body.adhocFilters.length>0){
  			tsResult.push(getData(req.body,target.target));
  			console.log("in here");
  		}
  		else{
  			tsResult.push(getData(null,target.target));
  		}*/
  		
  });
  Promise.all(tsResult).
  then((result)=>{
  	res.json(result);
  	res.end();
  });
  /*_.each(req.body.targets, async function(target) {
  	console.log(target.target);
  	var data = await getData(target.type,target.target);
  	
  	tsResult.push(data);
    
  });
  Promise.all(tsResult).then((result) => {
  	console.log(tsResult);
  	res.json(result);
  	res.end();
  });*/
  
});


async function getData(body,target){
	switch (target){
		case "PassHistory":
			return getFeaturesData(body,target);
			break;
		case "FailHistory":
			return getFeaturesData(body,target);
			break;
		case "RunPassHistory":
			return getSummary(body,target);
			break;
		case "RunFailHistory":
			return getSummary(body,target);
			break;
		case "FeaturesRun":
			return getFeaturesRunTable(body,target);
			break;
		case "RecentFeaturesRun":
			return getRecentFeaturesRunTable(body,target);
			break;
		case "Features":
			return getFeaturesTable(body,target);
			break;
		case "ScenariosRun":
			return getScenariosRunTable(body,target);
			break;
		case "StepsRun":
			return getStepsRunTable(body,target);
			break;
		case "StepDetails":
			return getStepDetailsTable(body,target);
			break;
		case "MetaData":
			return getMetaData(body,target);
			break;
		case "TestData":
			return getTestData(body,target);
			break;
		case "Tags":
			return getTags(body,target);
			break;
		case "Runs":
			return getRunData(body,target);
			break;
		case "ReportTable":
			return getReportTable(body,target);
			break;
		case "FeaturesBrowserSummaryTable":
			return getFeaturesBrowserSummaryTable(body,target);
			break;
		case "FailureTable":
			return getFailuresTable(body,target);
			break;
		case "APIFailSuiteHistory":
			return getAPITestSuiteHistory(body,target);
			break;
		case "APIPassSuiteHistory":
			return getAPITestSuiteHistory(body,target);
			break;
		case "RecentRunMetaData":
			return getRecentRunMetaData(body,target);
			break;
		case "APITestSuiteHistoryTable":
			return getAPITestSuiteHistoryTable(body,target);
			break;
		case "APITestCaseHistory":
			return getAPITestCaseHistory(body,target);
			break;
		case "APITestSteps":
			return getAPITestSteps(body,target);
			break; 

	}
}


function getFailuresTable1(body,target){

  return new Promise(function(resolve,reject){
    
     
     MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db();
        var filter = [{$group:{_id:"$result.elements.steps.result.error_message","runId":{"$push":"$_id"},"metadata":{"$push":"$metadata"},"tags":{"$push":"$result.tags.name"},"feature":{"$push":"$result.uri"}}},{"$unwind":"$_id"},{"$unwind":"$_id"},{"$unwind":"$metadata"},{"$unwind":"$tags"},{"$unwind":"$tags"},{"$unwind":"$feature"},{"$unwind":"$feature"},{"$limit":100}]
        
        dbo.collection(collection).aggregate(filter).toArray(function(err, data){
            if (err) throw err;
            
            var c = 0;
            var run = {"target": "FailureTable"};
            datapoints=[];
            
            data.forEach(function(record){
                var run_datapoints = [];
              	if(record._id[0]!=null){
              		run_datapoints.push(record.runId);
              		run_datapoints.push(record.feature);
	            	run_datapoints.push(record._id[0].slice(30,150));
	            	run_datapoints.push(record.metadata.driverType);
	            	run_datapoints.push(record.tags.join(","));
	            	datapoints.push(run_datapoints);
              	}
          		
          		
            });

            /*datapoints = _.uniqBy(datapoints,function(e){
            	return e[1];
            })*/
            
            var table =
            {
              columns: [{text: 'RunID', type: 'string'},{text: 'Feature', type: 'string'},{text: 'Error', type: 'string'}, {text: 'Driver', type: 'string'}, {text: 'Tags', type: 'string'}],
              rows: datapoints,
              "type":"table"
            };
            
            resolve(table);
          //resolve(featuresData);
        });
    });
  });

}

function getFeaturesData(body,target){
    return new Promise(function(resolve,reject){
    var featuresData = [];
    var filters=[];
    var tags=[];
    var limit=500;
     body.adhocFilters.forEach(function(filter){
        
        if(filter.key=="Tags"){
          //tags.push('tag.name'+(filter.operator=='!='?'!=':'==')+'"'+filter.value+'"');
          fkey=`result.elements.tags.name`;
          foperator=(filter.operator=='!='?'$ne':'$eq');
          var obj={};
          var opobj={};
          opobj[foperator]=filter.value;
          obj[fkey]=opobj
          filters.push(obj);
        }
        else if(filter.key=="Status"){
          //tags.push('tag.name'+(filter.operator=='!='?'!=':'==')+'"'+filter.value+'"');
          fkey=`result.elements.steps.result.status`;
          foperator=(filter.operator=='!='?'$ne':'$eq');
          var obj={};
          var opobj={};
          opobj[foperator]=filter.value.toLowerCase();
          obj[fkey]=opobj
          filters.push(obj);
        }
        else if(filter.key=="Count"){

            limit=parseInt(filter.value);
            console.log(limit)
        }
        else{
          fkey=`metadata.${filter.key}`;
          foperator=(filter.operator=='!='?'$ne':'$eq');
          var obj={};
          var opobj={};
          opobj[foperator]=filter.value;
          obj[fkey]=opobj
          filters.push(obj);
        }

     });
     
     MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db();
        var fromTime = ObjectID.createFromTime(new Date(body.range.from).getTime()/1000);
        var toTime = ObjectID.createFromTime(new Date(body.range.to).getTime()/1000);
        filter={}
        if(filters.length==0){
          filter={_id:{"$lt":toTime,"$gt":fromTime}}
        }
        else{
          filter={_id:{"$lt":toTime,"$gt":fromTime},$and:filters}
        }
        dbo.collection(collection).find(filter).sort({$natural:-1}).limit(limit).toArray(function(err, data){
            if (err) throw err;
            // result = data;
            var c = 0;
            var pass = {"target": "PassHistory"};
            var fail = {"target": "FailHistory"};
            var pass_datapoints = [];
            var fail_datapoints = [];
            data.forEach(function(record){
                
                var passCount = 0;
                var failCount = 0;
                record.result.forEach(function(feature){
                    // console.log(feature, c)
                    /*var filterFail=false;
                    feature.tags.forEach(function(tag){
                      tags.forEach(function(fil){
                        if(!eval(fil)){
                        filterFail=true;
                      }
                      }) 
                      
                    })
                    if(filterFail){
                      return;
                    }*/
                    var feature_status = "passed"
                    feature.elements.forEach(function(element){
                        element.steps.forEach(function(step){
                            if(step.result.status != "passed"){
                                feature_status = "failed";
                            }
                        });
                    });
                    if(feature_status != "passed"){
                        failCount += 1;
                    }else{
                        passCount += 1;
                    } 
                });
                pass_datapoints.push([passCount,Math.floor(new Date(record._id.getTimestamp()) )]);
                fail_datapoints.push([failCount,Math.floor(new Date(record._id.getTimestamp()) )]);
                
            });
            pass['datapoints'] = _.reverse(pass_datapoints);
            fail['datapoints'] = _.reverse(fail_datapoints);
            // pass['datapoints'] = [];
            // fail['datapoints'] = [];
            // console.log("records count: "+c);
            featuresData.push(pass);
            featuresData.push(fail);
            
            // return featuresData;
            if(target=="PassHistory"){
		     	resolve(featuresData[0]);
		     }
		     else{
		     	resolve(featuresData[1]);
		     }
        });
    });
  });
    
}

function getFeaturesBrowserSummaryTable(body,target){

    // format
    // {"target":"RecentFeatureRun","datapoints":[["Xyz feature name","Pass",30],
    // ["efg feature name","Fail",30]]}
    return new Promise(function(resolve, reject){
    var filters=[];
    var tags=[];
    var limit=500;
     body.adhocFilters.forEach(function(filter){
        
        if(filter.key=="Tags"){
          //tags.push('tag.name'+(filter.operator=='!='?'!=':'==')+'"'+filter.value+'"');
          fkey=`result.elements.tags.name`;
          foperator=(filter.operator=='!='?'$ne':'$eq');
          var obj={};
          var opobj={};
          opobj[foperator]=filter.value;
          obj[fkey]=opobj
          filters.push(obj);
        }
        else if(filter.key=="Status"){
          //tags.push('tag.name'+(filter.operator=='!='?'!=':'==')+'"'+filter.value+'"');
          fkey=`result.elements.steps.result.status`;
          
          foperator=(filter.operator=='!='?'$ne':'$eq');
          var obj={};
          var opobj={};
          opobj[foperator]=filter.value.toLowerCase();
          obj[fkey]=opobj
          filters.push(obj);
        }
        else if(filter.key=="Count"){

            limit=parseInt(filter.value);
            
        }
        else{
          fkey=`metadata.${filter.key}`;
          foperator=(filter.operator=='!='?'$ne':'$eq');
          var obj={};
          var opobj={};
          opobj[foperator]=filter.value;
          obj[fkey]=opobj
          filters.push(obj);
        }

     });
     
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db();
        var fromTime = ObjectID.createFromTime(new Date(body.range.from).getTime()/1000);
        var toTime = ObjectID.createFromTime(new Date(body.range.to).getTime()/1000);
        filter={}
        if(filters.length==0){
          filter={_id:{"$lt":toTime,"$gt":fromTime}}
        }
        else{
          filter={_id:{"$lt":toTime,"$gt":fromTime},$and:filters}
        }
        //.limit(1).sort({$natural:-1})
        dbo.collection(collection).find(filter).sort({$natural:-1}).limit(limit).toArray(function(err, data){
            // console.log(data);
            var mostRecentRecord = {"target": "FeaturesBrowserSummaryTable"};
            var datapoints = [];
            var recpoints = {};
            data.forEach(function(record){
                
                record.result.forEach(function(feature){
                    var featureData = []
                    var duration = 0;
                    var chromeBrowserPass=0;
                    var firefoxBrowserPass=0;
                    var ieBrowserPass=0;
                    var edgeBrowserPass=0;
                    var iosBrowserPass=0;
                    var androidBrowserPass=0;
                    var chromeBrowserFail=0;
                    var firefoxBrowserFail=0;
                    var ieBrowserFail=0;
                    var edgeBrowserFail=0;
                    var iosBrowserFail=0;
                    var androidBrowserFail=0;
                    var feature_status = "passed";
                    //featureData.push(feature.uri);
                    feature.elements.forEach(function(element){
                        element.steps.forEach(function(step){
                            
                            if(step.result.status != "passed"){
                                feature_status = "failed"
                            }else{
                                feature_status = "passed"
                            }
                        });
                    });
                    if(feature_status == "passed"){
                        switch (record.metadata.Browser!=null?record.metadata.Browser.toLowerCase():record.metadata.mobilePlatformName.toLowerCase()){
                          case "chrome":
                              chromeBrowserPass+=1;
                              break;
                          case "firefox":
                              firefoxBrowserPass+=1;
                              break;
                          case "iexplorer":
                              ieBrowserPass+=1;
                              break;
                          case "edge":
                              edgeBrowserPass+=1;
                              break;
                          case "ios":
                              iosBrowserPass+=1;
                              break;
                          case "android":
                              androidBrowserPass+=1;
                              break;
                        }

                    }else{
                        switch (record.metadata.Browser!=null?record.metadata.Browser.toLowerCase():record.metadata.mobilePlatformName.toLowerCase()){
                          case "chrome":
                              chromeBrowserFail+=1;
                              break;
                          case "firefox":
                              firefoxBrowserFail+=1;
                              break;
                          case "iexplorer":
                              ieBrowserFail+=1;
                              break;
                          case "edge":
                              edgeBrowserFail+=1;
                              break;
                          case "ios":
                              iosBrowserFail+=1;
                              break;
                          case "android":
                              androidBrowserFail+=1;
                              break;
                        }
                    }
                    featureData.push(chromeBrowserPass-chromeBrowserFail);
                    featureData.push(firefoxBrowserPass-firefoxBrowserFail);
                    featureData.push(ieBrowserPass-ieBrowserFail);
                    featureData.push(edgeBrowserPass-edgeBrowserFail);
                    featureData.push(iosBrowserPass-iosBrowserFail);
                    featureData.push(androidBrowserPass-androidBrowserFail);
                    if(recpoints[feature.uri]===undefined){
                          recpoints[feature.uri]=featureData;
                    }
                    else
                    {
                      recpoints[feature.uri]=  recpoints[feature.uri].map(function(x, index){ //here x = a[index]
                       return featureData[index] + x 
                      });
 
                    }
                    
                });
                
            });
            Object.keys(recpoints).forEach(function(points){
              recpoints[points].unshift(points)
              datapoints.push(recpoints[points]);
            })
           
            var table =
            {
              columns: [{text: 'Feature', type: 'string'}, {text: 'Chrome', type: 'number'}, {text: 'Firefox', type: 'number'},{text: 'IE', type: 'number'},{text: 'Edge', type: 'number'},{text: 'iOS', type: 'number'},{text: 'Android', type: 'number'}],
              rows: datapoints,
              "type":"table"
            };
        
            resolve(table);
        });
    });
    });
}

function getRunData(body,target){
    return new Promise(function(resolve,reject){
    var featuresData = [];
    var filters=[];
    var tags=[];
    var limit=500
     body.adhocFilters.forEach(function(filter){
        
        if(filter.key=="Tags"){
          //tags.push('tag.name'+(filter.operator=='!='?'!=':'==')+'"'+filter.value+'"');
          fkey=`result.elements.tags.name`;
          foperator=(filter.operator=='!='?'$ne':'$eq');
          var obj={};
          var opobj={};
          opobj[foperator]=filter.value;
          obj[fkey]=opobj
          filters.push(obj);
          tags.push(filter.value);
        }
        else if(filter.key=="Status"){
          //tags.push('tag.name'+(filter.operator=='!='?'!=':'==')+'"'+filter.value+'"');
          fkey=`result.elements.steps.result.status`;
          foperator=(filter.operator=='!='?'$ne':'$eq');
          var obj={};
          var opobj={};
          opobj[foperator]=filter.value.toLowerCase();
          obj[fkey]=opobj
          filters.push(obj);
        }
        else if(filter.key=="Count"){
            limit=parseInt(filter.value)+1;
            
        }
        else{
          fkey=`metadata.${filter.key}`;
          foperator=(filter.operator=='!='?'$ne':'$eq');
          var obj={};
          var opobj={};
          opobj[foperator]=filter.value;
          obj[fkey]=opobj
          filters.push(obj);
        }

     });
     
     MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db();
        var fromTime = ObjectID.createFromTime(new Date(body.range.from).getTime()/1000);
        var toTime = ObjectID.createFromTime(new Date(body.range.to).getTime()/1000);
        filter={}
        if(filters.length==0){
          filter={_id:{"$lt":toTime,"$gt":fromTime}}
        }
        else{
          filter={_id:{"$lt":toTime,"$gt":fromTime},$and:filters}
        }
        dbo.collection(collection).find(filter).sort({$natural:-1}).limit(limit).toArray(function(err, data){
            if (err) throw err;
            // result = data;
            var c = 0;
            var run = {"target": "RunHistory"};
            //var fail = {"target": "FailHistory"};
            var pass_datapoints = [];
            //var fail_datapoints = [];
            var run_datapoints = [];
            data.forEach(function(record){
                var duration = 0;
                var passCount = 0;
                var failCount = 0;
                var filterFail=false;
                var error=[];
                var message=[];
                record.result.forEach(function(feature){
                    
                    var feature_status = "passed"
                    feature.elements.forEach(function(element){
                        element.steps.forEach(function(step){
                            duration = duration + step.result.duration;
                            if(step.result.status != "passed"){
                                feature_status = "failed";
                                if(step.result.status=="failed" && step.result.error_message.indexOf("APP:")!=-1){
                                  error.push(step.result.error_message.substring(step.result.error_message.indexOf("APP:")+4,step.result.error_message.indexOf(",")));
                                  message.push(step.result.error_message.substring(0,step.result.error_message.indexOf("APP:")));
                                }
                                
                            }
                        });
                    });
                    if(feature_status != "passed"){
                        failCount += 1;
                    }else{
                        passCount += 1;
                    } 
                });
                  
                 if(filterFail){
                      return;
                  }
                environment=[]
                if(record.metadata!=null){
                Object.keys(record.metadata).forEach(function(key){

                    environment.push(key+' : '+record.metadata[key])

                });
                }
                run_datapoints.push([record._id,tags[0].replace("@","")+"_"+new Date(record._id.getTimestamp()).toISOString().slice(0,16).replace(":","")+"_"+record.metadata.Environment+"_"+record.metadata.locale,failCount>0?0:1,Math.floor(new Date(record._id.getTimestamp()-duration/1000000) ),Math.floor(new Date(record._id.getTimestamp()) ),Math.floor(new Date(record._id.getTimestamp())-new Date(record._id.getTimestamp()-duration/1000000) ),failCount,passCount,error.join(","),message.join(","),record.metadata.Environment,(record.metadata.Browser!=null?record.metadata.Browser:record.metadata.mobilePlatformName)])
            });
           
            run['datapoints']=run_datapoints
            featuresData.push(run);
            // return featuresData;
          var table =
        {
          columns: [{text: 'Run ID', type: 'string'},{text: 'Run Name', type: 'string'}, {text: 'Status', type: 'number'}, {text: 'Started', type: 'number'},{text: 'Ended', type: 'number'},{text: 'TotalTime', type: 'number'},{text: 'Failed', type:'string'},{text: 'Passed', type:'string'},{text: 'Failed App', type: 'string'},{text: 'Reason', type: 'string'},{text: 'Env', type: 'string'},{text: 'Browser', type:'string'}],
          rows: run_datapoints,
          "type":"table"
        };
        
            resolve(table);
          //resolve(featuresData);
        });
    });
  });
    
}



function getRecentRunMetaData(body,target){

    // format
    // {"target":"RecentFeatureRun","datapoints":[["Xyz feature name","Pass",30],
    // ["efg feature name","Fail",30]]}
    return new Promise(function(resolve, reject){
    var featuresData = [];
    var filters=[];
    var tags=[];
    var limit=500
     body.adhocFilters.forEach(function(filter){
        
        if(filter.key=="Tags"){
          //tags.push('tag.name'+(filter.operator=='!='?'!=':'==')+'"'+filter.value+'"');
          fkey=`result.elements.tags.name`;
          foperator=(filter.operator=='!='?'$ne':'$eq');
          var obj={};
          var opobj={};
          opobj[foperator]=filter.value;
          obj[fkey]=opobj
          filters.push(obj);
          tags.push(filter.value);
        }
        else if(filter.key=="Status"){
          //tags.push('tag.name'+(filter.operator=='!='?'!=':'==')+'"'+filter.value+'"');
          fkey=`result.elements.steps.result.status`;
          foperator=(filter.operator=='!='?'$ne':'$eq');
          var obj={};
          var opobj={};
          opobj[foperator]=filter.value.toLowerCase();
          obj[fkey]=opobj
          filters.push(obj);
        }
        else if(filter.key=="Count"){
            limit=parseInt(filter.value)+1;
            
        }
        else{
          fkey=`metadata.${filter.key}`;
          foperator=(filter.operator=='!='?'$ne':'$eq');
          var obj={};
          var opobj={};
          opobj[foperator]=filter.value;
          obj[fkey]=opobj
          filters.push(obj);
        }

     });
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db();
        var fromTime = ObjectID.createFromTime(new Date(body.range.from).getTime()/1000);
        var toTime = ObjectID.createFromTime(new Date(body.range.to).getTime()/1000);
        filter={}
        if(filters.length==0){
          filter={_id:{"$lt":toTime,"$gt":fromTime}}
        }
        else{
          filter={_id:{"$lt":toTime,"$gt":fromTime},$and:filters}
        }
        dbo.collection(collection).find(filter).sort({$natural:-1}).limit(1).toArray(function(err, data){
            // console.log(data);
            var mostRecentRecord = {"target": "FeatureRun"};
            var datapoints = [];
            var duration=0;
            data.forEach(function(record){
                
                record.result.forEach(function(feature){
                    var featureData = []
                    
                    var feature_status = "passed";
                    var options = { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' };
                    featureData.push();
                    
                    feature.elements.forEach(function(element){
                        element.steps.forEach(function(step){
                            duration = duration + step.result.duration/1000000000.0;
                            
                        });
                    });
                    
                    
                    
                });
                  datapoints.push(new Date(record._id.getTimestamp()).toLocaleString("en-US"));
                  datapoints.push(record.metadata.Browser!=null?record.metadata.Browser:record.metadata.mobilePlatformName);
                  datapoints.push(record.metadata.locale);
                  datapoints.push(record.metadata.Environment);
                  datapoints.push(duration);
            });
            mostRecentRecord['datapoints'] = datapoints;
            
            var table =
        {
          columns: [{text: 'Execution Time', type: 'string'},{text: 'Browser', type: 'string'}, {text: 'Locale', type: 'string'},{text: 'Environment', type: 'string'}, {text: 'Duration', type: 'number'}],
          rows: [datapoints],
          "type":"table"
        };
        
            resolve(table);
        });
    });
    });
}

function getRecentFeaturesRunTable(body,target){

    // format
    // {"target":"RecentFeatureRun","datapoints":[["Xyz feature name","Pass",30],
    // ["efg feature name","Fail",30]]}
    return new Promise(function(resolve, reject){
    var featuresData = [];
    var filters=[];
    var tags=[];
    var limit=500
     body.adhocFilters.forEach(function(filter){
        
        if(filter.key=="Tags"){
          //tags.push('tag.name'+(filter.operator=='!='?'!=':'==')+'"'+filter.value+'"');
          fkey=`result.elements.tags.name`;
          foperator=(filter.operator=='!='?'$ne':'$eq');
          var obj={};
          var opobj={};
          opobj[foperator]=filter.value;
          obj[fkey]=opobj
          filters.push(obj);
          tags.push(filter.value);
        }
        else if(filter.key=="Status"){
          //tags.push('tag.name'+(filter.operator=='!='?'!=':'==')+'"'+filter.value+'"');
          fkey=`result.elements.steps.result.status`;
          foperator=(filter.operator=='!='?'$ne':'$eq');
          var obj={};
          var opobj={};
          opobj[foperator]=filter.value.toLowerCase();
          obj[fkey]=opobj
          filters.push(obj);
        }
        else if(filter.key=="Count"){
            limit=parseInt(filter.value)+1;
            
        }
        else{
          fkey=`metadata.${filter.key}`;
          foperator=(filter.operator=='!='?'$ne':'$eq');
          var obj={};
          var opobj={};
          opobj[foperator]=filter.value;
          obj[fkey]=opobj
          filters.push(obj);
        }

     });
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db();
        var fromTime = ObjectID.createFromTime(new Date(body.range.from).getTime()/1000);
        var toTime = ObjectID.createFromTime(new Date(body.range.to).getTime()/1000);
        filter={}
        if(filters.length==0){
          filter={_id:{"$lt":toTime,"$gt":fromTime}}
        }
        else{
          filter={_id:{"$lt":toTime,"$gt":fromTime},$and:filters}
        }
        dbo.collection(collection).find(filter).sort({$natural:-1}).limit(1).toArray(function(err, data){
            // console.log(data);
            var mostRecentRecord = {"target": "FeatureRun"};
            var datapoints = [];
            data.forEach(function(record){
                
                record.result.forEach(function(feature){
                    var featureData = []
                    var duration = 0;
                    var feature_status = "passed";
                    featureData.push(record._id);
                    featureData.push(feature.uri);
                    featureData.push(feature.name);
                    feature.elements.forEach(function(element){
                        element.steps.forEach(function(step){
                            duration = duration + step.result.duration/1000000000.0;
                            if(step.result.status != "passed"){
                                feature_status = "failed"
                            }else{
                                feature_status = "passed"
                            }
                        });
                    });
                    if(feature_status == "passed"){
                        featureData.push(1);
                    }else{
                        featureData.push(0);
                    }
                    featureData.push(duration);
               
                    datapoints.push(featureData);
                });
                
            });
            mostRecentRecord['datapoints'] = datapoints;
            
            var table =
        {
          columns: [{text: 'RunID', type: 'string'},{text: 'Feature', type: 'string'}, {text: 'Description', type: 'string'},{text: 'Status', type: 'number'}, {text: 'Duration', type: 'number'}],
          rows: datapoints,
          "type":"table"
        };
        
            resolve(table);
        });
    });
    });
}

function getFailuresTable(body,target){

    // format
    // {"target":"RecentFeatureRun","datapoints":[["Xyz feature name","Pass",30],
    // ["efg feature name","Fail",30]]}
    return new Promise(function(resolve, reject){
    var featuresData = [];
    var filters=[];
    var tags=[];
    var limit=500

    filters.push({"result.elements.steps.result.status":{"$eq":"failed"}})
     body.adhocFilters.forEach(function(filter){
        
        if(filter.key=="Tags"){
          //tags.push('tag.name'+(filter.operator=='!='?'!=':'==')+'"'+filter.value+'"');
          fkey=`result.elements.tags.name`;
          foperator=(filter.operator=='!='?'$ne':'$eq');
          var obj={};
          var opobj={};
          opobj[foperator]=filter.value;
          obj[fkey]=opobj
          filters.push(obj);
          tags.push(filter.value);
        }
        else if(filter.key=="Status"){
          //tags.push('tag.name'+(filter.operator=='!='?'!=':'==')+'"'+filter.value+'"');
          fkey=`result.elements.steps.result.status`;
          foperator=(filter.operator=='!='?'$ne':'$eq');
          var obj={};
          var opobj={};
          opobj[foperator]=filter.value.toLowerCase();
          obj[fkey]=opobj
          filters.push(obj);
        }
        else if(filter.key=="Count"){
            limit=parseInt(filter.value)+1;
            
        }
        else{
          fkey=`metadata.${filter.key}`;
          foperator=(filter.operator=='!='?'$ne':'$eq');
          var obj={};
          var opobj={};
          opobj[foperator]=filter.value;
          obj[fkey]=opobj
          filters.push(obj);
        }

     });
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db();
        var fromTime = ObjectID.createFromTime(new Date(body.range.from).getTime()/1000);
        var toTime = ObjectID.createFromTime(new Date(body.range.to).getTime()/1000);
        filter={}
        if(filters.length==0){
          filter={_id:{"$lt":toTime,"$gt":fromTime}}
        }
        else{
          filter={_id:{"$lt":toTime,"$gt":fromTime},$and:filters}
        }
        dbo.collection(collection).find(filter).sort({$natural:-1}).limit(limit).toArray(function(err, data){
            // console.log(data);
            var mostRecentRecord = {"target": "FeatureRun"};
            var datapoints = [];
            data.forEach(function(record){
                
                record.result.forEach(function(feature){
                    var featureData = []
                    var duration = 0;
                    var feature_status = "passed";
                    var error="";
                    var message="";
                    featureData.push(record._id);
	                featureData.push(feature.uri);
	                featureData.push(feature.name);
                    feature.elements.forEach(function(element){
                        element.steps.forEach(function(step){
                            duration = duration + step.result.duration/1000000000.0;
                            if(step.result.status != "passed"){
                                feature_status = "failed"
                                
                                if(step.result.status==="failed" && step.result.error_message.indexOf("APP:")!=-1){
                                  error=(step.result.error_message.substring(step.result.error_message.indexOf("APP:")+4,step.result.error_message.indexOf(",")));
                                  message=(step.result.error_message.substring(0,step.result.error_message.indexOf("APP:")));
                                  
                                }
                                else if(step.result.status==="failed" && step.result.error_message.indexOf("APP:")===-1){
                                	message=step.result.error_message;
                                }

                                
                            }else{
                                feature_status = "passed"
                            }
                        });
                    });
                    if(feature_status != "passed"){
                        featureData.push(error);
                        featureData.push(message);
                        featureData.push(0);
                        featureData.push(duration);
                        //Push only failed data
                    	datapoints.push(featureData);
                    }else{
                        featureData.push(1);
                        
                    }
                    
                    
                });
                
            });

           datapoints=_.uniqBy(datapoints,function(e){
            	return e[3];
            })
            mostRecentRecord['datapoints'] = datapoints;
            
            var table =
        {
          columns: [{text: 'RunID', type: 'string'},{text: 'Feature', type: 'string'}, {text: 'Description', type: 'string'},{text: 'Failed App', type: 'string'}, {text: 'Reason', type: 'string'}, {text: 'Status', type: 'number'}, {text: 'Duration', type: 'number'}],
          rows: datapoints,
          "type":"table"
        };
        
            resolve(table);
        });
    });
    });
}
function getSummary(body,target){
    return new Promise(function(resolve,reject){
    var featuresData = [];
    var filters=[];
    var tags=[];
    var limit=500;
     body.adhocFilters.forEach(function(filter){
        
        if(filter.key=="Tags"){
          //tags.push('tag.name'+(filter.operator=='!='?'!=':'==')+'"'+filter.value+'"');
          fkey=`result.elements.tags.name`;
          foperator=(filter.operator=='!='?'$ne':'$eq');
          var obj={};
          var opobj={};
          opobj[foperator]=filter.value;
          obj[fkey]=opobj
          filters.push(obj);
        }
        else if(filter.key=="Status"){
          //tags.push('tag.name'+(filter.operator=='!='?'!=':'==')+'"'+filter.value+'"');
          fkey=`result.elements.steps.result.status`;
          foperator=(filter.operator=='!='?'$ne':'$eq');
          var obj={};
          var opobj={};
          opobj[foperator]=filter.value.toLowerCase();
          obj[fkey]=opobj
          filters.push(obj);
        }
        else if(filter.key=="Count"){

            limit=parseInt(filter.value);
            
        }
        else{
          fkey=`metadata.${filter.key}`;
          foperator=(filter.operator=='!='?'$ne':'$eq');
          var obj={};
          var opobj={};
          opobj[foperator]=filter.value;
          obj[fkey]=opobj
          filters.push(obj);
        }

     });
     
     MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db();
        var fromTime = ObjectID.createFromTime(new Date(body.range.from).getTime()/1000);
        var toTime = ObjectID.createFromTime(new Date(body.range.to).getTime()/1000);
        filter={}
        if(filters.length==0){
          filter={_id:{"$lt":toTime,"$gt":fromTime}}
        }
        else{
          filter={_id:{"$lt":toTime,"$gt":fromTime},$and:filters}
        }
        dbo.collection(collection).find(filter).sort({$natural:-1}).limit(limit).toArray(function(err, data){
            if (err) throw err;
            // result = data;
            var c = 0;
            var pass = {"target": "RunPassHistory"};
            var fail = {"target": "RunFailHistory"};
            var pass_datapoints = [];
            var fail_datapoints = [];
            
            data.forEach(function(record){
                
                var passCount = 0;
                var failCount = 0;
                record.result.forEach(function(feature){
                    
                    var feature_status = "passed"
                    feature.elements.forEach(function(element){
                        element.steps.forEach(function(step){
                            if(step.result.status != "passed"){
                                feature_status = "failed";
                            }
                        });
                    });
                    if(feature_status != "passed"){
                        failCount += 1;
                    }else{
                        passCount += 1;
                    } 
                });
                
                if(failCount>0){
                  failCount=1
                  passCount=0
                }
                else{
                  passCount=1
                  failCount=0
                }
                pass_datapoints.push([passCount,Math.floor(new Date(record._id.getTimestamp()) )]);
                fail_datapoints.push([failCount,Math.floor(new Date(record._id.getTimestamp()) )]);
                
            });
            pass['datapoints'] = pass_datapoints;
            fail['datapoints'] = fail_datapoints;
            
            featuresData.push(pass);
            featuresData.push(fail);
            
            // return featuresData;
            if(target=="RunPassHistory"){
          resolve(featuresData[0]);
         }
         else{
          resolve(featuresData[1]);
         }
        });
    });
  });
    
}

function getFeaturesRunTable(body,target){

    // format
    // {"target":"RecentFeatureRun","datapoints":[["Xyz feature name","Pass",30],
    // ["efg feature name","Fail",30]]}
    return new Promise(function(resolve, reject){
    id=body.adhocFilters[0].value
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db();
        
        //.limit(1).sort({$natural:-1})
        dbo.collection(collection).find({_id:ObjectID(id)}).toArray(function(err, data){
            // console.log(data);
            var mostRecentRecord = {"target": "FeatureRun"};
            var datapoints = [];
            data.forEach(function(record){
                
                record.result.forEach(function(feature){
                    var featureData = []
                    var duration = 0;
                    var feature_status = "passed";
                    featureData.push(feature.uri);
                    featureData.push(feature.name);
                    feature.elements.forEach(function(element){
                        element.steps.forEach(function(step){
                            duration = duration + step.result.duration/1000000000.0;
                            if(step.result.status != "passed"){
                                feature_status = "failed"
                            }else{
                                feature_status = "passed"
                            }
                        });
                    });
                    if(feature_status == "passed"){
                        featureData.push(1);
                    }else{
                        featureData.push(0);
                    }
                    featureData.push(duration);
               
                    datapoints.push(featureData);
                });
                
            });
            mostRecentRecord['datapoints'] = datapoints;
            
            var table =
			  {
			    columns: [{text: 'Feature', type: 'string'}, {text: 'Description', type: 'string'},{text: 'Status', type: 'number'}, {text: 'Duration', type: 'number'}],
			    rows: datapoints,
			    "type":"table"
			  };
			  
            resolve(table);
        });
    });
    });
}
function getFeaturesTable(body,target){

    // format
    // {"target":"RecentFeatureRun","datapoints":[["Xyz feature name","Pass",30],
    // ["efg feature name","Fail",30]]}
    return new Promise(function(resolve, reject){
    var filters=[];
    var tags=[];
    var limit=500;
     body.adhocFilters.forEach(function(filter){
        
        if(filter.key=="Tags"){
          //tags.push('tag.name'+(filter.operator=='!='?'!=':'==')+'"'+filter.value+'"');
          fkey=`result.elements.tags.name`;
          foperator=(filter.operator=='!='?'$ne':'$eq');
          var obj={};
          var opobj={};
          opobj[foperator]=filter.value;
          obj[fkey]=opobj
          filters.push(obj);
        }
        else if(filter.key=="Status"){
          //tags.push('tag.name'+(filter.operator=='!='?'!=':'==')+'"'+filter.value+'"');
          fkey=`result.elements.steps.result.status`;
          foperator=(filter.operator=='!='?'$ne':'$eq');
          var obj={};
          var opobj={};
          opobj[foperator]=filter.value.toLowerCase();
          obj[fkey]=opobj
          filters.push(obj);
        }
        else if(filter.key=="Count"){

            limit=parseInt(filter.value);
            
        }
        else{
          fkey=`metadata.${filter.key}`;
          foperator=(filter.operator=='!='?'$ne':'$eq');
          var obj={};
          var opobj={};
          opobj[foperator]=filter.value;
          obj[fkey]=opobj
          filters.push(obj);
        }

     });
     
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db();
        var fromTime = ObjectID.createFromTime(new Date(body.range.from).getTime()/1000);
        var toTime = ObjectID.createFromTime(new Date(body.range.to).getTime()/1000);
        filter={}
        if(filters.length==0){
          filter={_id:{"$lt":toTime,"$gt":fromTime}}
        }
        else{
          filter={_id:{"$lt":toTime,"$gt":fromTime},$and:filters}
        }
        //.limit(1).sort({$natural:-1})
        dbo.collection(collection).find(filter).sort({$natural:-1}).limit(limit).toArray(function(err, data){
            // console.log(data);
            var mostRecentRecord = {"target": "Features"};
            var datapoints = [];
            data.forEach(function(record){
                
                record.result.forEach(function(feature){
                    var featureData = []
                    var duration = 0;
                    var feature_status = "passed";
                    featureData.push(feature.uri);
                    feature.elements.forEach(function(element){
                        element.steps.forEach(function(step){
                            duration = duration + step.result.duration/1000000000.0;
                            if(step.result.status != "passed"){
                                feature_status = "failed"
                            }else{
                                feature_status = "passed"
                            }
                        });
                    });
                    if(feature_status == "passed"){
                        featureData.push(1);
                    }else{
                        featureData.push(0);
                    }
                    featureData.push(duration);
               
                    datapoints.push(featureData);
                });
                
            });
            mostRecentRecord['datapoints'] = datapoints;
            
            var table =
        {
          columns: [{text: 'Feature', type: 'string'}, {text: 'Status', type: 'number'}, {text: 'Duration', type: 'number'}],
          rows: datapoints,
          "type":"table"
        };
        
            resolve(table);
        });
    });
    });
}
function getMetaData(body,target){

    // format
    // {"target":"RecentFeatureRun","datapoints":[["Xyz feature name","Pass",30],
    // ["efg feature name","Fail",30]]}
    return new Promise(function(resolve, reject){
    id=body.adhocFilters[0].value
    sceneName=body.adhocFilters[1].value   
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db();
        var fromTime = ObjectID.createFromTime(new Date(body.range.from).getTime()/1000);
        var toTime = ObjectID.createFromTime(new Date(body.range.to).getTime()/1000);
        //.limit(1).sort({$natural:-1})
        dbo.collection(collection).find({_id:ObjectID(id),"result.elements.id":sceneName}).toArray(function(err, data){
            // console.log(data);
            var mostRecentRecord = {"target": "MetaData"};
            var colpoints =[];
            var datapoints = [];
            data.forEach(function(record){
                 
                if(record.metadata!=null){
                Object.keys(record.metadata).forEach(function(key){

                    colpoints.push({text:key,type:'string'});
                    datapoints.push(record.metadata[key]);

                });
             }   
            
            });
            
            var table =
        {
          columns: colpoints,
          rows: [datapoints],
          "type":"table"
        };
        
            resolve(table);
        });
    });
    });
}
function getTestData(body,target){

    // format
    // {"target":"RecentFeatureRun","datapoints":[["Xyz feature name","Pass",30],
    // ["efg feature name","Fail",30]]}
    return new Promise(function(resolve, reject){
    id=body.adhocFilters[0].value
    sceneName=body.adhocFilters[1].value   
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db();
        
        //.limit(1).sort({$natural:-1})
        dbo.collection(collection).find({_id:ObjectID(id)}).toArray(function(err, data){
            // console.log(data);
            var mostRecentRecord = {"target": "TestData"};
            var colpoints =[];
            var datapoints = [];
            featureNum=-1
            featureFound=false
            data.forEach(function(record){
                
                record.result.forEach(function(feature){
                  feature.elements.forEach(function(scenario){
                    
                    featureNum=featureNum+1;
                    if(scenario.id==sceneName){
                      featureFound=true;
                      
                      return;
                    }
                  })
                  if(featureFound){
                    return;
                  }
                });
                if(record.testData!=null){

                Object.keys(record.testData[featureNum]).forEach(function(key){

                    colpoints.push({text:key,type:'string'});
                    
                    datapoints.push([key,record.testData[featureNum][key]]);

                });
             }   
            if(record.generatedData!=null){
                 Object.keys(record.generatedData[featureNum]).forEach(function(key){

                    colpoints.push({text:key,type:'string'});
                    
                    datapoints.push([key,record.generatedData[featureNum][key]]);

                });
             }  
             if(record.apiData!=null){
                Object.keys(record.apiData[featureNum]).forEach(function(key){

                    colpoints.push({text:key,type:'string'});
                    
                    datapoints.push([key,record.apiData[featureNum][key]]);

                });
             }  
             if(record.dataBaseInput!=null){
                Object.keys(record.dataBaseOutput[featureNum]).forEach(function(key){

                    colpoints.push({text:key,type:'string'});
                    
                    datapoints.push([key,record.dataBaseOutput[featureNum][key]]);

                });
             }   
             if(record.dataBaseOutput!=null){
                Object.keys(record.dataBaseOutput[featureNum]).forEach(function(key){

                    colpoints.push({text:key,type:'string'});
                   
                    datapoints.push([key,record.dataBaseOutput[featureNum][key]]);

                });
             }     
            });
            
            var table =
        {
          columns: [{text:"Key",type:"string"},{text:"Value",type:"string"}],
          rows: datapoints,
          "type":"table"
        };
        
            resolve(table);
        });
    });
    });
}
function getScenariosRunTable(body,target){

    return new Promise(function(resolve, reject){
        id=body.adhocFilters[0].value
        featureName=body.adhocFilters[1].value
        MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
            if (err) throw err;
           var dbo = db.db();
           var fromTime = ObjectID.createFromTime(new Date(body.range.from).getTime()/1000);
        var toTime = ObjectID.createFromTime(new Date(body.range.to).getTime()/1000);
        
        dbo.collection(collection).find({_id:ObjectID(id),"result.uri":featureName}).toArray(function(err, data){
        //dbo.collection(collection).find({"result.uri":featureName}).toArray(function(err, data){

                var scenarois = {"target": "ScenariosRun"};
                var datapoints = [];
                
                data.forEach(record => {
                    // console.log(record);
                    record.result.forEach(function(feature){
                        // {"target":"ScenariosRun","datapoints":[["Xyz scen name","Pass",30],["efg feature name","Fail",30]]}
                        if(feature.uri===featureName){
                       		feature.elements.forEach(function(element){
                                var sceneData = [];
                                // console.log(element);
                                var duration = 0;
                                var scene_status = "passed";

                                sceneData.push(element.name);
                                sceneData.push(element.id);
                                element.steps.forEach(function(step){
                                    duration = duration + step.result.duration/1000000000.0;
                                    if(step.result.status != "passed"){
                                        scene_status = "failed"
                                    }else{
                                        scene_status = "passed"
                                    }
                                });
                                if(scene_status == "passed"){
                                    sceneData.push(1);
                                }else{
                                    sceneData.push(0);
                                }
                                sceneData.push(duration);
                                datapoints.push(sceneData);
                                
                            });
                       }
                            
                    });
                
                });
              	scenarois['datapoints'] = datapoints;
                var table =
			  {
			    columns: [{text: 'Scenario', type: 'string'},{text: 'Id', type: 'string'}, {text: 'Status', type: 'number'}, {text: 'Duration', type: 'number'}],
			    rows: datapoints,
			    "type":"table"
			  };
			  
            resolve(table);  
            });
        });
    });
}
function getStepsRunTable(body,target){

    // {"target":"StepsRun","datapoints":[["Xyz step name","Pass",30],["efg step name","Fail",30]]}
    return new Promise(function(resolve, reject){
    //sceneName="as-a-user-once-i-add-items-to-cart-i-should-be-able-to-continue-shopping;authorized-user-should-be-able-to-continue-shopping;;2";
    id=body.adhocFilters[0].value;
    sceneName=body.adhocFilters[1].value;
    
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db();
        var fromTime = ObjectID.createFromTime(new Date(body.range.from).getTime()/1000);
        var toTime = ObjectID.createFromTime(new Date(body.range.to).getTime()/1000);
        
        dbo.collection(collection).find({_id:ObjectID(id),"result.elements.id":sceneName}).toArray(function(err, data){
            //console.log(data);
            var steps = {"target": "StepsRun"};
            var datapoints = [];
            data[0].result.forEach(function(feature) {
                // console.log(feature.name);
                feature.elements.forEach(function(element){
                     //console.log(element.name);
                    if(element.id === sceneName){
                         //console.log(sceneName);
                        var before_steps = [];
                            var after_steps = [];
                            before_steps.push("Browser and Env Setup");
                            if (element.before[0].result.status === "passed")
                                before_steps.push(1);
                            else
                                before_steps.push(0);
                            before_steps.push(element.before[0].result.duration / 1000000000.0);
                            before_steps.push((element.before[0].embeddings!=null)?element.before[0].embeddings[0].data:null);
                            before_steps.push((element.before[0].embeddings!=null)?element.before[0].embeddings[0].mime_type:null);
                            before_steps.push((element.before[0].result.error_message!=null)?element.before[0].result.error_message:null);
                            datapoints.push(before_steps);
                        element.steps.forEach(function(step){
                            var eachStep = [];
                             
                            eachStep.push(step.name);
                            if(step.result.status === "passed"){
                                eachStep.push(1);
                            }else if(step.result.status === "failed"){
                                eachStep.push(0);
                            }
                            else{
                              eachStep.push(-1);
                            }
                            eachStep.push(step.result.duration/1000000000.0);
                            eachStep.push((step.embeddings!=null)?step.embeddings[0].data:null);
                            eachStep.push((step.embeddings!=null)?step.embeddings[0].mime_type:null);
                            eachStep.push((step.result.error_message!=null)?step.result.error_message:null);
                            eachStep.push((step.output!=null)?step.output:null);
                            datapoints.push(eachStep);
                        });
                        after_steps.push("Clean up");
                            if (element.after[0].result.status === "passed")
                                after_steps.push(1);
                            else
                                after_steps.push(0);
                            after_steps.push(element.after[0].result.duration / 1000000000.0);
                            after_steps.push((element.after[0].embeddings!=null)?element.after[0].embeddings[0].data:null);
                            after_steps.push((element.after[0].embeddings!=null)?element.after[0].embeddings[0].mime_type:null);
                            after_steps.push((element.after[0].result.error_message!=null)?element.after[0].result.error_message:null);
                            datapoints.push(after_steps);
                        
                    }
                    
                });
            });
            steps['datapoints'] = datapoints;
            var table =
			  {
			    columns: [{text: 'Step Name', type: 'string'}, {text: 'Status', type: 'number'}, {text: 'Duration', type: 'number'}, {text: 'Data', type: 'string'}, {text: 'Mime', type: 'string'}, {text: 'Error', type: 'string'}, {text: 'Output', type: 'string'}],
			    rows: datapoints,
			    "type":"table"
			  };
			  
            resolve(table); 
        });
    });
    });
}
function getAPITestSuiteHistory(body,target){
    return new Promise(function(resolve,reject){
    var featuresData = [];
    var filters=[];
    var tags=[];
    var limit=500;
     body.adhocFilters.forEach(function(filter){
        
        if(filter.key=="Tags"){
          //tags.push('tag.name'+(filter.operator=='!='?'!=':'==')+'"'+filter.value+'"');
          fkey=`labels.value`;
          foperator=(filter.operator=='!='?'$not':'$regex');
          var obj={};
          var opobj={};
          opobj[foperator]=`${filter.value}.*`;
          obj[fkey]=opobj
          filters.push(obj);
        }
        else if(filter.key=="Status"){
          //tags.push('tag.name'+(filter.operator=='!='?'!=':'==')+'"'+filter.value+'"');
          fkey=`status`;
          foperator=(filter.operator=='!='?'$ne':'$eq');
          var obj={};
          var opobj={};
          opobj[foperator]=filter.value.toLowerCase();
          obj[fkey]=opobj
          filters.push(obj);
        }
        else if(filter.key=="Count"){

            limit=parseInt(filter.value);
            console.log(limit)
        }
        else{
          fkey=`metadata.${filter.key}`;
          foperator=(filter.operator=='!='?'$ne':'$eq');
          var obj={};
          var opobj={};
          opobj[foperator]=filter.value;
          obj[fkey]=opobj
          filters.push(obj);
        }

     });
     
     MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db();
        var fromTime = ObjectID.createFromTime(new Date(body.range.from).getTime()/1000);
        var toTime = ObjectID.createFromTime(new Date(body.range.to).getTime()/1000);
        filter={}
        if(filters.length==0){
          filter={_id:{"$lt":toTime,"$gt":fromTime}}
        }
        else{
          filter={_id:{"$lt":toTime,"$gt":fromTime},$and:filters}
        }
        dbo.collection(api_collection).find(filter).sort({$natural:-1}).limit(limit).toArray(function(err, data){
            if (err) throw err;
            // result = data;
            var c = 0;
            var pass = {"target": "APIPassSuiteHistory"};
            var fail = {"target": "APIFailSuiteHistory"};
            var pass_datapoints = [];
            var fail_datapoints = [];
            var mySuite={};
            var myPassTests={};
            var myFailTests={};
            data.forEach(function(record){
                if(record.status==="passed"){
                  if(myPassTests[record.name]!=undefined){
                      myPassTests[record.name]+=1;
                  }
                  else{
                      myPassTests[record.name]=1;
                  }
                }
                else
                {
                  if(myFailTests[record.name]!=undefined){
                      myFailTests[record.name]+=1;
                  }
                  else{
                      myFailTests[record.name]=1;
                  }
                }

                
            });
            var passCount=0;
            var failCount=0;
            Object.keys(myPassTests).forEach(function(pass){
                passCount+=myPassTests[pass]
            })
            Object.keys(myFailTests).forEach(function(fail){
                failCount+=myFailTests[fail]
            })

            pass_datapoints.push(passCount,Math.floor(new Date(Date.now())));
            fail_datapoints.push(failCount,Math.floor(new Date(Date.now())));
            pass['datapoints'] = [pass_datapoints];
            fail['datapoints'] = [fail_datapoints];
            // pass['datapoints'] = [];
            // fail['datapoints'] = [];
            // console.log("records count: "+c);
            featuresData.push(pass);
            featuresData.push(fail);
            
            // return featuresData;
            
            if(target=="APIPassSuiteHistory"){
              resolve(featuresData[0]);
             }
             else{
              resolve(featuresData[1]);
             }
        });
    });
  });
    
}
function getAPITestSuiteHistoryTable(body,target){
    return new Promise(function(resolve,reject){
    var featuresData = [];
    var filters=[];
    var tags=[];
    var limit=500;
     body.adhocFilters.forEach(function(filter){
        
        if(filter.key=="Tags"){
          //tags.push('tag.name'+(filter.operator=='!='?'!=':'==')+'"'+filter.value+'"');
          fkey=`labels.value`;
          foperator=(filter.operator=='!='?'$not':'$regex');
          var obj={};
          var opobj={};
          opobj[foperator]=`${filter.value}.*`;
          obj[fkey]=opobj
          filters.push(obj);
        }
        else if(filter.key=="Status"){
          //tags.push('tag.name'+(filter.operator=='!='?'!=':'==')+'"'+filter.value+'"');
          fkey=`status`;
          foperator=(filter.operator=='!='?'$ne':'$eq');
          var obj={};
          var opobj={};
          opobj[foperator]=filter.value.toLowerCase();
          obj[fkey]=opobj
          filters.push(obj);
        }
        else if(filter.key=="Count"){

            limit=parseInt(filter.value);
            
        }
        else{
          fkey=`metadata.${filter.key}`;
          foperator=(filter.operator=='!='?'$ne':'$eq');
          var obj={};
          var opobj={};
          opobj[foperator]=filter.value;
          obj[fkey]=opobj
          filters.push(obj);
        }

     });
     
     MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db();
        var fromTime = ObjectID.createFromTime(new Date(body.range.from).getTime()/1000);
        var toTime = ObjectID.createFromTime(new Date(body.range.to).getTime()/1000);
        filter={}
        if(filters.length==0){
          filter={_id:{"$lt":toTime,"$gt":fromTime}}
        }
        else{
          filter={_id:{"$lt":toTime,"$gt":fromTime},$and:filters}
        }
        dbo.collection(api_collection).find(filter).sort({$natural:-1}).limit(limit).toArray(function(err, data){
            if (err) throw err;
            // result = data;
            var c = 0;
            
            var pass_datapoints = [];
            var fail_datapoints = [];
            
            var myTests={}; 
            data.forEach(function(record){
                var mydata=[0,0,0];
                if(myTests[record.name]==undefined){
                  
                  myTests[record.name]=mydata;
                }
                
                if(record.status==="passed"){
                  if(myTests[record.name]!=undefined){
                      myTests[record.name][0]+=1; 
                  }
                  else{
                      
                      myTests[record.name][0]=1;   
                  }
                }
                else
                {
                  if(myTests[record.name]!=undefined){
                      myTests[record.name][1]+=1; 
                  }
                  else{
                      
                      myTests[record.name][1]=1; 
                  }
                }
                myTests[record.name][2]=record.stop-record.start;
                
            });
            var passCount=0;
            var failCount=0;
            var datapoints=[]
            Object.keys(myTests).forEach(function(me){
                var medata=[];

                medata.push(filters[0]['labels.value']['$regex'].replace(".*",""));
                medata.push(me);
                medata.push(myTests[me][0],myTests[me][1],myTests[me][2]);
                datapoints.push(medata);
            })
            
            
            var table =
        {
          columns: [{text: 'Suite Name', type: 'string'},{text: 'Test Name', type: 'string'}, {text: 'Passed', type: 'number'},{text: 'Failed', type: 'number'},{text: 'Recent Run Duration', type: 'number'}],
          rows: datapoints,
          "type":"table"
        };
        
            resolve(table); 
        });
        
    });
  });
    
}

function getAPITestCaseHistory(body,target){
    return new Promise(function(resolve,reject){
    var featuresData = [];
    var filters=[];
    var tags=[];
    var limit=500;
     body.adhocFilters.forEach(function(filter){
        
        if(filter.key=="Tags"){
          //tags.push('tag.name'+(filter.operator=='!='?'!=':'==')+'"'+filter.value+'"');
          fkey=`labels.value`;
          foperator=(filter.operator=='!='?'$not':'$regex');
          var obj={};
          var opobj={};
          opobj[foperator]=`${filter.value}.*`;
          obj[fkey]=opobj
          filters.push(obj);
        }
        else if(filter.key=="Status"){
          //tags.push('tag.name'+(filter.operator=='!='?'!=':'==')+'"'+filter.value+'"');
          fkey=`status`;
          foperator=(filter.operator=='!='?'$ne':'$eq');
          var obj={};
          var opobj={};
          opobj[foperator]=filter.value.toLowerCase();
          obj[fkey]=opobj
          filters.push(obj);
        }
        if(filter.key=="TestName"){
          //tags.push('tag.name'+(filter.operator=='!='?'!=':'==')+'"'+filter.value+'"');
          fkey=`name`;
          foperator=(filter.operator=='!='?'$not':'$regex');
          var obj={};
          var opobj={};
          opobj[foperator]=`${filter.value}.*`;
          obj[fkey]=opobj
          filters.push(obj);
        }
        else if(filter.key=="Count"){

            limit=parseInt(filter.value);
            
        }
        else{
          fkey=`metadata.${filter.key}`;
          foperator=(filter.operator=='!='?'$ne':'$eq');
          var obj={};
          var opobj={};
          opobj[foperator]=filter.value;
          obj[fkey]=opobj
          filters.push(obj);
        }

     });
     
     MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db();
        var fromTime = ObjectID.createFromTime(new Date(body.range.from).getTime()/1000);
        var toTime = ObjectID.createFromTime(new Date(body.range.to).getTime()/1000);
        filter={}
        if(filters.length==0){
          filter={_id:{"$lt":toTime,"$gt":fromTime}}
        }
        else{
          filter={_id:{"$lt":toTime,"$gt":fromTime},$and:filters}
        }
        dbo.collection(api_collection).find(filter).sort({$natural:-1}).limit(limit).toArray(function(err, data){
            if (err) throw err;
            // result = data;
            var c = 0;
            
            var datapoints = [];
            
            data.forEach(function(record){
              var status=0
                if(record.status==="passed"){
                  status=1
                }
                datapoints.push([record._id,record.name,status,record.stop-record.start])
                
            });
           
            
            var table =
            {
              columns: [{text: 'RunID', type: 'string'},{text: 'Test Name', type: 'string'}, {text: 'Status', type: 'number'},{text: 'Run Duration', type: 'number'}],
              rows: datapoints,
              "type":"table"
            };
        
            resolve(table); 
        });
        
    });
  });
    
}

function getAPITestSteps(body,target){
    return new Promise(function(resolve,reject){
    var featuresData = [];
    var filters=[];
    var tags=[];
    var limit=500;
    id=body.adhocFilters[0].value;
     
     MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db();
        var fromTime = ObjectID.createFromTime(new Date(body.range.from).getTime()/1000);
        var toTime = ObjectID.createFromTime(new Date(body.range.to).getTime()/1000);
        filter={}
        if(filters.length==0){
          filter={_id:{"$lt":toTime,"$gt":fromTime}}
        }
        else{
          filter={_id:{"$lt":toTime,"$gt":fromTime},$and:filters}
        }
        dbo.collection(api_collection).find({_id:ObjectID(id)}).toArray(function(err, data){
            if (err) throw err;
            // result = data;
            var c = 0;
            
            var datapoints = [];
            
            data.forEach(function(record){
                
                record.steps.forEach(function(step){
                    stepData=[];
                    stepData.push(step.name);
                    if(step.status==="passed"){
                      stepData.push(1);
                    }
                    else{
                      stepData.push(0);
                    }
                    stepData.push(step.stop-step.start);
                    //Get the request and response to display
                    if(step.parameters[0].value.indexOf(" Request ")!=-1){
                      request=step.parameters[0].value.split("---------------- Request ---------------------------")[1].split("---------------- Response --------------------------")[0];
                      stepData.push(request);
                      response=step.parameters[0].value.split("---------------- Response --------------------------")[1]
                      stepData.push(response);
                      message=step.parameters[0].value.split("----------------- Messages ------------------------------")[1].split("----------------- Properties ------------------------------")[0];
                      stepData.push(message);
                    }
                    else{
                      stepData.push("");
                      stepData.push("");
                      stepData.push("");
                    }
                    
                    datapoints.push(stepData);
                })
                
                
                
            });
           
            
            var table =
            {
              columns: [{text: 'Step Name', type: 'string'}, {text: 'Status', type: 'number'},{text: 'Duration', type: 'number'},{text: 'Request', type: 'string'},{text: 'Response', type: 'string'},{text: 'Messages', type: 'string'}],
              rows: datapoints,
              "type":"table"
            };
        
            resolve(table); 
        });
        
    });
  });
    
}
function getStepDetailsTable(body,target){

    // {"target":"StepsRun","datapoints":[["Xyz step name","Pass",30],["efg step name","Fail",30]]}
    return new Promise(function(resolve, reject){
    //sceneName="as-a-user-once-i-add-items-to-cart-i-should-be-able-to-continue-shopping;authorized-user-should-be-able-to-continue-shopping;;2";
    id=body.adhocFilters[0].value
    sceneName=body.adhocFilters[1].value
    
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db();
        var fromTime = ObjectID.createFromTime(new Date(body.range.from).getTime()/1000);
        var toTime = ObjectID.createFromTime(new Date(body.range.to).getTime()/1000);
        
        dbo.collection(collection).find({_id:ObjectID(id),"result.elements.id":sceneName}).toArray(function(err, data){
            //console.log(data);
            var steps = {"target": "StepsDetails"};
            var datapoints = [];
            data[0].result.forEach(function(feature) {
                
                feature.elements.forEach(function(element){
                     
                    if(element.id === sceneName){
                         
                            var after_steps = [];
                            var steps=[];
                            element.after.forEach(function(detail){
                                if(detail.embeddings!=null){
                                  detail.embeddings.forEach(function(embeds){
                                    after_steps.push([embeds.mime_type,embeds.data]);
                                    //after_steps.push(embeds.data);
                                    
                                  })
                                }
                            });
                            
                            element.steps.forEach(function(step){
                            	if(step.embeddings!=null){
	                            	steps.push(step.embeddings[0].mime_type);
	                            	steps.push(step.embeddings[0].data);
	                            }
                            	
                            })
            
                            datapoints.push(after_steps);
                            //datapoints.push(steps);
                        
                    }
                    
                });
            });
            steps['datapoints'] = datapoints;
            var table =
			  {
			    columns: [{text: 'Details', type: 'string'}, {text: 'Value', type: 'number'}],
			    rows: datapoints[0],
			    "type":"table"
			  };
			  
            resolve(table); 
        });
    });
    });
}
app.all('/tag[\-]keys', function(req, res) {
  setCORSHeaders(res);
  res.json(filtertags);
  res.end();
});

function getFilterTags(){

    // format
    // {"target":"RecentFeatureRun","datapoints":[["Xyz feature name","Pass",30],
    // ["efg feature name","Fail",30]]}
    return new Promise(function(resolve, reject){
    
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db();
        
        //.limit(1).sort({$natural:-1})
        dbo.collection(collection).find({}).sort({$natural:-1}).limit(100).toArray(function(err, data){
            // console.log(data);
            
            var colpoints =[];
            var datapoints = [];
            data.forEach(function(record){
                 
                if(record.metadata!=null){
                Object.keys(record.metadata).forEach(function(key){

                    colpoints.push({text:key,type:'string'});
                    datapoints.push({text:record.metadata[key]});

                });
             
             } 
             record.result.forEach(function(feature){
                  feature.tags.forEach(function(tag){
                    colpoints.push({text:"Tags",type:'string'})
                    colpoints.push({text:"Count",type:'string'})
                    datapoints.push(tag.name);
                  })
             })  
            
            });
            
            var table =
        {
          columns: colpoints,
          rows: datapoints,
          "type":"table"
        };
        //console.log(table);
            resolve(table);
        });
    });
    });
}

function getFilterValues(filterkey){

    // format
    // {"target":"RecentFeatureRun","datapoints":[["Xyz feature name","Pass",30],
    // ["efg feature name","Fail",30]]}
    return new Promise(function(resolve, reject){
    
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db();
        
        //.limit(1).sort({$natural:-1})
        dbo.collection(collection).find({}).sort({$natural:-1}).limit(1000).toArray(function(err, data){
            // console.log(data);
            
            var colpoints =[];
            var datapoints = [];
            data.forEach(function(record){
                 
                if(record.metadata!=null){
                Object.keys(record.metadata).forEach(function(key){
                    //console.log(key)
                    //console.log(filterkey)
                    if(key==filterkey){
                      datapoints.push({text:(record.metadata[key]==true?'true':(record.metadata[key]==false?'false':record.metadata[key]))});
                    }
                    

                });
             
             } 
             if(filterkey=="Tags"){
             record.result.forEach(function(feature){
                  feature.tags.forEach(function(tag){
                    
                    datapoints.push({text:tag.name});
                  })
             })  
            }
            });
            
            var table =
        {
          //columns: colpoints,
          values: datapoints,
          
        };
        //console.log(table);
            resolve(table);
        });
    });
    });
}
app.all('/tag[\-]values', function(req, res) {
  setCORSHeaders(res);
  let tsResult = [];
  tsResult.push(getFilterValues(req.body.key));
  Promise.all(tsResult).
  then((result)=>{
    res.json(_.uniqBy(result[0].values,'text'));
    res.end();
  });
});

app.listen(3333);

console.log("Server is listening to port 3333");
