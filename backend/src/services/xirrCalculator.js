class XIRRCalculator {
    static calculateXIRR(cashFlows) {
      const npv = (rate) => {
        return cashFlows.reduce((total, [date, amount]) => {
          const days = (date - cashFlows[0][0]) / (1000 * 60 * 60 * 24);
          return total + amount / Math.pow(1 + rate, days / 365);
        }, 0);
      };
  
      let rate = 0.1;
      const tolerance = 0.000001;
  
      while (true) {
        const xnpv = npv(rate);
        const xnpv_dt = ((rate + 0.000001) - rate) * 365;
  
        if (Math.abs(xnpv) < tolerance) {
          return rate;
        }
  
        rate = rate - xnpv / xnpv_dt;
  
        if (Math.abs(rate) > 100) {
          throw new Error('Unable to converge');
        }
      }
    }
  }
  
  export default XIRRCalculator;