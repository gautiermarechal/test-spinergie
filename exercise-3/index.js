const config = require("./configuration.json");
const completeChanges = require("./complete-changes.json");
const incompleteChanges = require("./partial-changes.json");
const globalErrorChanges = require("./global-error-changes.json");
const fs = require("fs");

function main(changesParam, mainMessage) {
  const errors = [];
  const unparsedChangesFieldsList = Object.keys(changesParam);
  const fieldsToChange = unparsedChangesFieldsList
    .map((field) => field.split(/\[([0-9]+)\]|\./))
    .map((line) => line.filter((key) => key !== "" && key !== undefined));
  const setNestedKey = (obj, path, value, entirePath) => {
    try {
      if (path.length === 1) {
        if (isNaN(parseInt(path))) {
          obj[path] = value;
        } else {
          obj[parseInt(path)] = value;
        }
        return obj;
      }
      return setNestedKey(obj[path[0]], path.slice(1), value);
    } catch (error) {
      errors.push(
        `Could not update the following path ${path} with the value ${JSON.stringify(
          value
        )}`
      );
    }
  };

  fieldsToChange.forEach((item, index) => {
    return setNestedKey(
      config,
      item,
      changesParam[unparsedChangesFieldsList[index]],
      item
    );
  });
  const jsonResult = JSON.stringify(config);

  fs.writeFile("configuration.json", jsonResult, "utf8", function (err) {
    console.log(mainMessage);
    if (err) throw err;
    if (errors.length > 0) {
      console.log(
        "The following error occured during mutation of the file: \n"
      );
      errors.forEach((err) => {
        console.log(errors);
      });
    }
    if (errors.length === fieldsToChange.length) {
      console.log("None of the mutation were successfull. Please try again.");
    }
    if (errors.length === 0) {
      console.log("File successfully updated");
    }
    if (errors.length > 0 && errors.length < fieldsToChange.length) {
      console.log("The rest of the mutation were successful!");
    }
    console.log("------------------------------------------------");
  });
}
main(completeChanges, "COMPLETE CHANGES: -------------------------");

main(incompleteChanges, " INCOMPLETE CHANGES: -------------------------");

main(globalErrorChanges, "GLOBAL ERROR CHANGES: -------------------------");
