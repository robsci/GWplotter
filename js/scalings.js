function transformData(data, display, type, index, dataparams, params, observationtime) {
	var outdata = data;
	
	var T = 1.0e-6
	if ( observationtime > 0 ) { T = observationtime }
	
	switch(type) {
		case 0: // PTAs
			outdata = transformPTA(outdata, dataparams, params);
			break;
	}

	if(index==8){
		outdata = transformPulsars(outdata, dataparams, params);
	}

	if(index==7){
		outdata = transformSupernovae(outdata, dataparams, params);
	}
	
	if(index==6){
		outdata = transformCBC(outdata, dataparams, params);
	}

	switch(display) {
		case 1:
			outdata = toPSD(outdata);
			break;
		case 2:
			outdata = toEnergySpec(outdata, T);
			break;
	}
	return outdata;
}

function transformPTA(data, params0, params) {
	var logfmin = Math.log(1.0/params.T);
	var logfmax = Math.log(1.0/params.deltaT);
	var numpoints = 25;
	
	var freqs = [Math.exp(logfmin-0.0001)];
	for (i=0; i<numpoints; i++) {
		freqs.push(Math.exp(logfmin + i*(logfmax-logfmin)/(numpoints-1)));
	}
	
	return freqs.map(function(f, index) {
		if (index == 0) {
			return [f, 1.0e-5];
		} else {
			var nnm1 = 0.5*params.Np*(params.Np-1);
			var Tfrac = params.deltaT / params.T;
			return [f, 233*2*params.deltatrms*Math.sqrt(Tfrac/nnm1)*f];
		}
	});
}

function transformPulsars(data, params0, params) {
	
	return data.map(function(val, index) {
		y=val[1]*(params.A/params0.A);
		return [val[0], y];
	});
}

function transformSupernovae(data, params0, params) {
	
	return data.map(function(val, index) {
		y=val[1]*(params0.D/params.D);
		return [val[0], y];
	});
}

function transformCBC(data, params0, params) {
	
	return data.map(function(val, index) {
		y=val[1]*(params0.A/params.A);
		return [val[0], y];
	});
}

function PTAoptions(index, params) {
	var numPulsars = "<div class=\"parameter\">\
		<label for='id" + index + "Np'>Number of pulsars: </label>\
		<input type='text' class='Np' name='" + index + "Np' id='id" + index + "Np' value='" + params.Np + "' title='Total number of pulsars in the PTA, which are assumed to be identical, and randomly distributed on the sky. The characteristic strain ~ 1/N.'>\
		</div>";
	
	var dtrms = "<div class=\"parameter\">\
		<label for='id" + index + "dtrms'>Timing precision (s): </label>\
		<input type='text' class='dtrms' name='" + index + "dtrms' id='id" + index + "dtrms' value='" + params.deltatrms.toExponential() + "' title='The RMS error on each timing measurement. Errors assumed to be Gaussian and independent. The characteristic strain ~ dt.'>\
		</div>";
		
	var dt = "<div class=\"parameter\">\
		<label for='id" + index + "dt'>Cadence (days): </label>\
		<input type='text' class='dt' name='" + index + "dt' id='id" + index + "dt' value='" + params.deltaT / (24*60*60) + "' title='Time between each pulsar observation. The characteristic strain ~ sqrt(dt).'>\
		</div>";
	
	var T = "<div class=\"parameter\">\
		<label for='id" + index + "T'>Length of observation (yrs): </label>\
		<input type='text' class='T' name='" + index + "T' id='id" + index + "T' value='" + params.T / (365.25 * 24 * 60 * 60) + "' title='Time between the first and last pulsar observations. The characteristic strain ~ 1/sqrt(T), and the lower frequency cut-off is equal to 1/T.'>\
		</div>";
	
	return numPulsars + T + dt + dtrms;
}

function Pulsarsoptions(index, params) {
	var A = "<div class=\"parameter\">\
		<label for='id" + index + "Amp'>Amplitude Scale: </label>\
		<input type='text' class='Amp' name='" + index + "Amp' id='id" + index + "Amp' value='" + params.A + "' title='The default amplitude corresponds to the spin down limit on the Crab pulsar (i.e. the amplitude of GWs if the pulsar spin-down is entirely due to GW emission). Changing this value scales the amplitude. The characteristic strain is proportional to the ellipticity of the pulsar divided by distance.'>\
		</div>";
	return A;
}

function Supernovaeoptions(index, params) {
	var A = "<div class=\"parameter\">\
		<label for='id" + index + "Dist'>Distance (kpc): </label>\
		<input type='text' class='Dist' name='" + index + "Dist' id='id" + index + "Dist' value='" + params.D + "' title='We consider supernova of fixed intrinsic amplitude given by Dimmelmeier et at. (2002). The characteristic strain ~1/D.'>\
		</div>";
	return A;
}

function CBCoptions(index, params) {
	var A = "<div class=\"parameter\">\
		<label for='id" + index + "AmpCBC'>Distance: </label>\
		<input type='text' class='AmpCBC' name='" + index + "AmpCBC' id='id" + index + "AmpCBC' value='" + params.A + "' title='test text'>\
		</div>";
	return A;
}

function toPSD(data) {
	return data.map(function(val) {
		var f = val[0];
		var hc = val[1];
		return [f, hc/Math.sqrt(f)];
	});
}

function toEnergySpec(data,T) {
	var H0 = 3.240779291010696e-18;
	return data.map(function(val) {
		var f = val[0];
		var hc = val[1];
		return [f, 2*Math.pow(Math.PI*f*hc/H0,2)/Math.sqrt(f*T)];
	});
}
