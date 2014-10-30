$( document ).ready(function() {
	// ** Define global variables **
	var updateDate = "30th October 2014";

	var plotDisplay = 0;
	var yLabels = ["Characteristic Strain","\u221A( Power Spectral Density / Hz\u207B\u00B9 )","\u03A9 h\u00B2\u2081\u2080\u2080"];
	
	var detectors = [];
	var sources = [];
	
	var datasets = [];
	
	// ** Functions to format axis labels **
	function isInteger(str) {
		return /([0-9])/.test(str);
	}
	
	function toUnicode(str, superscript) {
		var chars = str.split("");
		//console.log(chars);
		var uchars = [];
		for (i = 0; i < chars.length; i++) {
			if (chars[i] == " ") {
				uchars.push(" ");
			} else if (isInteger(chars[i]) && superscript) {
				var hexString;
				switch (parseInt(chars[i])) {
					case 1:
						hexString = "00B9";
						break;
					case 2:
					case 3:
						hexString = "00B" + chars[i];
						break;
					default:
						hexString = "207" + chars[i];
						break;
				}
				uchars.push(String.fromCharCode(parseInt(hexString,16)));
			} else if (chars[i] == "-") {
				uchars.push("\u207B");
			} else {
				uchars.push(chars[i]);
			}
		}
		//console.log(uchars);
		return uchars.join("");
	}
	
	function expFormatter(val, axis) {
		var num = val.toExponential().toString().split("e");
		var ex = num[1].split("+");
		//return "10" + toUnicode(ex[ex.length-1], true);
		return "10\ne"+ex[ex.length-1];
	}
	
	function wrapText(context, text, x, y, lineHeight) {
        var cars = text.split("\n");
        for (var ii = 0; ii < cars.length; ii++) {
            context.fillText(cars[ii], x, y);
            y += lineHeight;
        }
     }
	
	// ** Define plot options **
	var globalOptions = {
		canvas: true,
		legend: {
			show: false
		},
		series: {
			shadowSize: 0
		},
		lines: {
			show: true
		},
		points: {
			show: false
		},
		xaxis: {
			min: 0.4e-10,
			max: 1.2e6,
			font: {
				size: 16,
				weight: "bold",
				color: "black",
				family: "Helvetica"
			},
			ticks: [1e-10, 1e-8, 1e-6, 1e-4, 1e-2, 1e0, 1e2, 1e4, 1e6],
			tickFormatter: expFormatter,
			tickLength: 10,
			labelHeight: 60,
			transform: function (v) { return Math.log(v); },
			inverseTransform: function (v) { return Math.exp(v); }
		},
		yaxis: {			
			font: {
				size: 16,
				weight: "bold",
				color: "black",
				family: "Helvetica"
			},
			labelWidth: 80,
			tickFormatter: expFormatter,
			tickLength: 10,
			transform: function (v) { return Math.log(v); },
			inverseTransform: function (v) { return Math.exp(v); }
		},
		hooks: {
			draw: [drawhook],
			drawOverlay: [makePlotImg]
		}
	};
	
	function options(opt) {
		var xmin = parseFloat($('#idplotfmin' + plotDisplay.toString()).val());
		opt.xaxis.min = isNaN(xmin) ? opt.xaxis.min : xmin;
		
		var xmax = parseFloat($('#idplotfmax' + plotDisplay.toString()).val());
		opt.xaxis.max = isNaN(xmax) ? opt.xaxis.max : xmax;
		
		var ymin = parseFloat($('#idplotymin' + plotDisplay.toString()).val());
		opt.yaxis.min = isNaN(ymin) ? opt.yaxis.min : ymin;
		
		var ymax = parseFloat($('#idplotymax' + plotDisplay.toString()).val());
		opt.yaxis.max = isNaN(ymax) ? opt.yaxis.max : ymax;
		
		switch (plotDisplay) {
			case 0:
				opt.yaxis.ticks = [1e-26, 1e-24, 1e-22, 1e-20, 1e-18, 1e-16, 1e-14, 1e-12];
				break;
			case 1:
				opt.yaxis.ticks = [1e-26, 1e-22, 1e-18, 1e-14, 1e-10, 1e-6];
				break;
			case 2:
				opt.yaxis.ticks = [1e-15, 1e-12, 1e-9, 1e-6, 1e-3, 1e0, 1e3];
				break;
		}
		return opt;
	}
     
    // ** Plot graph ** 
    function makePlotImg(plot, context) {
    	var canvas = plot.getCanvas();
    	if (true || 0.9*window.innerWidth < 1000) {
			var imgcanvas = document.createElement('canvas');
			imgcanvas.width = 0.9*window.innerWidth < 1000 ? 0.9*window.innerWidth : 1000;
			imgcanvas.width = imgcanvas.width < 500 ? 500 : imgcanvas.width;
			imgcanvas.height = imgcanvas.width * 0.637;
			var imgctx = imgcanvas.getContext("2d");
			imgctx.drawImage(canvas, 0, 0, imgcanvas.width, imgcanvas.height);
			$('#canvasImg').attr('src', imgcanvas.toDataURL());
		} else {
			$('#canvasImg').attr('src', canvas.toDataURL());
		}
    }
    
    function drawhook(plot, context) {
    	var canvas = plot.getCanvas();
		var ctx = canvas.getContext("2d");
		ctx.font="normal normal bold 14px Helvetica";
		
		var display = plot.getOptions().plotDisplay;
		plot.getOptions().choiceIndexes.forEach(function(index) {
			if (datasets[index].loaded) {
				//console.log(datasets[index]);
				var o = plot.pointOffset({ 
					x: datasets[index].labelpos[display][0],
					y: datasets[index].labelpos[display][1]
				});
				ctx.fillStyle = datasets[index].color;
				wrapText(ctx, datasets[index].plotlabels[display], o.left, o.top, 16);
			}
		});
		
		ctx.fillStyle = "rgb(0,0,0)";
		ctx.font="normal normal bold 18px Helvetica";
		ctx.textAlign = "center";
		ctx.fillText("Frequency / Hz", 540, 620);
		
		ctx.save();
		ctx.translate(20, 289);
 		ctx.rotate(-Math.PI/2);
 		ctx.fillText(yLabels[display], 0, 0);
 		ctx.restore();
		
		//makePlotImg(canvas);
    }
    
	function plotChoices(choiceIndexes, display) {
		//console.log("Plotting data.");
		var data = [];
		
		choiceIndexes.forEach(function(index) {
			if (datasets[index].loaded) {
				if (datasets[index].type < 0) { // source
					data.unshift(datasets[index].plotdata(display));
				} else { // detector
					data.push(datasets[index].plotdata(display));
				}
			}
		});
		
		var opt = options(globalOptions);
		opt.choiceIndexes = choiceIndexes;
		opt.plotDisplay = display;
		
		var plot = $.plot("#placeholder", data, opt);		
		return plot;
	}
	
	function plotGraph(display) {
		//console.log(datasets);
		var choices = $("#options").find("input.choice:checked");
		var choiceIndexes = [];
		
		var deferreds = [];
		choices.each(function () {
			var index = $(this).attr("name");
			if (index && datasets[index]) {
				if (!datasets[index].loaded) {
					deferreds.push(datasets[index].load());
				};
				choiceIndexes.push(index);
			};
		});
		
		if (deferreds.length > 0) {
			$.when.apply($, deferreds).done(function() { return plotChoices(choiceIndexes, display); });
		} else {
			return plotChoices(choiceIndexes, display);
		}
	}
	
	// ** Define dataset object **
	function dataset(obj) {
		this.name = obj.name;
		this.hcdatafile = obj.datafile;
		this.index = datasets.length;
		this.loaded = false;
		
		this.type = obj.type;
		this.color = obj.color;
		
		this.plotlabels = obj.plotlabels;
		this.labelpos = obj.labelpos;
		
		if (obj.hasOwnProperty('params')) {
			this.params = obj.params;
			this.dataparams = $.extend({}, obj.params);
		} else {
			this.params = {};
			this.dataparams = {};
		}
		
		if (this.type >= 0) {
			detectors.push(this.index);
		} else {
			sources.push(this.index);
		}
		
		if (this.type == 0) { // PTAs don't require datafiles to be loaded
			this.loaded = true;
			this.hcdata = [];
		}
		
		this.plotdata = function(display) {
			//display = typeof display !== 'undefined' ? display : plotDisplay;
			var outdata = {};
			outdata.data = transformData(this.hcdata, display, this.type, this.dataparams, this.params);
			outdata.color = this.color;
			if (this.type < 0) {
				try {
					var ymin = Math.log(parseFloat($('#idplotymin' + display.toString()).val()));
					var ymax = Math.log(parseFloat($('#idplotymax' + display.toString()).val()));
					var datamax = Math.log(Math.max.apply(null, outdata.data.map(function(val) {return val[1];})));
				}
				catch(e) {
					console.log(e);
					var ymin = 0.0;
					var ymax = 1.0;
					var datamax = 0.8;
				}
				var colorGradient = [];
				for (var i=0; i<10; i++) {
					var op = 0.7*(i/9)*(ymax-ymin)/(datamax-ymin);
					if (op > 1.0) { op = 1.0; }
					colorGradient.push({opacity: op});
				}
				
				outdata.lines = {
					lineWidth: 0,
					fill: true,
					fillColor: { 
						colors: colorGradient
					}
				}
			}
			return outdata;
		};
		
		// ** load dataset from JSON file **
		this.load = function() {
			var curr = this;
			//console.log("Loading " + this.hcdatafile);
			return $.ajax({
				url: curr.hcdatafile,
				type: "GET",
				dataType: "json",
				success: function(data) {
					//console.log(data);
					curr.loaded = true;
					curr.hcdata = data["data"];
					curr.populate(plotDisplay);
					//console.log(curr);
					//console.log("Finished " + curr.hcdatafile);
				}
			});
		};
		
		// ** return menu option to display this dataset **
		this.optionHTML = function() {
			var checkbox = "<input type='checkbox' class='choice' name='" + this.index + "' id='id" + this.index + "'></input>";
			var label = "<label for='id" + this.index + "'>" + this.name + "</label>";
			return "<td class=\"check\">" + checkbox + "</td><td class=\"label\">" + label + "</td>";
		};
		
		this.optionRow = function() {
			var id = "";
			switch (this.type) {
				case 0:
					id = "pulsar-timing";
					break;
				case 1:
					id = "ground-based";
					break;
				case 2:
					id = "space-based";
					break;
				case -1:
					id = "v-low-freq";
					break;
				case -2:
					id = "low-freq";
					break;
				case -3:
					id = "high-freq";
					break;
			}
			return id;
		};
		
		// ** return placeholder for dataset parameters **
		this.parameterHTML = function() {
			var button = "<div class=\"expand-button\" id='expand"+this.index+"'><div class=\"arrow-down\"></div></div>";
			return "<td class='check'></td><td class='label' style=\"position:relative;\">"+button+"<div class=\"parameters\" id=\"parameters"+this.index+"\"></div></td>";
		};
		
		// ** populate parameters placeholder with options **
		this.populate = function(display) {
			var html = "";
			if (true || this.loaded) {
				if (this.type == 0) { // add PTA options
					html += PTAoptions(this.index, this.params);
				}
			
				var color = "<div class=\"parameter\">\
					<label for='id" + this.index + "color'>Colour: </label>\
					<input type='text' class='color' name='" + this.index + "color' id='id" + this.index + "color' value='" + this.color + "' title='Colour may be specified using RGB values (eg rgb(0,0,0)), hex value (#000000), or by name (Black).'>\
					</div>";
				html += color;
					
				var plotlabel = "<div class=\"parameter\">\
					<label for='id" + this.index + "label'>Plot label: </label>\
					<textarea class='plot-label' rows='2' name='" + this.index + "label' id='id" + this.index + "label'>" + this.plotlabels[display] + "</textarea>\
					</div>";
				html += plotlabel;
				
				var labelposx = "<div class=\"parameter\">\
					<label for='id" + this.index + "labelx'>Label position (x): </label>\
					<input type='text' class='labelposx' name='" + this.index + "labelposx' id='id" + this.index + "labelposx' value='" + this.labelpos[display][0].toExponential() + "'>\
					</div>";
				html += labelposx;
				
				var labelposy = "<div class=\"parameter\">\
					<label for='id" + this.index + "labely'>Label position (y): </label>\
					<input type='text' class='labelposy' name='" + this.index + "labelposy' id='id" + this.index + "labelposy' value='" + this.labelpos[display][1].toExponential() + "'>\
					</div>";
				html += labelposy;
			} else {
				html += "<div class=\"parameter\">\
					<label>Check the box to see plot options</label>\
					</div>";
			}
			$('#parameters' + this.index).html(html);
		};
	}
	
	function toggleElements(list, bool) {
		$.each(list, function(idx, val) {
			$('#id' + val).prop('checked', bool);
		});
		plotGraph(plotDisplay);
	}
	
	function addNewPTA() {
		var PTAobj = {
			"name" : "Custom PTA", 
			"datafile" : "", 
			"type" : 0, 
			"color" : "rgb(0,0,0)", 
			"plotlabels" : ["PTA", "PTA", "PTA"], 
			"labelpos" : [[2.0e-6, 3.0e-14], [2.0e-6, 0.4e-10], [1.80e-6, 0.001]], 
			"params" : {
				"T" : 20*365.25*24*60*60, 
				"deltaT" : 1.20960e6, 
				"deltatrms" : 1.0e-7, 
				"Np" : 100.0
			}
		};
		var PTAdataset = new dataset(PTAobj);
		datasets.push(PTAdataset);
		$("#" + PTAdataset.optionRow()).append(PTAdataset.optionHTML());
		$("#" + PTAdataset.optionRow() + "-options").append(PTAdataset.parameterHTML());
	}
	
	// ** load list of datasets **
	$.ajax({
		url: "data/files.json",
		type: "GET",
		dataType: "json",
		success: function(series) {
			var defaults = [];
			$.each(series, function(key, value) {
				var thisdataset = new dataset(value);
				datasets.push(thisdataset);
				$("#" + thisdataset.optionRow()).append(thisdataset.optionHTML());
				$("#" + thisdataset.optionRow() + "-options").append(thisdataset.parameterHTML());
				if (value.default > 0) {
					defaults.push(thisdataset.index);
				}
			});
			$("#options").on('click', 'input.choice', function() { plotGraph(plotDisplay); })
			.on('click', 'input.display', function() {
				plotDisplay = parseInt($(this).val());
				plotGraph(plotDisplay);
				$("div.parameters").slideUp(function() {$(this).html("");});
				$("div.plotparams").slideUp();
				$("div.arrow-up").toggleClass("arrow-up arrow-down");
			})
			.on('click', '#selectalldetectors', function() {
				toggleElements(detectors, true);
			})
			.on('click', '#clearalldetectors', function() {
				toggleElements(detectors, false);
			})
			.on('click', '#selectallsources', function() {
				toggleElements(sources, true);
			})
			.on('click', '#clearallsources', function() {
				toggleElements(sources, false);
			})
			.on('click', '#addNewPTA', addNewPTA)
			.on('click', '#plotreset', function() {
				$('#idplotfmin0,#idplotfmin1,#idplotfmin2').val(0.4e-10.toExponential());
				$('#idplotfmax0,#idplotfmax1,#idplotfmax2').val(1.2e6.toExponential());
				$('#idplotymin0,#idplotymin1').val(1e-26.toExponential());
				$('#idplotymin2').val(1e-15.toExponential());
				$('#idplotymax0').val(1.1e-12.toExponential());
				$('#idplotymax1').val(1.1e-6.toExponential());
				$('#idplotymax2').val(1.1e3.toExponential());
				plotGraph(plotDisplay);
			})
			.on('click', 'div.expand-button', function() {
				if ($(this).children("div").hasClass("arrow-down")) {
					var id = $(this).attr('id');
					if (id.charAt(0) == 'e') {
						datasets[$(this).attr('id').substring(6)].populate(plotDisplay);
					}
				}
				$(this).siblings("div.parameters").slideToggle();
				$(this).siblings("div.plotparams").slideToggle();
				$(this).children("div").toggleClass("arrow-up arrow-down");
			})
			.on('change', '#plot-options input', function() {
				plotGraph(plotDisplay);
			})
			.on('change', 'input.color', function() {
				var newcolor = $(this).val();
				datasets[$(this).attr('name').slice(0,-5)].color = newcolor;
				plotGraph(plotDisplay);
			})
			.on('change', 'textarea.plot-label', function() {
				var newlabel = $(this).val();
				datasets[$(this).attr('name').slice(0,-5)].plotlabels[plotDisplay] = newlabel;
				plotGraph(plotDisplay);
			})
			.on('change', 'input.labelposx', function() {
				var newval = parseFloat($(this).val());
				if (!isNaN(newval)) {
					datasets[$(this).attr('name').slice(0,-9)].labelpos[plotDisplay][0] = newval;
					plotGraph(plotDisplay);
				}
			})
			.on('change', 'input.labelposy', function() {
				var newval = parseFloat($(this).val());
				if (!isNaN(newval)) {
					datasets[$(this).attr('name').slice(0,-9)].labelpos[plotDisplay][1] = newval;
					plotGraph(plotDisplay);
				}
			})
			.on('change', 'input.Np', function() {
				var newval = parseInt($(this).val());
				if (!isNaN(newval)) {
					datasets[$(this).attr('name').slice(0,-2)].params.Np = newval;
					plotGraph(plotDisplay);
				}
			})
			.on('change', 'input.T', function() {
				var newval = parseFloat($(this).val())*(365.25*24*60*60);
				if (!isNaN(newval)) {
					datasets[$(this).attr('name').slice(0,-1)].params.T = newval;
					plotGraph(plotDisplay);
				}
			})
			.on('change', 'input.dt', function() {
				var newval = parseFloat($(this).val())*(24*60*60);
				if (!isNaN(newval)) {
					datasets[$(this).attr('name').slice(0,-2)].params.deltaT = newval;
					plotGraph(plotDisplay);
				}
			})
			.on('change', 'input.dtrms', function() {
				var newval = parseFloat($(this).val());
				if (!isNaN(newval)) {
					datasets[$(this).attr('name').slice(0,-5)].params.deltatrms = newval;
					plotGraph(plotDisplay);
				}
			});
			toggleElements(defaults, true);
			$('#content').css("padding-top", $('#header').css("height"));
			$('#version').html("Last Updated " + updateDate);
		}
	});
	
	$("#customise_button").click(function() {
		$('html, body').animate({
			scrollTop: $("#tablehead").offset().top - parseInt($('#header').css("height").slice(0,-2))
			    }, 1000);
	});
	
	function plotResize() {
		var width = Math.round(window.innerWidth*0.9);
		var height = Math.round(width*0.637);
		$('#placeholder').css('width', width.toString()+"px").css('height', height.toString()+"px");
	}
	
	$(window).on("scroll touchmove", function() {
		$('#header').toggleClass('smaller', $(document).scrollTop() > 20);
		var headheight = parseInt($('#header').css("height").slice(0,-2));
		$('#content').css("padding-top", String(Math.max(headheight+20,100))+"px");
	}).on("resize", function() {
		var headheight = parseInt($('#header').css("height").slice(0,-2));
		$('#content').css("padding-top", String(Math.max(headheight+20,100))+"px");
	});	
});

