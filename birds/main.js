// Set up SVG
let width = 1850;
let height = 700;

let birdSVG = d3.select('#burds')
	.append('svg')
	.attr('width', '95%')
	.attr('height', '95%')
	.attr('viewBox', '0 0 ' + width + ' ' + height)


// Load and parse data
d3.csv('./data/birds.csv', function(d){
	return {
		'order': d['order'],
		'superfamily': d['superfamily'],
		'family': d['family'],
		'common_name': d['common_name'],
		'weight': d['weight'],
		'feeders': {
			'hopper': d['feeder.hopper'],
			'tube': d['feeder.tube'],
			'nyjer': d['feeder.nyjer'],
			'platform': d['feeder.platform'],
			'ground': d['feeder.ground'],
			'suet': d['feeder.suet'],
		},
		'seed_preference': {
			'black oil sunflower': parseInt(d['pef.black_oil_sunflower']),
			'striped sunflower': parseInt(d['pref.striped_sunflower']),
			'hulled sunflower': parseInt(d['pref.hulled_sunflower']),
			'millet': parseInt(d['pref.millet']),
			'milo': parseInt(d['pref.milo']),
			'nyjer': parseInt(d['pref.nyjer']),
			'shelled peanut': parseInt(d['pref.shelled_peanuts']),
			'safflower': parseInt(d['pref.safflower']),
			'corn': parseInt(d['pref.corn']),
		}
	}
}).then(function (data){
	let g = birdSVG.append('g')
	   .attr('transform', 'translate(50, 65)')

	// Set up axes and labels
	let groups = ['Class', 'Order', 'Superfamily', 'Family', 'Common Name', 'Weight (g)']
	let feeders = ['hopper','nyjer','tube','platform','ground','suet'];
	let seeds = ['black oil-sunflower','striped-sunflower','hulled-sunflower','millet','milo','nyjer','shelled-peanut','safflower','corn'];

	let headers = [['FEEDERS', 787.5, 320], ['HIERARCHY', 200, 400], ['SEED PREFERENCE', 1310, 500]]

	for(let i = 0; i < groups.length; i++){
		if(groups[i] !== 'Weight (g)'){
			g.append('text')
			 .text(groups[i])
			 .attr('font-size', 11)
			 .attr('x', i * 100)
			 .attr('y', -30)
			 .attr('text-anchor', 'middle')

			g.append('rect')
			 .attr('fill', '#eee')
			 .attr('width', 1)
			 .attr('height', height - 80)
			 .attr('x', i * 100)
			 .attr('y', 0)
		}else{
			g.append('text')
			 .text(groups[i])
			 .attr('font-size', 11)
			 .attr('x', i * 100 + 25)
			 .attr('y', -30)
			 .attr('text-anchor', 'middle')

			g.append('rect')
			 .attr('fill', '#eee')
			 .attr('width', 1)
			 .attr('height', height - 80)
			 .attr('x', i * 100 + 25)
			 .attr('y', 0)
		}
	}

	for(let i = 0; i < headers.length; i++){
		g.append('text')
		 .text(headers[i][0])
		 .attr('x', headers[i][1])
		 .attr('font-size', 11)
		 .attr('y', -55)
		 .attr('text-anchor', 'middle');
		g.append('rect')
		 .attr('width', headers[i][2])
		 .attr('height', 1)
		 .attr('x', headers[i][1] - headers[i][2]/2)
		 .attr('y', -50)
	}

	for(let i = 0; i < feeders.length; i++){
		if(feeders[i] !== ''){
			g.append('text')
			 .attr('font-size', 11)
			 .attr('x', 625 + i * 65)
			 .attr('y', -30)
			 .attr('id', feeders[i])
			 .attr('text-anchor', 'middle')
			 .style('text-transform', 'capitalize')
			 .text(feeders[i])

			g.insert('rect', 'ave')
			 .attr('fill', '#eee')
			 .attr('width', 1)
			 .attr('height', height - 80)
			 .attr('x', 625 + i * 65)
			 .attr('y', 0)
		}
	}

	for(let i = 0; i < seeds.length; i++){
		if(seeds[i] !== ''){
			let word = seeds[i].split('-');
			for(let j = 0; j < word.length; j++){
				g.append('text')
				.attr('font-size', 11)
				 .attr('x', 1050 + i * 65)
				 .attr('y', -30 - (word.length - 1)*5 + j * 10)
				 .attr('id', seeds[i])
				 .attr('text-anchor', 'middle')
				 .style('text-transform', 'capitalize')
				 .text(word[j])				
			}

			g.insert('rect', 'ave')
			 .attr('fill', '#eee')
			 .attr('width', 1)
			 .attr('height', height - 80)
			 .attr('x', 1050 + i * 65)
			 .attr('y', 0)
		}
	}

	// Build hierarchy tree
	let tree = d3.tree().size([625, 400]);
	let root = d3.hierarchy(hierarchy);
	tree(root);

	let links = g.selectAll('.link')
				 .data(root.descendants().slice(1))
				 .enter()
				 .append('path')
				 .attr('class', 'link')
				 .attr('fill', 'none')
				 .attr('stroke', 'black')
				 .attr('d', function(d) {
				  return  'M' + d.y + ',' + d.x
			         + 'C' + (d.y + d.parent.y) / 2 + ',' + d.x
      				 + ' ' + (d.y + d.parent.y) / 2 + ',' + d.parent.x
			        + ' ' + d.parent.y + ',' + d.parent.x;
				})

	let node = g.selectAll('.node')
				.data(root.descendants())
				.enter()
				.append('g')
				.attr('class', 'node')
				.attr('transform', function(d) { return 'translate(' + d.y + ',' + d.x + ')'; })
				.attr('id', function (d) {
					return d.data.name.replace(' ', '');
				})
 
	node.append('circle')
		.attr('r', function (d) {
			if(d.data.name !== ''){
				return 2
			}else{
				return 0
			}
		})
		.attr('id', function (d) {
					return 'circle_' + d.data.name.replace(' ', '');
				})
		.attr('fill', 'black');
 
 	node.append('rect')
 		.attr('fill', 'white')
		.attr('width', function(d){return d.data.name.length * 6.5})
		.attr('height', 13)
		.attr('transform', 'rotate(-30 0 0)')
		.attr('x', 3)
		.attr('y', -13)

	node.append('text')
		.attr('text-anchor', 'middle')
		.attr('transform', 'rotate(-30 0 0)')
		.attr('x', function(d){return d.data.name.length * 7/2})
		.attr('y', -4)
		.attr('font-size', 10)
		.style('text-transform', 'capitalize')
		.text(function(d) { return d.data.name; });

	let breaks = [465, 985, 560];
	for(let i = 0; i < breaks.length; i++){
		g.append('rect')
		 .attr('x', breaks[i])
		 .attr('y', 0)
		 .attr('width', 30)
		 .attr('height', height)
		 .attr('fill', 'white')		
	}

	// Add legend
	let legendData = [['Low Interest', 2.5], ['Moderate Interest', 5.5], ['High Interest', 10.5]];
	g.append('text')
	 .attr('x', 1700)
	 .attr('y', 50)
	 .attr('text-anchor', 'middle')
	 .attr('font-size', 11)
	 .text('Seed Preference')
	g.append('rect')
	 .attr('x', 1650)
	 .attr('y', 60)
	 .attr('width', 100)
	 .attr('height', 1)
	for(let i = 0; i < legendData.length; i++){
		g.append('circle')
		 .attr('r', parseInt(legendData[i][1]))
		 .attr('fill', 'black')
		 .attr('cx', 1650)
		 .attr('cy', 90 + i*40)
		g.append('text')
		 .text(legendData[i][0])
		 .attr('fill', 'black')
		 .attr('x', 1675)
		 .attr('font-size', 10)
		 .attr('y', 95 + i*40)
	}

	// Fill in individual bird data
	for(let i = 0; i < data.length; i++){
		let curNode = d3.select('#' + data[i].common_name.replace(' ', ''));
		let curNodeCircle = d3.select('#circle_' + data[i].common_name.replace(' ', ''));
		

		curNode.append('rect')
			   .attr('fill', '#eee')
			   .attr('width', width - 685)
			   .attr('height', 1)
			   .attr('x', 5)
			   .attr('y', 0)

		curNode.append('circle')
			   .attr('r', Math.sqrt(data[i].weight/Math.PI * 12))
			   .attr('fill', 'black')
			   .attr('cx', 125)
			   .attr('cy', 0)
		
		curNode.append('text')
				.text(Math.round(data[i].weight))
			   .attr('fill', 'white')
			   .attr('text-anchor', 'middle')
			   .attr('font-size', 8)
			   .attr('x', 125)
			   .attr('y', 3)

		for(let j = 0; j < feeders.length; j++){
			
			if(data[i].feeders[feeders[j]] === '1'){
				curNode.append('circle')
					   .attr('fill', 'white')
					   .attr('r', 15)
					   .attr('cx', 225.5 + (j * 65))
					   .attr('cy', 0)
				curNode.append('text')
					   .text('✓')
					   .attr('text-anchor', 'middle')
					   .attr('x', 225.5 + (j * 65))
					   .attr('y', 5)
			}
		}

		for(let j = 0; j < seeds.length; j++){
			let seed = seeds[j].replace('-',' ');
			if(data[i].seed_preference[seed] !== 0){
				curNode.append('circle')
						   .attr('fill', 'black')
						   .attr('r', function(d){
						   		return data[i].seed_preference[seed] * data[i].seed_preference[seed] + 1.5;
						   })
						   .attr('cx', 651 + (j * 65))
						   .attr('cy', 0)				
			}
		}
	}
});