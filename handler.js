'use strict';
const { Sequelize } = require('sequelize');
const middy = require('@middy/core');
const cors = require('@middy/http-cors');
const User = require('./models/User');
const Game = require('./models/Game');
const validateNewUser = require('./schema/NewUser');

let seqConnection = null;

const createConnection = async () => {
  const seqConnection = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    define: {
      timestamps: false
    },
    pool: {
      max: 5,
      min: 0,
      idle: 0,
      acquire: 3000,
      evict: 5000
    }
  });

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
  };
};

exports.createUser = middy(async (event) => {
  await checkForConnection();
  const data = JSON.parse(event.body);
  await validateNewUser(data);

  const result = await seqConnection.transaction(async (trans) => {
    const user = await User(seqConnection).create({
      email: data.email,
      password: data.password,
      username: 'Player' + (Math.floor(Math.random() * 90000) + 10000),
      soundOn: data.soundOn,
      darkModeOn: data.darkModeOn,
      useSwipeOn: data.useSwipeOn,
      best: data.best
    }, {
      transaction: trans
    });

    const game = await Game(seqConnection).create({
      score: data.score,
      multiplier: data.multiplier,
      tileCount: data.tileCount,
      tiles: data.tiles,
      userId: user.id
    }, {
      transaction: trans
    });

    const result = {
      user: user,
      game: {
        score: game.score,
        multipler: game.multiplier,
        tileCount: game.tileCount,
        tiles: game.tiles
      }
    };

    return result;
  });

  await seqConnection.connectionManager.close();

  return {
    statusCode: 200,
    body: JSON.stringify(result)
  };
}).use(cors());

exports.getUser = async (event) => {
  await checkForConnection();
  const id = event.pathParameters?.id;

  const result = await User(seqConnection).findAll({
    where: {
      id: id
    }
  });

  await seqConnection.connectionManager.close();

  return {
    statusCode: 200,
    body: JSON.stringify(result[0])
  };
};

exports.updateUser = async (event) => {
  await checkForConnection();
  const id = event.pathParameters?.id;
  const data = JSON.parse(event.body);

  await User(seqConnection).update({
    ...data
  }, {
    where: {
      id: id
    }
  });

  await seqConnection.connectionManager.close();

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "User updated." })
  };
};

exports.deleteUser = async (event) => {
  await checkForConnection();
  const id = event.pathParameters?.id;

  await seqConnection.transaction(async (trans) => {
    await Game(seqConnection).destroy({
      where: {
        userId: id
      }
    }, {
      transaction: trans
    });

    await User(seqConnection).destroy({
      where: {
        id: id
      }
    }, {
      transaction: trans
    });
  });

  await seqConnection.connectionManager.close();

  return {
    statusCode: 204,
    body: ''
  };
};

// /leaders?page=1&limit=10

exports.getLeaders = async (event) => {
  await checkForConnection();
  const page = parseInt(event.queryStringParameters?.page);
  const limit = parseInt(event.queryStringParameters?.limit);
  const offset = (page - 1) * limit;

  const { count, rows } = await User(seqConnection).findAndCountAll({
    attributes: ['username', 'best'],
    order: [['best', 'DESC'], ['username', 'ASC']],
    offset: offset,
    limit: limit
  });

  const leaders = rows.map((object) => {
    return {
      username: object.username,
      best: object.best
    };
  });

  await seqConnection.connectionManager.close();

  return {
    statusCode: 200,
    body: JSON.stringify(leaders)
  };
};

exports.getRank = async (event) => {
  await checkForConnection();
  const id = event.pathParameters?.id;

  const result = await User(seqConnection).findAll({
    attributes: ['id'],
    order: [['best', 'DESC'], ['username', 'ASC']]
  });

  const list = result.map((object) => {
    return object.id;
  });

  const rank = list.indexOf(id) + 1;

  await seqConnection.connectionManager.close();

  return {
    statusCode: 200,
    body: JSON.stringify({ rank: rank })
  };
};

exports.getGame = async (event) => {
  await checkForConnection();
  const id = event.pathParameters?.id;

  const result = await Game(seqConnection).findAll({
    where: {
      userId: id
    }
  });

  await seqConnection.connectionManager.close();

  return {
    statusCode: 200,
    body: JSON.stringify({
      score: result[0].score,
      multiplier: result[0].multiplier,
      tileCount: result[0].tileCount,
      tiles: JSON.parse(result[0].tiles)
    })
  };
};

exports.updateGame = async (event) => {
  await checkForConnection();
  const id = event.pathParameters?.id;
  const data = JSON.parse(event.body);

  await Game(seqConnection).update({
    ...data
  }, {
    where: {
      userId: id
    }
  });

  await seqConnection.connectionManager.close();

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Game updated!" })
  };
};