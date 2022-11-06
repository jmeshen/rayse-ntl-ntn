const { Client, LogLevel } = require('@notionhq/client');

const { NOTION_API_TOKEN, NOTION_DATABASE_ID } = process.env;

async function addEmail(email, site) {
  // Initialize Notion client
  const notion = new Client({
    auth: NOTION_API_TOKEN,
    logLevel: LogLevel.DEBUG,
  });

  await notion.pages.create({
    parent: {
      database_id: NOTION_DATABASE_ID,
    },
    properties: {
      Email: {
        title: [
          {
            text: {
              content: email,
            },
          },
        ],
      },
      Site: {
        title: [
          {
            text: {
              content: site,
            },
          },
        ],
      },
    },
  });
}

function validateEmail(email) {
  const re = new RegExp(
    "([!#-'*+/-9=?A-Z^-~-]+(.[!#-'*+/-9=?A-Z^-~-]+)*|\"([]!#-[^-~ \t]|(\\[\t -~]))+\")@([!#-'*+/-9=?A-Z^-~-]+(.[!#-'*+/-9=?A-Z^-~-]+)*|[[\t -Z^-~]*])"
  );
  return re.test(String(email).toLowerCase());
}

module.exports.handler = async function (event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers':
      'Origin, X-Requested-With, Content-Type, Accept',
    'Content-Type': 'application/json',
  };
  console.log(event);
  // Check the request method
  try {
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 204,
        headers,
        body: JSON.stringify({ message: 'Successful preflight call' }),
      };
    }
    if (event.httpMethod === 'POST') {
      // Get the body
      const { email, site = null } = JSON.parse(event.body);

      if (!validateEmail(email)) {
        return { statusCode: 400, body: 'Email is not valid' };
      }

      // Store email in Notion
      await addEmail(email, site);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Successful signup' }),
      };
    }
    return {
      statusCode: 401,
      headers,
    };
  } catch (e) {
    console.error(e);
    return {
      statusCode: 500,
      body: e.toString(),
    };
  }
};
