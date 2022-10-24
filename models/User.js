const { Sequelize } = require('sequelize');

const User = (seqConnection) => {
  const user = seqConnection.define('User', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false,
      unique: true
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    username: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    soundOn: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
    },
    darkModeOn: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
    },
    useSwipeOn: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
    },
    best: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  });

  return user;
};

module.exports = User;