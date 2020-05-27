let width = 1000;
let height = 1000;

let colors = ['#3d1b55', '#458f89', '#aecf47'];

let svg = d3.select('#svg-holder')
	.append('svg')
	.attr('width', width + 'px')
	.attr('height', height + 'px');

let maxTemp = d3.line().x(
		function(d){
			return (parseInt(d.day) * 3)
		}
	).y(
		function(d){
			return (height - margin - parseInt(d['max_temp'])*5)
		}
	);

let minTemp = d3.line().x(
		function(d){
			return (parseInt(d.day) * 3)
		}
	).y(
		function(d){
			return (height - margin - parseInt(d['min_temp'])*5)
		}
	);

let margin = height/3 + 30;


function dayToX(day){
	return 75 + ((width - 100)/365 * day);
}

function getDaysFromDate(date){
	date = date.split('/')
	var dayMonth = [parseInt(date[1]), date[0]];

	for(var i = 0; i < date[0] - 1; i ++){
		dayMonth[0] += parseInt(months[i][1]);
	}

	return dayMonth;
}

var months = [['January', 31], ['February', 28], ['March', 31], ['April', 30], ['May', 31], ['June', 30], ['July', 31], ['August', 31], ['September', 30], ['October', 31], ['November', 30], ['December', 31]];

data = {

}
d3.csv('./data/temperatures.csv',
		function(d){
			if(!(d['year'] in data)){
				data[d['year']] = []
			}

			data[d['year']].push(d)
		}
	).then(
		function(){
			for(var i = -30; i < 100; i += 20){
				svg.append('text')
				   .text(i + ' -')
				   .attr('fill', 'white')
				   .attr('x', 50)
				   .attr('y', height - margin - i*5)
				   .attr('font-size', 10)
			}

			svg.append('text')
			   .text('Degrees Fahrenheit')
			   .attr('transform', 'rotate(-90)')
			   .attr('dx', -height/2)
			   .attr('dy', 30)
			   .attr('text-anchor', 'middle')
			   .attr('fill', 'white')
			   .attr('font-size', 12)

			var sumDays = 0;
			for(let i = 0; i < months.length; i++){
				sumDays += months[i][1]/2;

				svg.append('text')
					.attr('text-anchor', 'end')
					.attr('dy', dayToX(sumDays))
					.attr('dx', -height + margin - 10)
					.attr('transform', 'rotate(-90)')
				    .attr('fill', 'white')
				    .attr('font-size', 10)
				    .text(months[i][0]);

				sumDays += months[i][1]/2;
			}

			for(var key in data){
				svg.selectAll('.points y' + key)
				   .data(data[key])
				   .enter()
				   		.append('circle')
				   		.attr('fill', '#39a4ce')
				   		.attr('r', 2)
				   		.attr('opacity', .05)
				   		.attr('cx', function(d){return dayToX(parseInt(d['day']))})
				   		.attr('cy', function(d){return (height - margin - parseInt(d['min_temp'])*5)})
				   		.attr('class', 'points y' + key);
				   		

				svg.selectAll('.points y' + key)
				   .data(data[key])
				   .enter()
				   		.append('circle')
				   		.attr('fill', '#ffdb66')
				   		.attr('r', 2)
				   		.attr('opacity', .05)
				   		.attr('cx', function(d){return dayToX(parseInt(d['day']))})
				   		.attr('cy', function(d){return (height - margin - parseInt(d['max_temp'])*5)})
				   		.attr('class', 'points y' + key);

				svg.append('text')
				   .attr('x', width/2)
				   .attr('y', 100)
				   .attr('fill', 'white')
				   .text(key)
				   .attr('text-anchor', 'middle')
				   .attr('font-size', 20)
				   .attr('class', 'textyear' + key)
				   .attr('opacity', 0);
			}

			svg.append('path')
			   .attr('d', maxTemp([
				   {
				   		'max_temp': 32,
				   		'day': 0
				   },
				   {
				   		'max_temp': 32,
				   		'day': 365
				   }
			   ]))
			   .attr('fill', 'white')
			   .attr('stroke', 'white')
			   .attr('stroke-width', .5)
			   .attr('opacity', 1)
			   .attr('stroke-dasharray', '10')


			setInterval(cycle, 1000);
		}
	);

d3.csv('./data/freeze_thaw.csv',
		function(d){
			return d;
		}
	).then(function(d){
		for(var i = 0; i < d.length; i++){
			var closeDate = getDaysFromDate(d[i]['CLOSED']);
			var openDate = getDaysFromDate(d[i]['OPENED']);

			// console.log(d[i]);
			// console.log('close: ' + closeDate + '\t\t open: ' + openDate)
			if(parseInt(closeDate[1]) <= parseInt(openDate[1])){
				svg.append('rect')
				   .attr('width', dayToX(openDate[0]) - dayToX(closeDate[0]))
				   .attr('fill', 'white')
				   .attr('height', 1)
				   .attr('y', height - 20 - (parseInt(d[i]['END YEAR']) - 1970) * 5)
				   .attr('x', dayToX(closeDate[0]))
				   .attr('opacity', .2)
				   .attr('class', 'rect rYear' + d[i]['END YEAR'])
			}else{
				console.log("helo")
				svg.append('rect')
				   .attr('width', dayToX(365) - dayToX(closeDate[0]))
				   .attr('fill', 'white')
				   .attr('height', 1)
				   .attr('y', height - 20 - (parseInt(d[i]['START YEAR']) - 1970) * 5)
				   .attr('x', dayToX(closeDate[0]))
				   .attr('opacity', .2)
				   .attr('class', 'rect rYear' + d[i]['START YEAR']);

				svg.append('rect')
				   .attr('width', dayToX(openDate[0]) - dayToX(0))
				   .attr('fill', 'white')
				   .attr('height', 1)
				   .attr('y', height - 20 - (parseInt(d[i]['END YEAR']) - 1970) * 5)
				   .attr('x', dayToX(0))
				   .attr('opacity', .2)
				   .attr('class', 'rect rYear' + d[i]['END YEAR']);
			}
		}
	});

svg.append('circle')
   .attr('fill', '#ffdb66')
   .attr('r', 3.5)
   .attr('opacity', 1)
   .attr('cx', width - 200)
   .attr('cy', 50)
svg.append('text')
   .text('Daily Max Temperature')
   .attr('fill', 'white')
   .attr('x', width - 185)
   .attr('y', 53)

svg.append('circle')
   .attr('fill', '#39a4ce')
   .attr('r', 3.5)
   .attr('opacity', 1)
   .attr('cx', width - 200)
   .attr('cy', 80)
svg.append('text')
   .text('Daily Min Temperature')
   .attr('fill', 'white')
   .attr('x', width - 185)
   .attr('y', 83)

svg.append('rect')
   .attr('fill', 'white')
   .attr('width', 20)
   .attr('height', 1)
   .attr('opacity', 1)
   .attr('x', width - 210)
   .attr('y', 110)
svg.append('text')
   .text('Span of Lake Closure')
   .attr('fill', 'white')
   .attr('x', width - 185)
   .attr('y', 113)



var currentYear = 1990;
function cycle(){
	if(currentYear < 2050){
		svg.selectAll('.y' + currentYear)
		   .attr('opacity', .8);
		svg.select('.textyear' + currentYear)
		   .attr('opacity', 1);

	   svg.selectAll('.y' + (currentYear - 1))
		   .attr('opacity', .05);

		svg.select('.textyear' + (currentYear - 1))
		   .attr('opacity', 0);

	   svg.selectAll('.rYear' + currentYear)
		   .attr('opacity', 1);
		svg.selectAll('.rYear' + (currentYear - 1))
		   .attr('opacity', .2);

		currentYear += 1;		
	}else{
		currentYear = 1971;
		svg.selectAll('.points')
		   .attr('opacity', 0);
	}
}



















