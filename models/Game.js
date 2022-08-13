const { Sequelize } = require('sequelize');

const Game = (seqConnection) => {
  const game = seqConnection.define('Game', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      unique: true
    },
    score: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    multiplier: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    tileCount: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    tiles: {
      type: Sequelize.JSON,
      allowNull: false,
    },
    userId: {
      type: Sequelize.UUID,
      allowNull: false,
      unique: true
    }
  });

  return game;
};

module.exports = Game;