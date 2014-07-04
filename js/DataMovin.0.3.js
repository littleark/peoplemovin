/*!
 * datamovin JavaScript Library v0.3
 * http://datamov.in
 *
 * (c) Copyright 2011, Carlo Zapponi
 * Temporary licensed under the MIT license.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * Date: Sun Aug 01 00:05:56 2011 (CEST) +0200
 */
function DataMovin(){

	var canvas={},
		ctx={};
	
	var src={},
		dst={},
		lookup={src:[],dst:[]},
		current={src:[],dst:[]},
		label_reference=null;
	
	var margins={left:30,top:0,right:30,bottom:0},
		padding={left:0,right:0},
		step=4,
		box_w=10,
		orientation='vertical';
	
	var colors=new Colors();
	
	var areas={src:{},dst:{}};
	
	this.init=function(canvas,options) {
		if(!!document.createElement('canvas').getContext){

			label_reference=options.labels;

			var heights=initFlows(options.flows)
			if(!heights)
				return false;
			
			
			step=options.step||step;
			box_w=options.box_w||box_w;
			margins=options.margins||margins;

			

			padding={
				left:(heights.to-heights.from>0)?(heights.to-heights.from)/2:0,
				right:(heights.from-heights.to>0)?(heights.from-heights.to)/2:0
			};
			
			canvas=document.getElementById("flows");
			ctx=canvas.getContext("2d");
			ctx.lineCap = 'butt';
			orientation=options.orientation || orientation;
			if(orientation=='horizontal') {
				canvas.height=canvas.width;
				canvas.width=heights.from+margins.top+margins.bottom;
			} else {
				canvas.height=heights.from+margins.top+margins.bottom;
			}
			
			this.ctx=ctx;
			this.margins=margins;
			
			return this;
		} else {
			return null;
		}
	}
	this.getPointInfo=function(point_name,type) {
		var point={};
		switch(type){
			case 'src':
				point=src[point_name];
			break;
			case 'dst':
				point=dst[point_name];
			break;
		}
		if(!point)
			return null;
		return {
			name:point_name,
			x:point.x,
			y:point.y,
			w:point.w,
			h:point.h,
			type:type
		}
	}
	this.getCurrent=function(){
		return current;
	}
	this.checkCurrent=function(point,type){
		return (current[type].length>0 && current[type][0]==point);
	}
	function initFlows(flows) {
		if(!flows)
			return null;
		
		var src_values={max:0,min:10000},
			dst_values={max:0,min:1};
		
		for(var s in flows) {
			var source=flows[s];
			source.flow=0;
			for(var d in source.flows) {
				source.flow+=source.flows[d];
				if(!dst[d])
					dst[d]={flow:0,flows:{}};
				dst[d].flow+=source.flows[d];
				dst[d].flows[s]={flow:source.flows[d]};
				dst_values.max=Math.max(dst_values.max,dst[d].flow);
				source.flows[d]={flow:source.flows[d]};
			}
			src[s]=source;

			src_values.max=Math.max(source.flow,src_values.max);
			src_values.min=Math.min(source.flow,src_values.min);
		}
		var tot_from=0,tot_to=0;
		for(var s in src) {
			src[s].color=colors.getColor(Math.round(Math.map(src[s].flow,src_values.min,src_values.max,0,colors.length-1)));
			tot_from+=src[s].flow+step;
		}
		for(var d in dst) {
			dst[d].color=colors.getColor(Math.round(Math.map(dst[d].flow,dst_values.min,dst_values.max,50,colors.length-50)));
			tot_to+=dst[d].flow+step;
		}
		dst=iterateSorted(dst,label_reference);
		
		//this.dst=dst;
		//this.src=src;
		
		return {from:tot_from,to:tot_to};
	}
	function drawBoxes(boxes,start_x,start_y,labels) {
		var index=0,__y=start_y;
		
		for(var i in boxes) {
			var s=boxes[i];
			lookup[labels.type][__y]=i;
			if(!boxes[i].y)
				boxes[i].y=__y;
			if(!boxes[i].x)
				boxes[i].x=start_x;
			drawBox(start_x, __y, box_w, s.flow,{fill: "rgb("+s.color+")", stroke: "#f00", opacity: 1,"stroke-width":0});
			if(labels)
				drawLabel(i,start_x,__y,{w:box_w,h:s.flow},labels)
			for(var j in s.flows) {

				var to=boxes[i].flows[j];
				to.x=start_x;
				to.y=__y;
				to.w=box_w;
				__y+=to.flow;
				
			}
			__y+=step;
			boxes[i].w=box_w;
			boxes[i].h=s.flow;
		}
	}
	function drawBoxesHorizontal(boxes,start_x,start_y,labels) {
		var index=0,__x=start_x,__y=start_y;

		for(var i in boxes) {
			var s=boxes[i];
			lookup[labels.type][__x]=i;
			if(!boxes[i].x)
				boxes[i].x=__x;
			if(!boxes[i].y)
				boxes[i].y=start_y;
			drawBox(__x, start_y, s.flow,box_w,{fill: "rgb("+s.color+")", stroke: "#f00", opacity: 1,"stroke-width":0});
			if(labels)
				drawLabel(i,__x,start_y,{w:s.flow,h:box_w},labels)
			for(var j in s.flows) {

				var to=boxes[i].flows[j];
				to.y=__y;
				to.x=__x;
				to.w=box_w;
				__x+=to.flow;
				
			}
			__x+=step;
			boxes[i].w=s.flow;
			boxes[i].h=box_w;
		}
	}
	this.lookUp=function(y,lk_table_name) {
		var lk_table=lookup[lk_table_name];
		for(var i=y;i>=0;i--) {
			if(lk_table[i])
				return lk_table[i];
		}
	};
	this.getAreas=function(){
		return areas;
	}
	this.getCanvas=function(){
		return ctx.canvas;
	};
	this.getOrientation=function(){
		return orientation;
	}
	this.drawSources=function(){
		
		var x,y;
		switch(orientation) {
			case 'vertical':
				x = margins.left;
				y = margins.top+padding.left;
				
				//areas.src={x1:x,y1:y,x2:x+box_w};
				areas.src={x1:0,y1:y,x2:x+box_w+50};
				
				drawBoxes(src,x,y,{align:"left",valign:"center",orientation:orientation,type:"src"});
			break;
			case 'horizontal':
				x = margins.top;
				y = margins.top+padding.left;
				
				areas.src={x:x,y1:y,y2:y+box_w};
				
				drawBoxesHorizontal(src,x,y,{align:"center",valign:"top",orientation:orientation,type:"src"});
			break;
		}

	}
	this.drawDestinations=function(){
		
		var x,y;
		
		switch(orientation) {
			case 'vertical':
				x = ctx.canvas.width-margins.right-box_w;
				y = margins.top+padding.right;
			
				//areas.dst={x1:x,y1:y,x2:x+box_w};
				areas.dst={x1:x-50,y1:y,x2:ctx.canvas.width};
				
				drawBoxes(dst,x,y,{align:"right",valign:"center",orientation:orientation,type:"dst"});
			break;
			case 'horizontal':
				x = 0;///margins.left;
				y = ctx.canvas.height-margins.bottom-box_w;
				
				areas.dst={x1:x,y1:y,y2:y+box_w};
				
				drawBoxesHorizontal(dst,x,y,{align:"center",valign:"bottom",orientation:orientation,type:"dst"});
			break;
		}
		
	}
	this.drawOutFlow=function(point,clean){
		if(clean)
			this.clean();
		for(var c in src[point].flows)
			this.drawFlowFromTo(point,c);
		current.src.push(point);
	}
	this.drawInFlow=function(point,clean){
		if(clean)
			this.clean();
		if(dst[point] && dst[point].flows) {
			for(var c in dst[point].flows)
				this.drawFlowFromTo(c,point);
			current.dst.push(point);
		}
		
	}
	this.drawFlowFromTo=function(from,to,clean){
		
		var __from=src[from].flows[to],
			__to=dst[to].flows[from];
		
		if(clean) {
			this.clean();
			current.src.push(from);
			current.dst.push(to);
		}
		
		var info={
			color:src[from].color,
			color2:dst[to].color,
			"stroke-width":__from.flow
		};

		if(orientation=='horizontal') {
			drawCurve(__from.x+__from.flow/2, __from.y+__from.w,  __to.x+__from.flow/2, __to.y, info);
		} else {
			drawCurve(__from.x+__from.w, __from.y+__from.flow/2,  __to.x, __to.y+__from.flow/2, info);	
		}
		
	}
	this.animate=function(){
		var points=(function(){
				var c=[];
				for(var s in src) {
					c.push(s);
				}
				return c;
			}()),
			points_index=0;
		var that=this;
		(function loop(){
			if(src[points[points_index]] && src[points[points_index]].flows)
			for(var t in src[points[points_index]].flows)
				that.drawFlowFromTo(points[points_index],t)
			points_index++;
			setTimeout(loop,1000)
		}());
	}
	function drawBox(x,y,w,h,options){
		ctx.save();
		ctx.fillStyle=options.fill;
		ctx.fillRect(x,y,w,h);
		ctx.restore();
	}
	/*
		x,y => src
		zx,zy => dest
		ax,ay => src control point
		bx,by => dest control point
	*/
	function drawCurve(x, y, zx, zy, info) {
		ctx.save();
		if(info.color2) {
			var g = ctx.createLinearGradient(x, y, zx, zy);
			g.addColorStop(0,"rgba("+info.color+",0.75)");
			g.addColorStop(1,"rgba("+info.color2+",0.75)");
			ctx.strokeStyle=g;
		} else {
			ctx.strokeStyle="rgba("+info.color+",0.75)";
		}
		ctx.lineWidth=info['stroke-width'];
		ctx.lineCap = 'butt';
		
		ctx.beginPath();
		ctx.moveTo(x,y);
		
		if(orientation=='horizontal') {
			ctx.bezierCurveTo(
				x, (y+(zy-y)/1.5), 
				zx, (zy-(zy-y)/1.5), 
				zx, zy
			);
		} else {
			ctx.bezierCurveTo(
				zx-(zx-x)/3, y,
				x+(zx-x)/3, zy,
				zx, zy
			);
			/*
			ctx.bezierCurveTo(
				(x+(zx-x)/2), y,
				(x+(zx-x)/2), zy,
				zx, zy
			);
			*/
		}

		ctx.stroke();
		ctx.closePath();
		ctx.restore();
	}
	this.clean=function(){
		
		current.dst=[];
		current.src=[];
		
		switch(orientation) {
			case 'vertical':
				var x = margins.left+box_w,
					y = margins.top+padding.left,
					w = ctx.canvas.width-margins.right-box_w-x;
				
				//alert(x+","+y+","+w+","+(ctx.canvas.height-margins.top-margins.bottom))
				ctx.clearRect(x,y,w,ctx.canvas.height-margins.top-margins.bottom);
			break;
			case 'horizontal':
				x = 0;//margins.left;
				y = margins.top+box_w,
				h = ctx.canvas.height-margins.bottom-box_w-y;
				
				ctx.clearRect(x,y,ctx.canvas.width-margins.left-margins.right,h);
				
				
			break;
		}
		
	}
	function drawLabel(label,x,y,box,options) {
		ctx.font = options.font || "bold normal 10px Arial";
		ctx.textBaseline="middle";

		if(label_reference) {
			label=label_reference[label];
		}

		var d = ctx.measureText(label);
		ctx.save();
		ctx.fillStyle = options.color || 'rgba(255,255,255,1)';
		var temp_x=x,
			temp_y=y;
		switch(options.align) {
			case 'left':
				temp_x=x-d.width-5;
			break;
			case 'center':
				temp_x=x+(box.w/2-d.width/2);
			break;
			case 'right':
				temp_x=x+5+box.w;
			break;
		}
		switch(options.valign) {
			case 'top':
				temp_y=y-box.h/2;
			break;
			case 'center':
				temp_y=y+box.h/2;
			break;
			case 'bottom':
				temp_y=y+box.h+box.h/2;
			break;
		}

		ctx.fillText(label,temp_x,temp_y);
		ctx.restore();
	}
	
	return this;
};