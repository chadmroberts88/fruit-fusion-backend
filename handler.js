"use strict";
const { Sequelize } = require("sequelize");
const User = require("./models/User");
const Game = require("./models/Game");

let seqConnection = null;

const createConnection = async () => {
  const seqConnection = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: "postgres",
      define: {
        timestamps: false,
      },
    }
  );

  await seqConnection.authenticate();
  return seqConnection;
};

const checkForConnection = async () => {
  if (!seqConnection) {
    seqConnection = await createConnection();
  } else {
    seqConnection.connectionManager.initPools();
    if (seqConnection.connectionManager.hasOwnProperty("getConnection")) {
      delete seqConnection.connectionManager.getConnection;
    }
  }
};

exports.createUser = async (event) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);

  await checkForConnection();

  const result = await seqConnection.transaction(async (trans) => {
    const user = await User(seqConnection).create(
      {
        id: event.request.userAttributes.sub,
        email: event.request.userAttributes.email,
        username: event.request.userAttributes.preferred_username,
        soundOn: true,
        darkModeOn: false,
        useSwipeOn: false,
        best: 0,
      },
      {
        transaction: trans,
      }
    );

    const game = await Game(seqConnection).create(
      {
        score: 0,
        multiplier: 1,
        tileCount: 2,
        tiles: [],
        userId: user.id,
      },
      {
        transaction: trans,
      }
    );

    const result = {
      ...user,
      ...game,
    };

    return result;
  });

  await seqConnection.connectionManager.close();

  return event;
};

exports.getUser = async (event) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);

  await checkForConnection();

  const id = event.pathParameters?.id;
  const result = await User(seqConnection).findAll({ where: { id: id } });

  await seqConnection.connectionManager.close();

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "*",
    },
    body: JSON.stringify(result[0].dataValues),
  };
};

exports.updateUser = async (event) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);

  await checkForConnection();

  const id = event.pathParameters?.id;
  const data = JSON.parse(event.body);
  const result = await User(seqConnection).update(
    { ...data },
    { where: { id: id } }
  );

  await seqConnection.connectionManager.close();

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "*",
    },
    body: JSON.stringify(result[0]),
  };
};

exports.getLeaders = async (event) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);

  await checkForConnection();

  const { rows } = await User(seqConnection).findAndCountAll({
    attributes: ["username", "best"],
    order: [
      ["best", "DESC"],
      ["username", "ASC"],
    ],
  });

  const leaders = rows.map((user) => {
    return {
      username: user.dataValues.username,
      best: user.dataValues.best,
    };
  });

  await seqConnection.connectionManager.close();

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "*",
    },
    body: JSON.stringify(leaders),
  };
};

exports.getRank = async (event) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);

  await checkForConnection();

  const id = event.pathParameters?.id;
  const result = await User(seqConnection).findAll({
    attributes: ["id"],
    order: [
      ["best", "DESC"],
      ["username", "ASC"],
    ],
  });

  const list = result.map((user) => {
    return user.dataValues.id;
  });

  const rank = list.indexOf(id) + 1;

  await seqConnection.connectionManager.close();

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "*",
    },
    body: JSON.stringify(rank),
  };
};

exports.getGame = async (event) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);

  await checkForConnection();

  const id = event.pathParameters?.id;
  const result = await Game(seqConnection).findAll({ where: { userId: id } });
  const data = result[0].dataValues;

  await seqConnection.connectionManager.close();

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "*",
    },
    body: JSON.stringify({
      score: data.score,
      multiplier: data.multiplier,
      tileCount: data.tileCount,
      tiles: data.tiles,
    }),
  };
};

exports.updateGame = async (event) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);

  await checkForConnection();

  const id = event.pathParameters?.id;
  const data = JSON.parse(event.body);
  const result = await Game(seqConnection).update(
    { ...data },
    { where: { userId: id } }
  );

  await seqConnection.connectionManager.close();

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "*",
    },
    body: JSON.stringify(result[0]),
  };
};

// Resets the demo account game weekly to prevent the database from sleeping.

exports.resetDemoGame = async (event) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);

  await checkForConnection();

  // Demo Account ID
  const id = process.env.DEMO_ID;
  const result = await Game(seqConnection).update(
    { score: 0, multiplier: 1, tileCount: 2, tiles: [] },
    { where: { userId: id } }
  );

  await seqConnection.connectionManager.close();

  return;
};
