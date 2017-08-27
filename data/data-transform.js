const fs = require('fs');
const parse = require('csv-parse');
const Readable = require('stream').Readable;
const transformData = require('./helpers').transformData;


fs.unlinkSync(__dirname + '/data.json');

const rs = fs.createReadStream(__dirname + '/MIG_12082017123133656.csv');
const output = fs.createWriteStream(__dirname + '/data.json');
const s = new Readable;

const parser = parse({columns: true}, (err, data) => {
  const transformedData = transformData(data);
  output.write(JSON.stringify(Object.values(transformedData), null, 2));
  output.end(null);
});

rs.pipe(parser);
