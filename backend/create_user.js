const AWS = require('aws-sdk');
const crypto = require('crypto');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function generateUuidV4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function usageAndExit() {
  console.log('Usage: node create_user.js --email EMAIL --name NAME --password PASSWORD [--table TABLE] [--dry-run]');
  process.exit(1);
}

function parseArgs() {
  const args = {};
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') {
      args.dryRun = true;
      continue;
    }
    if (a === '--email') { args.email = argv[++i]; continue; }
    if (a === '--name') { args.name = argv[++i]; continue; }
    if (a === '--password') { args.password = argv[++i]; continue; }
    if (a === '--table') { args.table = argv[++i]; continue; }
    if (a === '--help' || a === '-h') usageAndExit();
  }
  return args;
}

(async function main() {
  const opts = parseArgs();
  if (!opts.email || !opts.name || !opts.password) {
    usageAndExit();
  }

  const tableName = opts.table || process.env.USERS_TABLE;

  const userId = generateUuidV4();
  const hashedPassword = hashPassword(opts.password);

  const user = {
    email: opts.email,
    userId: userId,
    name: opts.name,
    password: hashedPassword,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (opts.dryRun || !tableName) {
    console.log('Dry run: user item to insert:');
    console.log(JSON.stringify(user, null, 2));
    if (!tableName) console.log('\nNote: no table specified (use --table or set USERS_TABLE env var) — dry-run only.');
    process.exit(0);
  }

  const dynamoDB = new AWS.DynamoDB.DocumentClient();

  try {
    await dynamoDB.put({ TableName: tableName, Item: user }).promise();
    console.log('User created successfully in table', tableName);
    console.log({ email: user.email, userId: user.userId });
    process.exit(0);
  } catch (err) {
    console.error('Failed to create user:', err);
    process.exit(2);
  }
})();
