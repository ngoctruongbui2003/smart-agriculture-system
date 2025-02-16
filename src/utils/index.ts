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

export const formatDate = (date: Date): string => {
    return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
}

export const formatDateToVietnamese = (date: Date): string => {
    return date
        .toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' })
        .split('/')
        .reverse()
        .join('-');
}

export const convertSoilMoisture = (value: number) => Math.round(((4095 - value) / 4095) * 100 * 100) / 100;

export const convertRainVolume = (analogValue) => {
    if (analogValue <= 1000) {
        return "Mưa lớn";
    } else if (analogValue <= 2000) {
        return "Mưa vừa";
    } else if (analogValue <= 3000) {
        return "Mưa nhẹ";
    } else {
        return "Không mưa";
    }
};
