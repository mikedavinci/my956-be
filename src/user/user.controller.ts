// src/users/users.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  ParseUUIDPipe,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { UserRole } from './enums/user-role.enums';
import { Roles } from 'src/decorator/roles.decorator';
import { CurrentUser } from 'src/decorator/current-user.decorator';
import { UsersService } from './user.service';
import { Public } from 'src/auth/public.decorator';

@ApiTags('users')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Public()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User has been successfully created.',
    type: UserResponseDto,
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden.' })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'User already exists.',
  })
  @ApiBody({ type: CreateUserDto })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.usersService.create(createUserDto);
    return new UserResponseDto(user);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns all users.',
    type: [UserResponseDto],
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden.' })
  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.usersService.findAll();
    return users.map((user) => new UserResponseDto(user));
  }

  @Get('profile')
  @Public()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the current user profile.',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized.',
  })
  async getProfile(@CurrentUser() currentUser: any): Promise<UserResponseDto> {
    const user = await this.usersService.findByClerkId(currentUser.id);
    return new UserResponseDto(user);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'string' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the user.',
    type: UserResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found.' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden.' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<UserResponseDto> {
    const user = await this.usersService.findOne(id);
    return new UserResponseDto(user);
  }

  @Patch(':id')
  @Public()
  @ApiOperation({ summary: 'Update user' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'string' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User has been successfully updated.',
    type: UserResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found.' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden.' })
  @ApiBody({ type: UpdateUserDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<UserResponseDto> {
    const user = await this.usersService.update(id, updateUserDto);
    return new UserResponseDto(user);
  }

  @Patch('profile/update')
  @Public()
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Profile has been successfully updated.',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized.',
  })
  @ApiBody({ type: UpdateUserDto })
  async updateProfile(
    @CurrentUser() currentUser: any,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<UserResponseDto> {
    const user = await this.usersService.findByClerkId(currentUser.id);
    const updatedUser = await this.usersService.update(user.id, updateUserDto);
    return new UserResponseDto(updatedUser);
  }

  @Delete(':id')
  @Public()
  @ApiOperation({ summary: 'Delete user' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'string' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'User has been successfully deleted.',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found.' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden.' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.usersService.remove(id);
  }

  @Get('clerk/:clerkId')
  @Public()
  @ApiOperation({ summary: 'Get user by Clerk ID' })
  @ApiParam({ name: 'clerkId', description: 'Clerk User ID', type: 'string' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the user.',
    type: UserResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found.' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden.' })
  async findByClerkId(
    @Param('clerkId') clerkId: string
  ): Promise<UserResponseDto> {
    const user = await this.usersService.findByClerkId(clerkId);
    return new UserResponseDto(user);
  }
}
