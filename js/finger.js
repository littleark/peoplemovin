var Finger=new function(){
	var tm,$finger,iAm=true;
	this.init=function(show){
		$finger=$(".finger")
		if(show) {
			$finger.show().css({top:$finger.position().top+"px"});
		
			(function loop(){	
				$finger.animate({top:'+=15px'},500,function(e){
					$finger.animate({top:'-=15px'},500,function(e){
						tm=setTimeout(loop,10);
					})
				})
			})();
		}
	}
	this.remove=function(){
		if(iAm){
			clearTimeout(tm);
			if($finger)
				$finger.remove();
			iAm=false;
		}
	}
}