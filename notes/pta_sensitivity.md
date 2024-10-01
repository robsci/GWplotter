# PTA Background Sensitivity Notes

### Jeremy G. Baier, 2024

This addendum contains notes for the updated pulsar timing array (PTA) sensitivity curves for the gravitational wave background. Note that this addendum has not been formally peer reviewed.

We will start from the realistic sensitivity curves presented in eq. 92 of *Hazboun et al. (2019)*, [1], 

```math
S_{\text{eff}}(f) = \left( \sum_I \sum_{J > I} \frac{T_{IJ}}{T_{\text{obs}}} \frac{\chi_{IJ}^2}{S_I(f) S_J(f)} \right)^{-1/2}\tag{1}
```

where $S_{eff}$ is the effective background sensitivity (strain-noise power spectral density) in units of $\rm strain^2/Hz$. $T_{obs}$ is the total observational time span of the detector, $T_{IJ}$ is the overlapping observational time span between pulsars $I$ and $J$, and $\chi_{IJ}$ are the Hellings Downs coeffients. $S_I$ is the strain-nosie power spectral density for pulsar $I$ defined as,

```math
S_{I}(f) = \frac{1}{\mathcal{N}_I^{-1}(f)\mathcal{R}(f)}=\frac{12\pi^2f^2}{\mathcal{N}_I^{-1}(f)}\,\tag{2}
```

where $\mathcal{N}_I^{-1}(f)$ is the noise-weighted inverse transmission function for pulsar $I$ defined by eq. 19 in H19.

We now wish to incorporate the following simplifying assumptions from *Moore et al. 2015* [2] (and *GW Plotter*):
- the PTA pulsars are uniformly distributed across the sky
- all pulsars have identical noise properties
- all pulsars have been observed for the entire PTA timespan
- all pulsars have the same, fixed observational cadence

As we will discuss later, we relax the assumption of no red noise.

Assuming a uniform distribution of pulsars across the sky, we marginalize the square of Hellings and Downs coefficients over this uniform distribution, which yields $\frac{1}{48}$. Next, we assume that all the pulsars in the PTA are observed for the full timespan of the dataset, meaning that their overlapping timespans are each equal to the timespan of the data set as well,

```math
S_{\text{eff}}(f) = \left( \sum_I \sum_{J > I} \frac{1}{48\space S_I(f) S_J(f)} \right)^{-1/2}.
\tag{3}
```

Assuming that all the pulsars have independent and identically distributed noise properties and are observed with the same cadence, $S_I \approx S_J$, so that,

```math
S_{\text{eff}}(f) = \left(\frac{N_{\rm psr}\left(N_{\rm psr}-1\right)}{2*48 \space S_I(f)^2} \right)^{-1/2}.
\tag{4}
```

From Equation 2 it follows that,

```math
S_{\text{eff}}(f) = \left(\frac{96}{N_{\rm psr}\left(N_{\rm psr}-1\right)} \right)^{1/2}\frac{12\pi^2f^2}{\mathcal{N}^{-1}_I(f)}.
\tag{5}
```

The noise-weighted inverse transmission function, $\mathcal{N}^{-1}_I(f)$, is a response function which effectively absorbs power as a result of fitting to a timing model. In practice, the computation of $\mathcal{N}^{-1}_I(f)$ is the most expensive part of a sensitivity curve calculation, so we seek to approximate it. For a PTA with red noise(s),

```math
\mathcal{N}^{-1}_I(f) \approx \frac{\mathcal{T}_I(f)}{P_{\rm N}(f)}
\tag{6}
```

where $\mathcal{T}$ is a transmission function and $P_{\rm N}(f)$ is the power in the noise. See Section 2 in [1] for a more in depth discussion of PTA transmission functions and the validity of this approximation. We can further approximate,

```math
\mathcal{T}_I(f) \approx \left(1+\frac{1}{T_{\rm obs}f}\right)^{-6}
\tag{7}
```

as in done in [3]. (See [4] for more details on tranmissions function approximations.) In order to simulate the effect of the timing model fit to the solar system barycenter and parallax parameters, under this simplified tranmission function, we can artificially add characteristic insensitivities at frequencies of $1/\rm yr$ and $1/(2\rm yr)$.

Other than white noise, the dominant source of noise is PTAs is a red noise due to changes in the dispersion measure so we let,

```math
P_{N}=P_{\rm WN}+P_{\rm DM} = 2\Delta t\sigma^2 + A_{\rm DM}f^{-\gamma_{\rm DM}}\,
\tag{8}
```

where $\sigma$ is the time of arrival uncertainty and $\Delta t$ is the time between observations and the changes in dispersion measure are modeled as red noise and parameterized by a power law with amplitude $A$ and spectral index $\gamma$.

Thus under the assumptions above,

```math
S_{\text{eff}}(f) \approx 12\pi^2f^2\space P_{N,I}\left(\frac{96}{N_{\rm psr}\left(N_{\rm psr}-1\right)}  \right)^{1/2}\left(1+\frac{1}{Tf}\right)^{6}.
\tag{9}
```

This can be converted to characteristic strain sensitivity via,

```math
h_c=\sqrt{f*S_{eff}}.
\tag{10}
```


## References

1) Hazboun, J. S., Romano, J. D., Smith, T. L. (2019). Realistic sensitivity curves for pulsar timing arrays. *Physical Review D*, 100(10), 104028.

2) Moore, C. J., Cole, R. H., & Berry, C. P. L. (2015). Gravitational-wave sensitivity curves. Classical and Quantum Gravity, 32(1), 015014. [arXiv:1408.0740](https://arxiv.org/abs/1408.0740)

3) Babak, S., Falxa, M., Franciolini, G., & Pieroni, M. (2024). Forecasting the sensitivity of Pulsar Timing Arrays to gravitational wave backgrounds. arXiv e-prints, arXiv:2404.02864. [https://doi.org/10.48550/arXiv.2404.02864](https://doi.org/10.48550/arXiv.2404.02864)

4) Jennings, Ross (2021). Transmission Functions for Polynomial Fits. NANOGrav Memorandum 006. [https://nanograv.org/sites/default/files/2022-10/NANOGrav-Memo-006.pdf](https://nanograv.org/sites/default/files/2022-10/NANOGrav-Memo-006.pdf)
