const axios = require('axios');

async function respondToProjectEvent({ ack, say, project, index }) {
  ack && (await ack());

  const { data: todoTasks } = await axios.get(
    `https://api.todoist.com/rest/v1/tasks`,
    {
      params: {
        project_id: project.id,
      },
      headers: { Authorization: `Bearer ${process.env.TODOIST_TOKEN}` },
    }
  );

  await say({
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `Selected Project: "${project.name}"`,
        },
      },
      {
        type: 'divider',
      },
      ...todoTasks
        .map((todo, index) => [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `_#${++index}_) *${todo.content}*`,
            },
            accessory: {
              type: 'button',
              text: {
                type: 'plain_text',
                emoji: true,
                text: 'Done ',
              },
              value: `close_${todo.id}`,
            },
          },
          //  {
          //   type: 'context',
          //  elements: [
          // Buttons, TBD
          // ],
          // },
        ])
        .flat(),
      {
        type: 'divider',
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text:
            "Here's how to create a new task \n `/create_task Example Task [-p " +
            project.name +
            ']`',
        },
        accessory: {
          type: 'button',
          text: {
            type: 'plain_text',
            emoji: true,
            text: 'Create a task',
          },
          value: 'create_task',
        },
      },
    ],
  });
}

async function createProject(name) {
  await axios.post(
    `https://api.todoist.com/rest/v1/projects`,
    { name },
    {
      headers: { Authorization: `Bearer ${process.env.TODOIST_TOKEN}` },
    }
  );
}

async function createTask({ content, project }) {
  const params = { content };
  if (project) {
    const projectId = await fetchProjectId(project);
    Object.assign(params, { project_id: projectId });
  }

  await axios.post(`https://api.todoist.com/rest/v1/tasks`, params, {
    headers: { Authorization: `Bearer ${process.env.TODOIST_TOKEN}` },
  });
}

module.exports = {
  respondToProjectEvent,
  createProject,
  createTask,
};
