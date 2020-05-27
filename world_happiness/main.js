// Set up SVG
let width = 1000;
let height = 2000;
let margin = 275;

let svg = d3.select('#happiness')
	.append('svg')
	.attr('width', width + 'px')
	.attr('height', height + 'px')

width -= margin * 2;

let y = d3.scaleLinear()
	.domain([0, 166])
	.range([margin/2, height]);

function getSlope(d){
	var rankings = d['rankings'];
	var maxSlope = null;

	if(!isNaN(rankings[0])){
		if(!isNaN(rankings[1])){
			maxSlope = (rankings[1] - rankings[0]);
		}

		if(!isNaN(rankings[2]) && Math.abs(rankings[0] - rankings[2]) > Math.abs(maxSlope)){
			maxSlope = (rankings[2] - rankings[0]);
		}
	}

	if(!isNaN(rankings[1]) && !isNaN(rankings[2]) && Math.abs(rankings[1] - rankings[2]) > Math.abs(maxSlope)){
		maxSlope = (rankings[2] - rankings[1]);
	}

	return maxSlope;
}

for(let i = 2015; i < 2018; i++){
	svg.append('text')
		.attr('text-anchor', 'middle')
		.attr('x', margin + width/2 * (i - 2015))
		.attr('y', margin/2 - 10)
		.attr('opacity', .4)
		.attr('font-size', 12)
		.text(i);	
}

svg.append('text')
   .attr('text-anchor', 'middle')
   .attr('x', margin + width/2)
   .text('World Happiness Ranking')
   .attr('y', margin/4)
   .attr('font-size', 16)
   .attr('opacity', .4)

d3.csv('./data/rankings.csv', function(d){
	d = {
		'country': d['country'],
		'rankings': [parseInt(d['2015']), parseInt(d['2016']), parseInt(d['2017'])],
		'linkages': d['linkages'],
	};

	d['maxSlope'] = getSlope(d);
	return d;
}).then(function(d){
	console.log(d);

	var slopes = svg.append('g')
					.selectAll('g')
					.data(d)
					.enter()
					.append('g')
					.attr('class', 'country')
					.attr('id', function(d){
						return d['country'];
					})
					.on('mouseover', function(d){
						d3.select(this).selectAll('g > polyline').attr('stroke-width', '2px').attr('opacity', '1');
						d3.select(this).selectAll('g > text').attr('font-size', '10pt');
					})
					.on('mouseout', function(d){
						d3.select(this).selectAll('g > polyline').attr('stroke-width', '1px').attr('opacity', '.3');
						d3.select(this).selectAll('g > text').attr('font-size', '7pt');
					});

	var labels = slopes.append('text')
					   .attr('class', 'country-label')
					   .attr('text-anchor', 'end')
					   .attr('x', margin - 10)
					   .attr('y', function(d){
					   		if(d['country'] === 'Jordan') return y(d['rankings'][0] + 1)
					   		return y(d['rankings'][0]);
					   })
					   .text(function(d){
					   		if(!isNaN(d['rankings'][0]))
						   		return d['country'] + ' (' + d['rankings'][0] + ')';
					   })
					   .attr('fill', function(d){
					   		if(d['maxSlope'] > 20){
					   			return '#4f44ea';
					   		}
					   		if(d['maxSlope'] < -20){
					   			return 'red';
					   		}
					   		return 'black';
					   });

	var labels = slopes.append('text')
					   .attr('class', 'country-label')
					   .attr('text-anchor', 'start')
					   .attr('x', width + margin + 10)
					   .attr('y', function(d){
					   		return y(d['rankings'][2]);
					   })
					   .text(function(d){
					   		if(!isNaN(d['rankings'][2]))
							   		return '(' + d['rankings'][2] + ') ' + d['country'];
					   })
					   .attr('fill', function(d){
					   		if(d['maxSlope'] > 20){
					   			return '#4f44ea';
					   		}
					   		if(d['maxSlope'] < -20){
					   			return 'red';
					   		}
					   		return 'black';
					   });

	var lines = slopes.append('polyline')
				   .attr('class', 'rating-line')
				   .attr('points', function(d){
				   		var p = [];
				   		for(let i = 0; i < d['rankings'].length; i++){
				   			if(!isNaN(d['rankings'][i])){
					   			p.push(
					   				[margin + width/(d['rankings'].length - 1) * i, y(d['rankings'][i])]
				   				)
				   			}
				   		}
				   		let s = ''
				   		for(let i = 0; i < p.length; i++){
				   			s += p[i][0] + ',' + p[i][1] + ' '
				   		}
				   		return s;
				   })
				   .attr('opacity', '.3')
				   .attr('stroke', function(d){
				   		if(d['maxSlope'] > 20){
				   			return '#4f44ea';
				   		}
				   		if(d['maxSlope'] < -20){
				   			return 'red';
				   		}
				   		return 'black';
				   });

	for(let i = 0; i < d.length; i++){
		console.log(d[i]['linkages'])
	}
})





















