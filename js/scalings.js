function transformData(data, display, type, index, dataparams, params) {
	var outdata = data;
	
	switch(type) {
		case 0: // PTAs
			outdata = transformPTA(params);
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
			outdata = toEnergySpec(outdata);
			break;
	}
	return outdata;
}

// function transformPTA(data, params0, params) {
// 	var logfmin = Math.log(1.0/params.T);
// 	var logfmax = Math.log(1.0/params.deltaT);
// 	var numpoints = 25;
	
// 	var freqs = [Math.exp(logfmin-0.0001)];
// 	for (i=0; i<numpoints; i++) {
// 		freqs.push(Math.exp(logfmin + i*(logfmax-logfmin)/(numpoints-1)));
// 	}
	
// 	return freqs.map(function(f, index) {
// 		if (index == 0) {
// 			return [f, 1.0e-5];
// 		} else {
// 			var nnm1 = 0.5*params.Np*(params.Np-1);
// 			var Tfrac = params.deltaT / params.T;
// 			return [f, 233*2*params.deltatrms*Math.sqrt(Tfrac/nnm1)*f];
// 		}
// 	});
// }


function transformPTA(params) {
	// var logfmin = Math.log(1.0/(15*params.T));
	// var logfmax = Math.log(1.0/(params.deltaT));
	var logfmin = Math.log(1e-10);
	var logfmax = Math.log(1e-6);
	var numpoints = 100;
	
	var freqs = [Math.exp(logfmin-0.0001)];
	for (i=0; i<numpoints; i++) {
		freqs.push(Math.exp(logfmin + i*(logfmax-logfmin)/(numpoints-1)));
	}
	var fyr = 1/(365.25*24*3600);
	var fyr_idx = findClosestIndex(freqs, fyr);
	var f6mo_idx = findClosestIndex(freqs, fyr*2);
	// find 1/yr and 1/6mo and then artificially inflate the values
	// this is really Np_pairs^(1/4) (and the combinatorial factor of 2 is in the 96)
	var Np_pairs = Math.pow(params.Np*(params.Np-1), 0.25);
	function sqrt_noise_power(params, f) {
		return (2*params.deltatrms**2*(params.deltaT)+10**params.log10A_irn*(fyr/f)**(params.gamma_irn))**0.5;
		}
	function sqrt_sky_response(params, f) {
		return (1+1/(f*params.T))**3;
	}
	// h_c = Math.sqrt(f*S_eff)
	return freqs.map(function(f, index) {
		if (index == fyr_idx) {
			return [f, 40*34.06499*sqrt_noise_power(params,f)*f**(1.5)/Np_pairs*sqrt_sky_response(params,f)];
		} else if (index == f6mo_idx) {
			return [f, 2.5*34.06499*sqrt_noise_power(params,f)*f**(1.5)/Np_pairs*sqrt_sky_response(params,f)];
		} else {//constant is sqrt(12 pi^2)*96^(0.25)
			return [f, 34.06499*sqrt_noise_power(params,f)*f**(1.5)/Np_pairs*sqrt_sky_response(params, f)];
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
	
	var log10A_irn = "<div class=\"parameter\">\
		<label for='id" + index + "log10A_irn'>Log10 Amp of intrinsic red noise: </label>\
		<input type='text' class='log10A_irn' name='" + index + "log10A_irn' id='id" + index + "log10A_irn' value='" + params.log10A_irn + "' title='The log10 Amplitude of the intrinsic red noise in all pulsars.'>\
		</div>";

	var gamma_irn = "<div class=\"parameter\">\
		<label for='id" + index + "gamma_irn'>Spectral index of intrinsic red noise: </label>\
		<input type='text' class='gamma_irn' name='" + index + "gamma_irn' id='id" + index + "gamma_irn' value='" + params.gamma_irn + "' title='The spectral index of the intrinsic red noise in all pulsars.'>\
		</div>";
	
	return numPulsars + T + dt + dtrms + log10A_irn + gamma_irn;
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

function toEnergySpec(data) {
	var H0 = 3.240779291010696e-18;
	return data.map(function(val) {
		var f = val[0];
		var hc = val[1];
		return [f, 2*Math.pow(Math.PI*f*hc/H0,2)];
	});
}

function findClosestIndex(freqs, givenNumber) {
    let closestIndex = 0;
    let smallestDifference = Math.abs(freqs[0] - givenNumber);

    for (let i = 1; i < freqs.length; i++) {
        let difference = Math.abs(freqs[i] - givenNumber);
        if (difference < smallestDifference) {
            smallestDifference = difference;
            closestIndex = i;
        }
    }

    return closestIndex;
}
