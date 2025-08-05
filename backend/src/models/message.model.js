import { DataTypes } from 'sequelize';
import sequelize from '../lib/db.js';

const Message = sequelize.define('Message', {
  senderID: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  receiverID: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  text: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

Message.associate = (models) => {
  Message.belongsTo(models.User, { foreignKey: "senderID", as: "sender" });
  Message.belongsTo(models.User, { foreignKey: "receiverID", as: "receiver" });
};

export default Message;