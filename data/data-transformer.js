const fs = require('fs');
const parse = require('csv-parse');
const Readable = require('stream').Readable


const rs = fs.createReadStream(__dirname + '/MIG_12082017123133656.csv');
const output = fs.createWriteStream(__dirname + '/data.json');
const s = new Readable;

const parser = parse({columns: true}, (err, data) => {
  const transformedData =
    data.filter(d => {
      if (d.variable === 'Inflows of foreign population by nationality' ||
        d.variable === 'Inflows of asylum seekers by nationality') {
        return true;
      }
      return false;
    })
    .reduce((acc, d) => {
      const asylum = d.variable === 'Inflows of asylum seekers by nationality';
      const variable = asylum ? 'asylumInflow' : 'foreignInflow';
      if (acc[d.COU + d.YEA + variable]) {
        acc[d.COU + d.YEA + variable].value += +d.Value;
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

  output.write(JSON.stringify(Object.values(transformedData), null, 2));
  output.end(null);
});

rs.pipe(parser);
