import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, UpdateUserPasswordDto } from './dto';
import { CREATE_SUCCESS, DELETE_SUCCESS, GET_ALL_SUCCESS, GET_SUCCESS, UPDATE_SUCCESS } from 'src/constants/server';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return {
      message: CREATE_SUCCESS,
      data: await this.usersService.create(createUserDto),
    };
  }

  @Get()
  async findAll() {
    return {
      message: GET_ALL_SUCCESS,
      data: await this.usersService.findAll(),
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return {
      message: GET_SUCCESS,
      data: await this.usersService.findOne(id),
    };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return {
      message: UPDATE_SUCCESS,
      data: await this.usersService.update(id, updateUserDto)
    };
  }

  @Patch('/change-password/:id')
  async updatePassword(
    @Param('id') id: string,
    @Body() updateUserPasswordDto: UpdateUserPasswordDto
  ) {
    return {
      message: UPDATE_SUCCESS,
      data: await this.usersService.updatePassword(id, updateUserPasswordDto)
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return {
      message: DELETE_SUCCESS,
      data: await this.usersService.remove(id)
    };
  }
}
