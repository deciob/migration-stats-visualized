function transformData(data) {
  console.log([data[45], data[46], data[47]]);
  return data.filter(d => {
      if (d.CO2 === 'TOT' &&
      (d.Variable === 'Inflows of asylum seekers by nationality' ||
      d.Variable === 'Inflows of foreign population by nationality' ||
      d.Variable === 'Outflows of foreign population by nationality')) {
        return true;
      }
      return false;
    })
    .reduce((acc, d) => {
      let variable;

      switch (d.Variable) {
        case 'Inflows of asylum seekers by nationality':
          variable = 'asylumInflow';
          break;
        case 'Inflows of foreign population by nationality':
          variable = 'foreignInflow';
          break;
        default:
          variable = 'outflow';
      }

      if (acc[d.COU + d.YEA + variable]) {
        console.log('this should not happen!');
      } else {
        acc[d.COU + d.YEA + variable] = {
          country: d.Country,
          coCode: d.COU,
          value: +d.Value,
          year: +d.YEA,
          variable: variable,
        }
      }
      return acc;
    }, {});
}

module.exports.transformData = transformData;
