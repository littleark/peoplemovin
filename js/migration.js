(function($){
var PI=Math.PI,
	DEG_TO_RAD=PI/180,
	RAD_TO_DEG=180/PI,
	$host="support/getflows.php";





var MigrationFlow=new function(){

	var canvas,
		ctx;	
	
	window.people=[];
	
	
	this.stats=new Stats();
	this.timer=new Timer();
	this.flows=[];
	this.t=1;
	
	this.init=function(){
		
		document.body.appendChild(this.stats.domElement);
		
		canvas=document.getElementById("people_flow");

		if (canvas && canvas.getContext) {
			
			canvas.width=$("#map").width();
			canvas.height=$("#map").height();
			
			this.width=canvas.width;
			this.height=canvas.height;
			
			ctx=canvas.getContext("2d");
			
			setup();
			
			var that=this;

			(function getMigration(){
				$.ajax({
					url:$host,
					data:{},
					type:'POST',
					dataType: 'json',
					success: function(json){
						(function pushPeople(){
							//console.log(json);
							var temp_people=[];
							for(var i=0;i<json.length;i++) {
								//console.log(i)
								/*if(json[i]) {
									if(!people[i])
										people[i]=[];
									for(var j=0;j<json[i].length;j++) {*/
										try {
											var from=worldMap.getLocation({
												lat:countries[json[i]['from']].lat,
												lng:countries[json[i]['from']].lng,
											});
											var to=worldMap.getLocation({
												lat:countries[json[i]['to']].lat,
												lng:countries[json[i]['to']].lng,
											});
											
											var p=new People(that);
											p.position={x:from.x,y:from.y};
											p.destination={x:to.x,y:to.y};
											p.qta=json[i]['n'];
											p.setUp();
											people.push(p);
											temp_people.push(jQuery.extend(true, {}, p));
										} catch(err) {
											//console.log(json[i]);
										}
									//}
								//}
							}
							//for(var i=0;i<people.length;i++)
							//	console.log(people[i])
							//console.log(people);
							
							//people=temp_people;
							/*
							var temp_people=[];
							while(json.people.length) {
								var c=json.people.pop();
								//console.log(c);
								
								var p=new People(that);

								try {

									var loc=worldMap.getLocation({
										lat:countries[c[0]].lat,
										lng:countries[c[0]].lng,
									});
									console.log(loc);
									p.position={x:loc.x,y:loc.y};
								
									loc=worldMap.getLocation({
										lat:countries[c[1]].lat,
										lng:countries[c[1]].lng,
									});
									p.destination={x:loc.x,y:loc.y};

									p.qta=Math.ceil(c[2]);
								
									p.setUp();
									//for(var bbi=0;bbi<p.qta;bbi++)
									temp_people.push(p);
								} catch(err) {
									console.log(c);
								}
							};
							*/
							(function startFlow(){
									console.log(temp_people)
									setTimeout(function l(){
										var l=temp_people.length,i=0;
										while(i<l) {
											var p=temp_people[i];
											//console.log(that.t%p.qta);
											if((that.t%p.qta)==0){
												//console.log("add people "+i+" t:"+that.t+" qta:"+p.qta+" people.length="+people.length)
												people.push(jQuery.extend(true, {}, p))
											}
											i++;
										}
										//console.log("-----")
										that.t++;
										//that.t=that.t%people.length;
										startFlow();
									},250);
							}());
							
						})();
						
						
						(function gameLoop(){
								that.loop();
								requestAnimFrame(gameLoop,canvas);
								//window.setTimeout(gameLoop,Math.ceil(1000/60))
						})();
						
					}
				});
			}());
			
			
			

		} else {
			return false;
		}
		
	};
	function setup(){
		ctx.fillStyle="#ffffff";
	}
	this.loop=function(){
		this.clockTick=this.timer.tick();
		//console.log(this.t);
		this.update();
		this.draw();
		//this.t++;
		//this.t=this.t%people.length;
		//this.t=this.t%2711;
		this.stats.update();
	}
	
	this.update=function(){
		
		//console.log("update");
		
		var i=0,l=people.length;
		while(i<l) {
			if(people[i]){
				if(!people[i].update()) {
					people.remove(i);
				}
			}
			i++;
		}
		
	}
	
	this.draw=function(){
		//console.log("draw");
		//ctx.clearRect(0,0,canvas.width,canvas.height);
		ctx.save();
		ctx.globalCompositeOperation='source-in';
		ctx.fillStyle="rgba(255,255,255,0.8)";
		ctx.fillRect(0,0,canvas.width,canvas.height);
		ctx.restore();
		
		var i=0,l=people.length;
		while(i<l) {
			if(people[i]) {
				ctx.fillRect(people[i].position.x,people[i].position.y,2,2);
			}
			i++;
		}
	}
	
};

function Point( x, y ) {
  	this.position = { x: x, y: y };
	this.speed=50;
}
Point.prototype.distanceTo = function(p) {
  	var dx = p.x-this.position.x;
  	var dy = p.y-this.position.y;
  	return Math.sqrt(dx*dx + dy*dy);
};
Point.prototype.otherDistanceTo = function(p,max) {
  	var dx = max-this.position.x+p.x;
  	var dy = p.y-this.position.y;
  	return Math.sqrt(dx*dx + dy*dy);
};
Point.prototype.otherDistanceTo2 = function(p,max) {
  	var dx = this.position.x+(max-p.x);
  	var dy = p.y-this.position.y;
  	return Math.sqrt(dx*dx + dy*dy);
};
Point.prototype.clonePosition = function() {
  	return { x: this.position.x, y: this.position.y };
};


function People(flow) {
	Point.call(this);
	
	this.flow=flow;
	this.position = { x: 0, y: 0 };
	this.destination={x:0, y:0};
	this.qta=0;
	this.bunch=0;
	//this.src = 'src';
	//this.dst = 'dst';
	
	this.move={x:0,y:0};
	this.angle=0;

	this.distance=0;
	this.speed=50;
	
	this.son=false;
}
People.prototype = new Point();
People.prototype.setUp=function(){
	//console.log(this.destination.x+"-"+this.position.x)
	var deltaX=this.destination.x-this.position.x;
	var deltaY=this.destination.y-this.position.y;
	this.distance=this.distanceTo(this.destination);
	//console.log(deltaX+"<>"+this.flow.width/2)
	if(Math.abs(deltaX)>this.flow.width/2) {
		//console.log("other side");
		if(this.position.x>this.destination.x) {
			deltaX=this.flow.width-this.position.x+this.destination.x;
			this.distance=this.otherDistanceTo(this.destination,this.flow.width);
		} else {
			deltaX=-(this.position.x+(this.flow.width-this.destination.x));
			this.distance=this.otherDistanceTo2(this.destination,this.flow.width);
		}
		
	}
	
	this.original_distance=this.distance;
	this.move.x=this.speed/this.distance*deltaX;
	this.move.y=this.speed/this.distance*deltaY;
	
	this.clone = jQuery.extend(true, {}, this);
	
}
People.prototype.update=function(__clone){
	if(this.distance>0) {
		//console.log("updating "+this);
		this.position.x+=this.move.x*this.flow.clockTick+(-0.5+Math.random());
		if(this.position.x>this.flow.width)
			this.position.x=0;
		if(this.position.x<0)
				this.position.x=this.flow.width;
		this.position.y+=this.move.y*this.flow.clockTick+(-0.5+Math.random());
		this.distance-=this.speed*this.flow.clockTick;

		
		//if(__clone && this.qta>0 && this.clone && this.distance<this.original_distance-20 && !this.son) {
		/*
		if(__clone && this.clone && !this.son) {
			
			this.son=true;
			this.clone.clone=jQuery.extend(true, {}, this.clone);
			//this.clone.clone.qta--;
			people.push(this.clone);
		}
		*/
		
	} else {
		
		//console.log(this.qta)
		
		return false;
	}
	return true;
}
$("#map").bind('map:loaded', function(event) {
	MigrationFlow.init();
});
worldMap=new Map();
}(jQuery));