import sequelize from "../lib/db.js";
import User from "./user.model.js";
import Message from "./message.model.js";

User.associate({ Message });
Message.associate({ User });

export { sequelize, User, Message };