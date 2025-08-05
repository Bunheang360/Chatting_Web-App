import { DataTypes } from 'sequelize';
import sequelize from '../lib/db.js';

const User = sequelize.define('User', {
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  fullname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  profilepic: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

User.associate = (models) => {
  User.hasMany(models.Message, { foreignKey: "senderID", as: "sentMessages" });
  User.hasMany(models.Message, { foreignKey: "receiverID", as: "receivedMessages" });
};

export default User;