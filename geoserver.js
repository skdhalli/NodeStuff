var express = require('express');
var pg = require('pg');
var conString = "postgres://webuser:webuser@198.199.116.105:5432/hotspots";
var app = express();

app.get('/hotspots/locations', function(req,res){
	var xmin = req.query.xmin;
	var xmax = req.query.xmax;
	var ymin = req.query.ymin;
	var ymax = req.query.ymax;
	var x_bins_count = 10;
	var y_bins_count = 10;

    pg.connect(conString, function(err, client, done) {
  		if(err) 
  		{
  			return console.error('error fetching client from pool', err);
  		}
  		var select_query = "SELECT * from get_clustered_locs("+
    			"cast("+xmin+" as numeric),cast("+ymin+" as numeric),cast("
    			+xmax+" as numeric),cast("+ymax+" as numeric)"
    			+",cast("+x_bins_count+" as smallint),cast("
    			+y_bins_count+" as smallint));"
    			
  		client.query(select_query,  function(err, result) {
    	done();
    	if(err) {
      		return console.error('error running query', err);
    	}
    	var response = "{\"hotspots\":[";
    	for(idx in result.rows)
    	{
    		if(result.rows[idx].count == 1)
    		{
    			response += "{\"x\":"+result.rows[idx].x+",\"y\":"+result.rows[idx].y+",\"host\":"+result.rows[idx].host+",\"doc_id\":"+result.rows[idx].doc_id+"},";
    		}
    		else
    		{
    			response += "{\"x\":"+result.rows[idx].x+",\"y\":"+result.rows[idx].y+",\"count\":"+result.rows[idx].count+"},";
    		}
    	}
    	response =response.substr(0,response.length-1);
    	response += "]}";
    	res.send(response);
  		});
	});
		
	
});

var server = app.listen(9090, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Geoserver listening at http://%s:%s', host, port);

});
