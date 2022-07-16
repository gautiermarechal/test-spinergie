const config = require("./configuration.json");
const changes = require("./changes.json");
const fs = require("fs");

function main(changesParam) {
  const unparsedChangesFieldsList = Object.keys(changesParam);
  const fieldsToChange = unparsedChangesFieldsList
    .map((field) => field.split(/\[([0-9]+)\]|\./))
    .map((line) => line.filter((key) => key !== "" && key !== undefined));
  const setNestedKey = (obj, path, value) => {
    if (path.length === 1) {
      if (isNaN(parseInt(path))) {
        obj[path] = value;
      } else {
        obj[parseInt(path)] = value;
      }
      return obj;
    }
    return setNestedKey(obj[path[0]], path.slice(1), value);
  };

  fieldsToChange.forEach((item, index) => {
    return setNestedKey(
      config,
      item,
      changesParam[unparsedChangesFieldsList[index]]
    );
  });
  const jsonResult = JSON.stringify(config);

  fs.writeFile("configuration.json", jsonResult, "utf8", function (err) {
    if (err) throw err;
    console.log("File successfully updated");
  });
}

main(changes);
