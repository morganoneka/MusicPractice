const monthNames = ["January", "February", "March", "April", "May", "June",
"July", "August", "September", "October", "November", "December"];

const yearConv = {
  120: 2020,
  121: 2021
};

function nest_by_day(my_data){
  return d3.nest()
    .key(function (d) {
      date = new Date(d.PracticeDate);
      return date;
    })
    .rollup(function(d){
      // https://stackoverflow.com/questions/29422792/how-to-get-the-total-number-of-rows-with-particular-value-in-json-file-in-d3-js
      total = d.reduce(function(count, entry) {
          return count + 1;
      }, 0);
      return total;
    }).entries(my_data);
}

function nest_by_piece(my_data){
  return d3.nest()
    .key(function (d) {
      return d.Song;
    })
    .key(function (d) {
      return d.Artist;
    })
    .rollup(function(d){
      // https://stackoverflow.com/questions/29422792/how-to-get-the-total-number-of-rows-with-particular-value-in-json-file-in-d3-js
      total = d.reduce(function(count, entry) {
          return count + 1;
      }, 0);
      return total;
    }).entries(my_data);
}



function get_by_instrument(my_data, instrument){
  return my_data.filter(function(d){ return d.Instrument == instrument });
}

function recently_played(my_data, n){
  // grab play info from the last n days
  latestMth = d3.max(my_data.map(d=> new Date(d.PracticeDate)));

  console.log(latestMth);

  days = 86400000 //number of milliseconds in a day
  fiveDaysAgo = new Date(latestMth - (n*days));

  console.log(fiveDaysAgo);
  return my_data.filter(function(d){ return (new Date(d.PracticeDate) >= fiveDaysAgo) });
}

function remove_composition(my_data){
  return my_data.filter(function(d){ return d.Artist != "Me" });
}

function get_recent_plays(instrument){
  var my_data = d3.csv("https://raw.githubusercontent.com/morganoneka/MusicPractice/main/data/TranscribedData.csv",

  // tell d3 how to format the data
  function(row){
    return {PracticeDate : row.Date, Instrument : row.Instrument, Song: row.Song, Artist: row.Artist, Genre: row.Genre};
  },

  // what to do when the data is loaded
  function(data){

    // get total practices by month
    // http://www.d3noob.org/2014/02/grouping-and-summing-data-using-d3nest.html
    // var nested_data_day = nest_by_day(data);
    //
    // console.log(nested_data_day);

    // console.log(nested_data_day);
    var piano_music = get_by_instrument(data, instrument);

    // console.log(piano_music);

      var recent = recently_played(remove_composition(piano_music), 90);
      recent_nested = nest_by_piece(recent);

      recent_nested.sort(function(x, y){
           return d3.descending(x.values[0].value, y.values[0].value);
        });

      d3.select('#piano_recent').html("");

      // console.log(recent_nested_sorted);
      columns = ["Song", "Artist", "count"];
      // http://bl.ocks.org/jfreels/6734025
      var table = d3.select('#piano_recent').append('table')
  		var thead = table.append('thead')
  		var	tbody = table.append('tbody');

  		// append the header row
  		thead.append('tr')
  		  .selectAll('th')
  		  .data(columns).enter()
  		  .append('th')
  		    .text(function (column) { return column; });

  		// create a row for each object in the data
  		var rows = tbody.selectAll('tr')
  		  .data(recent_nested)
  		  .enter()
  		  .append('tr');

  		// create a cell in each row for each column
  		var cells = rows.selectAll('td')
  		  .data(function (row) {
  		    // return columns.map(function (column) {
  		    //   return {column: column, value: row['key']};
  		    // });
          row_map = {Song: row.key, Artist: row.values[0].key, count: row.values[0].value};
          return columns.map(function (column) {
  		      return {column: column, value: row_map[column]};
  		    });
  		  })
  		  .enter()
  		  .append('td')
          .text(function(d) { return d.value + " "; });

  });
}

var margin = {top: 30, right: 30, bottom: 70, left: 60},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#FullHeatmap")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

    // var piano_data = d3.csv("https://raw.githubusercontent.com/morganoneka/MusicPractice/main/data/TranscribedData.csv", data=> {
    //     data.filter(function(d){ return d.Instrument == "Piano" });
    //   })
    //
    //   console.log(piano_data)

    // https://stackoverflow.com/questions/30610675/python-pandas-equivalent-in-javascript/30611208#30611208

get_recent_plays("Piano");


d3.select("#recent_piano").on("click", function () {
  get_recent_plays("Piano");
});
d3.select("#recent_eg").on("click", function () {
  get_recent_plays("Electric Guitar");
});
d3.select("#recent_ag").on("click", function () {
  get_recent_plays("Acoustic Guitar");
});
d3.select("#recent_bass").on("click", function () {
  get_recent_plays("Bass");
});
d3.select("#recent_banjo").on("click", function () {
  get_recent_plays("Banjo");
});
