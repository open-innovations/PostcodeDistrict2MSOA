(function(root){

	if(!root.OI) root.OI = {};

	root.OI.ready = function(f){
		if(/in/.test(document.readyState)) setTimeout('OI.ready('+f+')',9);
		else f();
	};
	


	OI.ready(function(){

		function sortObj(obj) {
			return Object.keys(obj).sort().reduce(function (result, key) {
				result[key] = obj[key];
				return result;
			}, {});
		}

		function Converter(input,output,mode){
	
			input.addEventListener('change',function(e){ OI.converter.update(); });
			mode.addEventListener('change',function(e){ OI.converter.update(); });

			this.setLookup = function(lookup){
				this.lookup = lookup;
				return this;
			}
			
			this.update = function(){
				
				var txt,lines,msoas,i,msoa,total,v,header;
				txt = input.value;

				lines = txt.split(/[\n\r]/);
				msoas = {};
				header = lines[0].split(/[,\t]/);
				for(i = 1; i < lines.length; i++){
					cols = lines[i].split(/[,\t]/);
					v = parseFloat(cols[1])||0;
					pcd = cols[0];
					if(this.lookup[pcd]){
						total = 0;
						for(msoa in this.lookup[cols[0]]) total += this.lookup[cols[0]][msoa];
						for(msoa in this.lookup[cols[0]]){
							if(!msoas[msoa]) msoas[msoa] = 0;
							if(mode.value=="sum"){
								msoas[msoa] += v;
							}else if(mode.value=="proportion"){
								msoas[msoa] += v*this.lookup[cols[0]][msoa]/total;
							}
						}
					}else{
						console.warn('Postcode '+pcd+' is not in the lookup table.');
					}
				}
				
				msoas = sortObj(msoas);
				
				csv = "MSOA11CD,Representative "+header[1]+"\n";
				console.log(sortObj(msoas));
				for(msoa in msoas){
					if(mode.value=="sum"){
						v = msoas[msoa];
					}else if(mode.value=="proportion"){
						v = msoas[msoa].toFixed(3);
					}
					//v = v.replace(/(.[0-9][0-9]*?)0+$/g,function(m,p1){ return p1; })
					csv += msoa+','+v+'\n';
				}
				output.value = csv;
			}
			return this;
		}
		
		
		fetch('lookup-pcd.json').then(response => {
			if(!response.ok) throw new Error('Network response was not OK');
			return response.json();
		}).then(data => {
			OI.converter.setLookup(data);
		}).catch(error => {
			console.error('There has been a problem with your fetch operation:', error);
		});

		OI.converter = new Converter(document.getElementById('input'),document.getElementById('output'),document.getElementById('mode'))
	});

})(window || this);