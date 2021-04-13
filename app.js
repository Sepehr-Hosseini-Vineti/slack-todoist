const { App } = require('@slack/bolt');
const axios = require('axios');

const colors = require('./todoist_colors');
const PORT = process.env.PORT || 4000;

const { respondToProjectEvent, createProject } = require('./lib/todoist');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  // signingSecret: process.env.SLACK_SIGNING_SECRET,
  // clientId: process.env.SLACK_CLIENT_ID,
  // clientSecret: process.env.SLACK_CLIENT_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_WS_TOKEN,
  scopes: [
    'channels:read',
    'groups:read',
    'channels:manage',
    'chat:write',
    'incoming-webhook',
  ],
});

app.message('sepehr', async ({ message, say }) => {
  await say({
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `Hey there <@${message.user}>!`,
        },
        accessory: {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'Click Me',
          },
          action_id: 'button_click',
        },
      },
    ],
    text: `Hey there <@${message.user}>!`,
  });
});

function updateProjectBtnListeners(projects) {
  projects.forEach((project) => {
    app.action(`todo_project_${project.name}`, async ({ ack, say }) => {
      await respondToProjectEvent({ ack, say, project });
    });
    app.message(project.name.toLowerCase(), async ({ say }) => {
      await respondToProjectEvent({ say, project });
    });
  });
}

app.command('/create_task', async ({ body, ack, say }) => {
  const { text } = body;
  const { content, project } = parseTaskText(text);

  await ack();
  await createTask({ content, project });
});

app.command('/create_project', async ({ body, ack, say }) => {
  const { text: projectName } = body;

  await ack();
  await createProject(projectName);
  await say(`Created and selected: ${projectName}`);
});

app.command('/projects', async ({ ack, say }) => {
  // Acknowledge the action
  await ack();
  await say(`Fetching projects from Todoist`);

  const { data: projects } = await axios.get(
    `https://api.todoist.com/rest/v1/projects`,
    {
      headers: { Authorization: `Bearer ${process.env.TODOIST_TOKEN}` },
    }
  );

  const projectTitles = projects.map((proj) => proj.name);
  const projectTitlesBtn = projectTitles.map((title) => ({
    type: 'button',
    text: {
      type: 'plain_text',
      text: title,
    },
    action_id: `todo_project_${title}`,
  }));

  updateProjectBtnListeners(projects);

  await say({
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `Select a project`,
        },
      },
      {
        type: 'actions',
        elements: projectTitlesBtn,
      },
    ],
  });
});

app.error((error) => {
  console.error(error);
});

(async () => {
  await app.start();
})();
