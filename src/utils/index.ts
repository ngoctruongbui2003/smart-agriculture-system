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


export const parseSortFields = (sort: string) => {
    const fields = sort.split(',');

    const sortCriteria: { [key: string]: 1 | -1 } = {};

    fields.forEach(field => {
        if (field.startsWith('-')) {
            sortCriteria[field.slice(1)] = -1; 
        } else {
            sortCriteria[field] = 1;
        }
    });

    return sortCriteria;
}

export const convertToVietNamDateOnly = (date: Date, unit: number) => {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + unit - 1).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' }).split('/').reverse().join('-')
}
