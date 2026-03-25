const {
  generateSubtasks
} = require('../services/taskIntelligenceService');

function handleTaskIntelligence(req, res) {
  const taskTitle = typeof req.body?.taskTitle === 'string' ? req.body.taskTitle.trim() : '';

  if (!taskTitle) {
    res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: 'taskTitle é obrigatório.' }));
    return;
  }

  console.log('Task Intelligence executed:', taskTitle);

  const subtasks = generateSubtasks(taskTitle);

  res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(
    JSON.stringify({
      subtasks
    })
  );
}

module.exports = {
  handleTaskIntelligence
};
