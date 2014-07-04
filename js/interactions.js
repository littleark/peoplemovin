var Interactions=new function(){
	var canvas,
		ctx;
	
	var boxes=[{y:0,h:50},{y:50,h:70},{y:120,h:180},{y:300,h:120},{y:420,h:140},{y:560,h:40}];
	
	var SCREEN_WIDTH = window.innerWidth;
	var SCREEN_HEIGHT = window.innerHeight;
	
	var mouseX = (window.innerWidth - SCREEN_WIDTH);
	var mouseY = (window.innerHeight - SCREEN_HEIGHT);
	var mouseIsDown = false;
	
	var y=0,
		tmp_y=[0,0];
	
	var input;
	
	this.init=function(canvas,height){
		if(support_canvas()){
			
			input=document.getElementById("val");
			
			canvas=document.getElementById(canvas);
			ctx=canvas.getContext("2d");
			
			canvas.height=height||canvas.height;
			
			boxes.push({y:canvas.height,h:0});
			
			
			ctx.fillStyle="#000000";
			ctx.strokeWidth=2;
			
			// Register event listeners
			document.addEventListener('mousemove', documentMouseMoveHandler, false);
			document.addEventListener('mousedown', documentMouseDownHandler, false);
			document.addEventListener('mouseup', documentMouseUpHandler, false);

			(function loop(){
				ctx.clearRect(0,0,canvas.width,canvas.height);
				y=update();
				draw();
				requestAnimFrame(loop,canvas);
			})();
			
		}
	}
	function update(){
		var i=0;
		while(i<boxes.length) {
			if(boxes[i].y>mouseY)
				return (i-1>=0)?i-1:0;
			i++;
		}
		return y;
	}
	/*
		60fps => 30f => [delta/30]
	*/
	/*
		due particelle. ognuna si sposta a scatti a velocita' diverse in punti diversi. il rettangolo le connette.
	*/
	function draw(){
			var dy=tmp_y[0]-boxes[y].y;
			
			if(dy!=0) {
				tmp_y[0]=tmp_y[0]+(dy>0?-1:1);
			}

			ctx.fillRect(250,boxes[y].y+dy,20,2);
			ctx.fillRect(280,boxes[y].y+boxes[y].h+dy,20,2);
	}
	function documentMouseMoveHandler(event){
		mouseX = event.clientX - (window.innerWidth - SCREEN_WIDTH) * .5 - 10;
		mouseY = event.clientY - (window.innerHeight - SCREEN_HEIGHT) * .5 - 10;
	}

	function documentMouseDownHandler(event){
		mouseIsDown = true;
	}

	function documentMouseUpHandler(event) {
		mouseIsDown = false;
	}
};