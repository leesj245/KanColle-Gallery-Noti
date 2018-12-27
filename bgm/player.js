"use strict";
!function(){
	const key_table = [6657, 5699, 3371, 8909, 7719, 6229, 5449, 8561, 2987, 5501, 3127, 9319, 4365, 9811, 9927, 2423, 3439, 1865, 5925, 4409, 5509, 1517, 9695, 9255, 5325, 3691, 5519, 6949, 5607, 9539, 4133, 7795, 5465, 2659, 6381, 6875, 4019, 9195, 5645, 2887, 1213, 1815, 8671, 3015, 3147, 2991, 7977, 7045, 1619, 7909, 4451, 6573, 4545, 8251, 5983, 2849, 7249, 7449, 9477, 5963, 2711, 9019, 7375, 2201, 5631, 4893, 7653, 3719, 8819, 5839, 1853, 9843, 9119, 7023, 5681, 2345, 9873, 6349, 9315, 3795, 9737, 4633, 4173, 7549, 7171, 6147, 4723, 5039, 2723, 7815, 6201, 5999, 5339, 4431, 2911, 4435, 3611, 4423, 9517, 3243];
	const bgm_usage = [];

	Array.prototype.groupBy = function(keySelector){
		const result = {};
		this.forEach(function(_){
			const key = keySelector(_);
			if( !(key in result) ) result[key] = [];
			result[key].push(_);
		});
		return result;
	};

	const player = document.querySelector(".bgm-player > audio");
	player.volume = 0.5; // Default value

	const updatePlaying = function(elem){
		var target = document.querySelector(".bgm-playing");

		target.querySelector(".bgm-no").innerHTML = elem.querySelector(".bgm-no").innerHTML;
		target.querySelector(".bgm-title").innerHTML = elem.querySelector(".bgm-title").innerHTML;
		target.querySelector(".bgm-origin").innerHTML = elem.querySelector(".bgm-origin").innerHTML;
	}
	const playBGM = function(elem){
		const host = "http://203.104.209.183/kcs2/resources/bgm/{type}/{filename}.mp3";
		const localhost = "./local/{type}.{filename}.mp3";
		const getPostfixKey = function(type){
			let k = 0;
			if(type !== null && type !== ""){
				for(let i=0; i<type.length; i++)
					k += type.charCodeAt(i);
			}
			return k;
		};

		updatePlaying(elem);
		const _id = elem.getAttribute("data-id");

		let id = _id;
		if( /[0-9]/.test(id[0]) )
			id = parseInt(id);
		else
			id = parseInt(id.substr(1));

		let _host = host, type = "";
		switch(_id[0]){
			case 'f':
				type = 'fanfare';
				break;
			case 'b':
				type = 'battle';
				break;
			case 'B':
				_host = localhost;
				type = 'battle';
				break;
			case 'd':
				_host = localhost;
				type = 'deprecated';
				break;
			default:
				type = "port";
				break;
		}

		const key_length = ("bgm_"+type).length;
		const postfix_key = getPostfixKey("bgm_"+type);
		const postfix = (17 * (id + 7) * key_table[(postfix_key + id * key_length) % 100] % 8973 + 1000)
		const url = _host
			.replace("{type}", type)
			.replace("{filename}", ("00"+id).substr(-3) + "_" + postfix);

		player.src = url;
		player.play();
		return false;
	};
	const RequestJSON = function(url, callback){
		const xhr = new XMLHttpRequest();
		xhr.open("GET", url);
		xhr.addEventListener("loadend", function(){
			if(xhr.readyState==4)
				callback(xhr.responseText, xhr);
		});
		xhr.overrideMimeType("application/json");
		xhr.send();
	};

	window.currentLocale = "ko";
	const Locales = {};
	const getLocale = function(id, target){
		const _default = id + "." + target;

		if(currentLocale in Locales){
			const locale = Locales[currentLocale];
			const parts = target.split(".");

			let current = locale[id];
			if(typeof current=="undefined") return _default;

			for(let i=0; i<parts.length; i++){
				if( !(parts[i] in current) ) return _default;
				current = current[parts[i]];
			}

			return current;
		}else
			return _default;
	};

	const updateLocale = function(){
		const getMapName = function(world, map, detailed){
			if(detailed){
				if(world > 20){
					return getLocale("world"+world, "tr") + " E-" + map;
				}else{
					return world + "-" + map;
				}
			}else{
				return (world > 20 ? "E" : world) + "-" + map;
			}
		};
		const mapJoin = function(array){
			if(array===null || array.length===0) return array;

			const buffer = [];
			let i, offset = 0;

			for(i=1; i<array.length; i++){
				if((array[i-1].world !== array[i].world) || (array[i-1].map+1 !== array[i].map)){
					if( array[i-1].world===array[offset].world && array[i-1].map===array[offset].map ){
						buffer.push(
							getMapName(array[i-1].world, array[i-1].map, true)
						);
					}else{
						buffer.push(
							getMapName(array[offset].world, array[offset].map, true)
							+ "~"
							+ getMapName(array[i-1].world, array[i-1].map, false)
						);
					}
					offset = i;
				}
			}
			if( array[i-1].world===array[offset].world && array[i-1].map===array[offset].map ){
				buffer.push(
					getMapName(array[i-1].world, array[i-1].map, true)
				);
			}else{
				buffer.push(
					getMapName(array[offset].world, array[offset].map, true)
					+ "~"
					+ getMapName(array[i-1].world, array[i-1].map, false)
				);
			}
			return buffer;
		};

		const items = document.querySelectorAll(".bgm-item");
		for(let i=0; i<items.length; i++){
			const item = items[i];
			if(item.parentNode.id === "templates") continue;

			const id = item.getAttribute("data-id");

			let tr = getLocale(id, "tr");
			if(tr === id+".tr") tr = item.querySelector(".bgm-origin").innerHTML;

			item.querySelector(".bgm-title").innerHTML = tr;

			if( item.querySelector(".bgm-desc")!==null ){
				let hint = getLocale(id, "desc.hint");
				if(hint === id+".desc.hint") hint = "";

				if(item.querySelector(".bgm-desc-hint"))
					item.querySelector(".bgm-desc-hint").innerHTML = hint;

				if(getLocale(id, "desc.jukebox")===true)
					item.querySelector(".bgm-jukebox").setAttribute("data-jukebox", "1");

				const types = ["furniture", "map", "scene"];
				for(let j=0; j<types.length; j++){
					const type = types[j];
					const list = getLocale(id, "desc." + type);

					const listelem = item.querySelector('.bgm-desc-list[data-type="'+type+'"]');
					if(!listelem) continue;
					listelem.innerHTML = "";

					if(Array.isArray(list)){
						for(let k=0; k<list.length; k++){
							const li = document.createElement("li");
							li.setAttribute("data-type", type);
							li.innerHTML = list[k];
							listelem.appendChild(li);
						}
					}
				}

				const listelem = item.querySelector('.bgm-desc-list[data-type="map"]');
				if(listelem===null) continue;

				const subType = [
					getLocale("battle_normal", "text"),
					getLocale("battle_boss", "text")
				];
				const usage = bgm_usage.filter(x => x.id == id);
				if(usage.length > 0){
					{
						const list = usage.filter(x => x.type==="map").groupBy(x => x.world<=20 ? "n" : x.world);
						for(let _ in list){
							const text = mapJoin(list[_]).join(", ");
							if(text.length > 0){
								const li = document.createElement("li");
								li.innerHTML = text + " " + getLocale("battle_map", "text");
								listelem.appendChild(li);
							}
						}
					}

					for(let j=0; j<4; j+=2){
						const list = usage.filter(x => x.type==="battle").groupBy(x => x.world<=20 ? "n" : x.world);
						for(let _ in list){
							const text1 = mapJoin(list[_].filter(x => x.sub === j)).join(", ");
							const text2 = mapJoin(list[_].filter(x => x.sub === j+1)).join(", ");

							if(text1.length > 0 && text1 === text2){
								const li = document.createElement("li");
								li.innerHTML = text1 + " " + subType[j / 2] + getLocale("battle_all", "text");
								listelem.appendChild(li);
							}else{
								if(text1.length > 0){
									const li1 = document.createElement("li");
									li1.innerHTML = text1 + " " + subType[j / 2] + getLocale("battle_day", "text");
									listelem.appendChild(li1);
								}
								if(text2.length > 0){
									const li2 = document.createElement("li");
									li2.innerHTML = text2 + " " + subType[j / 2] + getLocale("battle_night", "text");
									listelem.appendChild(li2);
								}
							}
						}
					}
				} // usage.length
			}
		}

		const elems = document.querySelectorAll("[data-format]");
		for(let i=0; i<elems.length; i++){
			let format = elems[i].getAttribute("data-format");
			const postfix = elems[i].getAttribute("data-postfix");

			format = format.replace(/\{([^\}]+)\}/g, function(match, capture){
				const parts = capture.split(".");
				const name = parts[0];
				parts.splice(0, 1);
				return getLocale(name, parts.join("."));
			});
			elems[i].innerHTML = format + postfix;

			if(elems[i].id.length>0){
				const anchors = document.querySelectorAll("a[href=\"#"+elems[i].id+"\"]");
				for(let j=0; j<anchors.length; j++)
					anchors[j].innerHTML = format;
			}
		}
	};
	const buildBGMCard = function(id, name, simpled){
		const externalLinks = [
			"",
			"https://www.youtube.com/watch?v=D2uqpqrYmMY"
		];
		const template = document.querySelector(
			simpled
				? "#templates .bgm-wrapper-simple"
				: "#templates .bgm-wrapper"
		).cloneNode(true);

		if(name===null) name = getLocale(id, "name");

		const itemElem = template.querySelector(".bgm-item");
		itemElem.setAttribute("data-id", id);
		template.querySelector(".bgm-no").innerHTML = id;
		template.querySelector(".bgm-origin").innerHTML = name;

		const target = (simpled ? template : itemElem);
		if(typeof id==="string" && id[0]==='E'){
			target.addEventListener("click", function(e){
				e.preventDefault();

				var link = document.createElementNS("http://www.w3.org/1999/xhtml", "a");
				link.href = externalLinks[id.substr(1)];
				link.target = '_blank';
				var event = new MouseEvent('click', {
					'view': window,
					'bubbles': false,
					'cancelable': true
				});
				link.dispatchEvent(event);

				return false;
			});
		}else{
			target.addEventListener("click", function(e){
				e.preventDefault();
				playBGM(itemElem);
				return false;
			});
		}
		return template;
	};

	// Build DOM
	const buildContents = function(){
		// mst_bgm
		!function(){
			const port = document.querySelector('[data-group="port"]');
			if(!port) return;

			jsonDatas.mst_bgm_placeholder.forEach(function(x){
				if( jsonDatas.mst_bgm.filter(y => y.api_id === x.api_id).length>0 ) return;

				jsonDatas.mst_bgm.push(x);
			});
			jsonDatas.mst_bgm.sort((a, b) => a.api_id - b.api_id);

			for(let i=0; i<jsonDatas.mst_bgm.length; i++){
				const item = jsonDatas.mst_bgm[i];
				const id = item.api_id;

				const template = buildBGMCard(id, item.api_name, false);
				port.appendChild(template);
			}
		}();

		// mst_mapbgm
		!function(){
			const mst_mapdata = jsonDatas.mst_mapbgm
				.filter(function(x){ return x.api_maparea_id < 20 })
				.concat(jsonDatas.events);
			bgm_usage.splice(0, bgm_usage.length);

			// orderby, groupby
			mst_mapdata.sort((a, b) => a.api_id - b.api_id);
			const data = mst_mapdata.groupBy(x => x.api_maparea_id);

			for(let world in data){
				let parent = document.querySelector('[data-group="battle"]');
				if(parseInt(world)>20) parent = document.querySelector('[data-group="event'+world+'"]');

				const template = document.querySelector("#templates .bgm-map-group").cloneNode(true);
				template.setAttribute("data-world", world);
				parent.appendChild(template);

				const maps = data[world].length;
				const table = template.querySelector(".bgm-table");
				table.style["grid-template-columns"] = "auto repeat("+maps+", 1fr)";

				const header = table.querySelector(".table-title");
				header.style["grid-column"] = "1/"+(maps+2);
				if(world>20)
					header.innerHTML = getLocale("world"+world, "tr");
				else
					header.innerHTML = getLocale("world", "tr").replace("{0}", world) + ": " + getLocale("world"+world, "tr");

				const moving_bgm = [];
				!function(){
					let current = data[world][0].api_moving_bgm;
					let offset = 0;
					for(let i=1; i<maps; i++){
						const value = data[world][i].api_moving_bgm;
						if( value != current ){
							moving_bgm.push({ bgm:current, starts:offset, ends:i-1 });
							current = value;
							offset = i;
						}
					}
					moving_bgm.push({ bgm:current, starts:offset, ends:maps-1 });

					for(let i=0; i<moving_bgm.length; i++){
						const prefix = (typeof moving_bgm[i].bgm==="number" ? "b" : "");
						const bgm = prefix+moving_bgm[i].bgm;
						const cell = document.createElement("div");
						cell.style["grid-column"] = (moving_bgm[i].starts+2) + "/"  + (moving_bgm[i].ends+3);
						cell.style["grid-row"] = "3 / 4";
						cell.appendChild( buildBGMCard(bgm, null, true) );
						table.appendChild(cell);

						for(let j=moving_bgm[i].starts; j<=moving_bgm[i].ends; j++){
							bgm_usage.push({
								type: "map",
								id: bgm,
								world: parseInt(world),
								map: j+1,
								sub: 0
							});
						}
					}
				}();

				const maptable = [];
				for(let i=0; i<maps; i++) {
					maptable[i] = [
						data[world][i].api_map_bgm[0],
						data[world][i].api_map_bgm[1],
						data[world][i].api_boss_bgm[0],
						data[world][i].api_boss_bgm[1],
					];
				}

				for(let i=0; i<maps; i++){
					const mapitem = data[world][i];
					const map = mapitem.api_no;

					const map_title = document.createElement("div");
					map_title.className = "table-map";
					map_title.innerHTML = (world>20 ? "E" : world)+"-"+map;
					map_title.style["grid-column"] = (i+2)+" / "+(i+3);
					table.appendChild(map_title);

					for(let j=0; j<4; j++){
						if( maptable[i][j] === -1 ) continue; // Spanned
						const cell = document.createElement("div");
						const prefix = (typeof maptable[i][j]==="number" ? "b" : "");
						const bgm = maptable[i][j];

						let span_row = 1;
						while( j+span_row<5 && bgm===maptable[i][j+span_row] ){
							maptable[i][j+span_row] = -1;
							span_row++;
						}
						let span_col = 1, end = false;
						while( i+span_col<maps ){
							for(let y=j; y<j+span_row; y++){
								if( maptable[i+span_col][y]!==bgm ){
									end = true;
									break;
								}
							}
							if(end) break;

							for(let y=j; y<j+span_row; y++)
								maptable[i+span_col][y] = -1;

							span_col++;
						}

						cell.style["grid-column"] = (i+2)+" / "+(i+span_col+2);
						cell.style["grid-row"] = (j+4)+" / "+(j+span_row+4);
						cell.appendChild( buildBGMCard(prefix+bgm, null, true) );
						table.appendChild(cell);

						for(let x=i; x<i+span_col; x++)
							for(let y=j; y<j+span_row; y++)
								bgm_usage.push({
									type: "battle",
									id: prefix+bgm,
									world: parseInt(world),
									map: x+1,
									sub: y
								});
					}
				}

				bgm_usage.sort(function(a, b){
					const x = (a.world+"-"+a.map+"-"+a.sub);
					const y = (b.world+"-"+b.map+"-"+b.sub);
					return x.localeCompare(y, undefined, {sensitivity: "base", numeric:true});
				});

				// Build list-style cards
				const id_list = bgm_usage
					.filter(x => x.world === parseInt(world))
					.map(x => x.id)
					.filter((x, p, self) => self.indexOf(x) == p);

				id_list.forEach(function(id){
					const usage = bgm_usage.filter(x => x.id === id);
					const target = document.querySelector('.bgm-map-group[data-world="'+world+'"] .group-bgm-list');

					target.appendChild( buildBGMCard(id, null, false) );
				});
			}
		}();

		// mst_deprecated
		!function(){
			const deprecated = document.querySelector('[data-group="deprecated"]');
			if(!deprecated) return;

			for(let i=0; i<jsonDatas.mst_deprecated.length; i++){
				const item = jsonDatas.mst_deprecated[i];
				const id = item.api_id;

				const template = buildBGMCard(id, item.api_name, false);
				deprecated.appendChild(template);
			}
		}();

		updateLocale();
	};

	// Load external json
	const jsonDatas = {};
	!function(){
		const jsonHost = "https://raw.githubusercontent.com/Tibo442/api_start2/master/parsed/";
		const jsonList = [
			{ id: "mst_bgm", file: "api_mst_bgm.json" },
			{ id: "mst_mapbgm", file: "api_mst_mapbgm.json" },
			{ id: "events", file: "events.json", local: true },
			{ id: "mst_bgm_placeholder", file: "mst_bgm.json", local: true },
			{ id: "mst_deprecated", file: "mst_deprecated.json", local: true }
		];
		let counter = 0;

		for(let i=0; i<jsonList.length; i++){
			!function( data ){
				RequestJSON((data.local ? "./" : jsonHost) + data.file, function(res){
					jsonDatas[ data.id ] = JSON.parse(res);

					if( ++counter == jsonList.length )
						buildContents(); // All loaded
				});
			}( jsonList[i] );
		}
	}();

	const LoadLocale = function(locale, callback){
		RequestJSON("./"+locale+".json", function(res){
			Locales[locale] = JSON.parse(res);
			if(callback) callback();
		});
	};
	LoadLocale("ko", updateLocale);

	!function(){
		const anchors = document.querySelector(".contents").querySelectorAll("h1,h2,h3,h4,h5,h6");
		const navigator = document.querySelector("#navigator_list");

		for(let i=0; i<anchors.length; i++){
			if(anchors[i].id !== "") continue;
			anchors[i].id = "anc_"+i;

			const li = document.createElement("li");
			const anc = document.createElement("a");
			anc.innerHTML = anchors[i].innerHTML;
			anc.href = "#anc_"+i;
			li.appendChild(anc);
			navigator.appendChild(li);
		}
	}();

	window.scrollTo(0, 0);
}();