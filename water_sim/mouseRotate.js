var mouseDown = false;
var dx = 0;
var dy = 0;
var zoomD = 0;
var mouse = [0,0];
var mouseNormalized = new THREE.Vector2(-1, -1);
var mouseSlowFactor = 333;

function onMouseMove(e){
	e.preventDefault();
	if(mouseDown){
		dx += e.clientX - mouse[0];
		dy += e.clientY - mouse[1];

		mouse = [e.clientX, e.clientY];

	}

	mouseNormalized.x = (e.clientX/window.innerWidth)*2 - 1;
	mouseNormalized.y = -(e.clientY/window.innerHeight)*2 + 1;
}

function onTouchMove(e) {
	e.preventDefault();

	var t = e.touches[0];
	dx += (t.pageX - mouse[0])/2;
	dy += (t.pageY - mouse[1])/2;
	mouse = [e.pageX, e.pageY];
}

function onMouseDown(e){
	e.preventDefault();
	mouseDown = true;
	mouse = [e.clientX, e.clientY];
}

function onMosueUp(e){
	e.preventDefault();
	mouseDown = false;
}

function onLeaveWindow(e){
	mouseDown = false;
}

function onScroll(e){
	e.preventDefault();
	var d = e.wheelDelta;
	if(d === undefined){
		d = -e.detail;
	}

	zoomD += d;
}

function onResize(){
	console.log('resize')
	camera.aspect = window.innerWidth/window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight)
}

function doMouse(c){
	c.addEventListener('mousemove', onMouseMove);
	c.addEventListener('touchmove', onTouchMove);

	c.addEventListener('mousedown', onMouseDown);
	c.addEventListener('mouseup', onMosueUp);

	c.addEventListener('mouseout', onLeaveWindow);
	c.addEventListener('DOMMouseScroll', onScroll);
	c.addEventListener('mousewheel', onScroll);
	window.onresize = onResize;
}
doMouse();

function updateRotation(){
	if(holdObj != undefined){
		holdObj.rotation.y += dx/mouseSlowFactor;
		dx -= dx/5;

		holdObj.rotation.x += dy/(mouseSlowFactor);
		dy -= dy/5;
		if(Math.abs(camera.position.z) > 9 || zoomD > 0){
			camera.position.z += zoomD/11;
			zoomD -= zoomD/3;
		}else{
			zoomD = 0;
		}
	}
}

updateRotation();