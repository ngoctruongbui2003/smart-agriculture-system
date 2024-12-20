import { Types } from "mongoose";

const bcrypt = require('bcrypt');
const _ = require('lodash');
const saltRounds = 10;

export const hashPassword = async (password) => {
    return await bcrypt.hash(password, saltRounds);
}

export const comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
}

export const convertObjectId = (id: string) : Types.ObjectId => {
    return new Types.ObjectId(id);
}
