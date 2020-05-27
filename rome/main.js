// Create map SVG
let width = 900;
let height = 400;

let mapSvg = d3.select('#map-holder')
	.append('svg')
	.attr('width', 800 + 'px')
	.attr('height', height + 'px')


let hatchingData = [{x:0,y:0},{x:10,y:10}];
let lineBuild = d3.line().x(function(d){return d.x}).y(function(d){return d.y});
mapSvg.append('pattern')
	  .attr('id', 'hatching')
	  .attr('width', 6)
	  .attr('height', 6)
	  .attr('patternUnits', 'userSpaceOnUse')
	  .append('path')
	  .attr('d', lineBuild(hatchingData))
	  .attr('stroke', 'black')
	  .attr('stroke-width', '.5')

mapSvg.append('pattern')
	  .attr('id', 'dashed')
	  .attr('width', 3)
	  .attr('height', 6)
	  .attr('patternUnits', 'userSpaceOnUse')
	  .append('rect')
	  .attr('width', .5)
	  .attr('height', 1000)
	  .attr('x', 0)
	  .attr('y', 0)
	  .attr('fill', 'black')

// Set up mercator projection
let proj = d3.geoMercator()
	.scale(900)
	.center([19, 37.5])

let geoPath = d3.geoPath()
				.projection(proj);


// Load map data
let land = mapSvg.append('g').attr('id', 'land');
land.selectAll('path')
	.data(mapDataJSON.features)
	.enter()
	.append('path')
	.attr('fill', '#ccc')
	.attr('stroke-width', 1)
	.attr('stroke', '#bbb')
	.attr('d', geoPath);


// Load and draw city data
let palette = {
	'Julio-Claudian' : '#fff',
	'Flavian' :'#f0f0f0',
	'Nerva-Antonine' :'#d9d9d9',
	'Severan' :'#bdbdbd',
	'Gordian' :'#969696',
	'Constantinian' :'#737373',
	'Valentinian' :'#252525',
	'Theodosian' :'#000',
}
let cities = mapSvg.append('g').attr('id', 'cities');
d3.csv('./data/city_data.csv', function(d){
	return {
		name: d['birth.cty'],
		lat: parseFloat(d['birth.city.lat']),
		long: parseFloat(d['birth.city.long']),
		dynasty: d['dynasty'],
	};
}).then(function (data) {
	// Add city markers
	cities.selectAll('circle')
		.data(data)
		.enter()
		.append('circle')
		.attr('id', function(d){
			return d.name.replace(' ', '');
		})		
		.attr('cx', function(d){
			return proj([d.long, d.lat])[0];
		})
		.attr('cy', function(d){
			return proj([d.long, d.lat])[1];
		})
		.attr('r', 5)
		.attr('fill', function(d){
			return palette[d['dynasty']]
		})
		.attr('stroke', 'black')
		.attr('stroke-width', '1')
		.on('mouseover', function(d){
			d3.select('#text-' + this.id).style('visibility', 'visible');
			d3.select(this).attr('r', 8)
		})
		.on('mouseout', function(d){
			d3.select('#text-' + this.id).style('visibility', 'hidden');
			d3.select(this).attr('r', 5)
		})

	// Add city labels on hover
	cities.selectAll('text')
		.data(data)
		.enter()
		.append('g')
		.attr('id', function(d){
			return 'text-' + d.name.replace(' ', '');
		})
		.style('visibility', 'hidden')
		.each(function (d) {
			d3.select(this).append('rect')
			.attr('x', function(d){
				let letterWidth = d.name.length;
				return proj([d.long, d.lat])[0] - letterWidth * 4.8;
			})
			.attr('rx', 2)
			.attr('ry', 3)
			.attr('y', function(d){
				return proj([d.long, d.lat])[1] - 28;
			})
			.attr('fill', function(d){
				return '#fff';
			})
			.attr('width', function(d){
				let letterWidth = d.name.length;
				return letterWidth * 10;
			})
			.attr('height', 18)
			// .attr('stroke', '#7fcdbb')

			d3.select(this).append('text')
			.text(function(d){
				return d.name;
			})
		    .attr('text-anchor', 'middle')
			.attr('x', function(d){
				let letterWidth = d.name.length;
				return proj([d.long, d.lat])[0];
			})
			.attr('y', function(d){
				return proj([d.long, d.lat])[1] - 15;
			})
			.attr('fill', function(d){
				// return palette[d['dynasty']]
				return '#000'
			})
			
		});
});

// Set up timeline
let tlHeight = 1450;
let tlSvg = d3.select('#timeline')
	.append('svg')
	.attr('width', width + 'px')
	.attr('height', tlHeight + 'px')

let scales = tlSvg.append('g')
	 .attr('id', 'scales')
let emperors = tlSvg.append('g')
	 .attr('id', 'emperors')

function getYear(str){
	let date;
	if(str[0] === '-'){
		date = new Date(-parseFloat(str.slice(1, 5)), 1, 1)
		date.setUTCFullYear(-parseFloat(str.slice(1, 5)))
	}else{
		date = new Date(parseFloat(str.slice(0, 4)), 1, 1)
		date.setUTCFullYear(parseFloat(str.slice(0, 4)))
	}
	return date;
}

let timeStart, timeEnd;
function yearToX(year){
	return (year - timeStart + 18) * 1.3 + 175;
}

d3.csv('./data/emperor_data.csv', function(d){
	return {
		name: d['name'],
		birth: getYear(d['birth']),
		death: getYear(d['death']),
		city: d['birth.cty'],
		prov: d['birth.prv'],
		rise: d['rise'],
		reignStart: getYear(d['reign.start']),
		reignEnd: getYear(d['reign.end']),
		cause: d['cause'],
		killer: d['killer'],
		dynasty: d['dynasty'],
		era: d['era'],
	};
}).then(function (data) {
	timeStart = data[0].birth.getFullYear();
	timeEnd = data[data.length - 1].death.getFullYear();

	for(let i = timeStart - 18; i < timeEnd + 10; i += 40){
		scales.append('text')
			  .text(Math.abs(i))
			  .attr('x', yearToX(i))
			  .attr('y', 80)
			  .attr('text-anchor', 'middle')
			  .attr('font-size', 10)

		if(i % 80 === 0){
			scales.append('rect')
				  .attr('width', .1)
				  .attr('height', tlHeight)
				  .attr('fill', 'black')
				  .attr('x', yearToX(i))
				  .attr('y', 90)
		}else{
			scales.append('rect')
				  .attr('width', .03)
				  .attr('height', tlHeight)
				  .attr('fill', 'black')
				  .attr('x', yearToX(i))
				  .attr('y', 90)
		}
	}

	let currentDyn = 'Julio-Claudian';
	let prevY = 100;
	for(let i = 0; i < data.length; i++){
		let curY = i * 20 + 100;
		let emp = emperors.append('g')
				.attr('id', data[i].name);

		emp.append('text')
		   .text((i + 1) + ': ' + data[i].name)
		   .attr('y', curY)
		   .attr('font-size', 10)
		   .on('mouseover', function(){
		   		d3.select('#text-' + data[i].city.replace(' ', '')).style('visibility', 'visible');
				d3.select(this).attr('r', 8)
			})
			.on('mouseout', function(d){
				d3.select('#text-' + data[i].city.replace(' ', '')).style('visibility', 'hidden');
				d3.select(this).attr('r', 5)
			})

		emp.append('rect')
		   .attr('x', function(){
		   		if(!isNaN(data[i].birth.getFullYear())){
		   			return yearToX(data[i].birth.getFullYear())
		   		}else{
		   			return -100;
		   		}
		   })
		   .attr('y', curY - 5)
		   .attr('height', 5)
		   .attr('width', function () {
		   		if(!isNaN(data[i].birth.getFullYear())){
		   			return yearToX(data[i].reignStart.getFullYear()) - yearToX(data[i].birth.getFullYear())
		   		}else{
		   			return 0;
		   		}
		   })
		   .attr('fill', 'url(#dashed)')

		emp.append('rect')
		   .attr('x', function(){
	   			return yearToX(data[i].reignStart.getFullYear())
		   })
		   .attr('y', curY - 5)
		   .attr('height', 5)
		   .attr('width', function () {
	   			return yearToX(data[i].reignEnd.getFullYear()) - yearToX(data[i].reignStart.getFullYear())
		   })
		   .attr('fill', 'black')

		emp.append('rect')
		   .attr('x', function(){
		   		if(!isNaN(data[i].death.getFullYear())){
		   			return yearToX(data[i].reignEnd.getFullYear())
		   		}else{
		   			return -100;
		   		}
		   })
		   .attr('y', curY - 5)
		   .attr('height', 5)
		   .attr('width', function () {
		   		if(!isNaN(data[i].death.getFullYear())){
		   			return yearToX(data[i].death.getFullYear()) - yearToX(data[i].reignEnd.getFullYear())
		   		}else{
		   			return 0;
		   		}
		   })
		   .attr('fill', 'url(#dashed)')


		// Add dynasty key if dynasty has changed
		if(currentDyn !== data[i].dynasty){
			scales.append('rect')
				  .attr('fill', palette[currentDyn])
				  .attr('x', width - 100)
				  .attr('y', prevY - 15)
				  .attr('height', curY - prevY)
				  .attr('width', 10)
				  // .attr('stroke', 'black')

				scales.append('text')
				  .text(currentDyn)
				  .attr('y', -width + 60)
				  .attr('x', prevY + (curY - prevY)/2 - 15)
				  .attr('transform', 'rotate(90, 0, 0)')
				  .attr('font-size', 10)
				  .attr('text-anchor', 'middle')

			currentDyn = data[i].dynasty;
			prevY = curY;
			scales.append('rect')
				  .attr('x', 0)
				  .attr('y', curY - 15)
				  .attr('width', width - 100)
				  .attr('height', .5)


		}
	}

	scales.append('rect')
		  .attr('fill', palette['Theodosian'])
		  .attr('x', width - 100)
		  .attr('y', prevY - 15)
		  .attr('height', 100)
		  .attr('width', 10)
		  // .attr('stroke', 'black')


	// Set up eras and dynasties on the timeline
	let eraChange = 284;
	scales.append('text')
		  .text('Principate')
		  .attr('text-anchor', 'middle')
		  .attr('x', yearToX(timeStart - 18) + (yearToX(eraChange) - yearToX(timeStart - 18))/2)
		  .attr('y', 40)
		  .attr('font-size', 13)
	scales.append('rect')
		  .attr('x', yearToX(timeStart - 18))
		  .attr('y', 50)
		  .attr('height', 1)
		  .attr('width', yearToX(eraChange) - yearToX(timeStart - 18))
		  .attr('stroke', 'black');
	scales.append('rect')
		  .attr('x', yearToX(eraChange))
		  .attr('y', 40)
		  .attr('height', 20)
		  .attr('width', 1)
		  .attr('stroke', 'black');

	scales.append('rect')
		  .attr('x', yearToX(eraChange))
		  .attr('y', 100)
		  .attr('height', tlHeight)
		  .attr('width', .5)
		  .attr('fill', 'black');


	scales.append('rect')
		  .attr('x', yearToX(eraChange))
		  .attr('y', 50)
		  .attr('height', 1)
		  .attr('width', yearToX(timeEnd) - yearToX(eraChange))
		  .attr('stroke', 'black');
		scales.append('text')
		  .text('Dominate')
		  .attr('text-anchor', 'middle')
		  .attr('x', yearToX(eraChange) + (yearToX(timeEnd) - yearToX(eraChange))/2)
		  .attr('y', 40)
		  .attr('font-size', 13)

	// Set up key
	scales.append('rect')
		  .attr('fill', 'white')
		  .attr('width', 220)
		  .attr('height', 70)
		  .attr('x', width - 340)
		  .attr('y', 120)
		  .attr('stroke', 'black')
	scales.append('rect')
		  .attr('fill', 'black')
		  .attr('width', 30)
		  .attr('height', 5)
		  .attr('x', width - 320)
		  .attr('y', 140)
	scales.append('rect')
		  .attr('fill', 'url(#dashed)')
		  .attr('width', 30)
		  .attr('height', 5)
		  .attr('x', width - 320)
		  .attr('y', 160)
	scales.append('text')
		  .text(': Emperor')
		  .attr('x', width - 280)
		  .attr('y', 145)
		  .attr('text-anchor', 'center')
		  .attr('font-size', 10)
	scales.append('text')
		  .text(': Alive, not reigning')
		  .attr('x', width - 280)
		  .attr('y', 165)
		  .attr('text-anchor', 'center')
		  .attr('font-size', 10)
})