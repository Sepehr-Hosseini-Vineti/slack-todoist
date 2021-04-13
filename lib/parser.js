function parseTaskText(text) {
  if (text.indexOf('-p') != -1) {
    taskContent = text.slice(0, text.indexOf(' -p'));
  }

  return {
    taskContent,
  };
}

function parseTaskProject(text) {
    taskProject = text.slice(text.indexOf('-p') + 3);

const parseTaskProject = text => ({
  taskProject: text.slice(text.indexOf('-p') + 3);
});

module.exports = {
  parseTaskText,
};
