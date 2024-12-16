// src/invitation/invitation.controller.ts
import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  HttpStatus,
  Query,
  BadRequestException,
  UseInterceptors,
  ClassSerializerInterceptor,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../decorator/roles.decorator';
import { UserRole } from '../user/enums/user-role.enums';
import { InvitationService } from './invitation.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { InvitationResponseDto } from './dto/invitation-response.dto';
import { InvitationStatus } from './enums/invitation-status.enum';
import { Public } from 'src/auth/public.decorator';

@ApiTags('invitations')
// @ApiBearerAuth()
// @UseGuards(ClerkAuthGuard, RolesGuard)
// @UseInterceptors(ClassSerializerInterceptor)
@Controller('invitations')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @Post()
  @Public()
  // @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new business owner invitation' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Invitation has been successfully created.',
    type: InvitationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email already has a pending invitation.',
  })
  async create(
    @Body() createInvitationDto: CreateInvitationDto
  ): Promise<InvitationResponseDto> {
    console.log('Received invitation data:', createInvitationDto);
    console.log('Data types:', {
      email: typeof createInvitationDto.email,
      businessName: typeof createInvitationDto.businessName,
      phone: typeof createInvitationDto.phone,
      firstName: typeof createInvitationDto.firstName,
      lastName: typeof createInvitationDto.lastName,
    });

    const invitation = await this.invitationService.create(createInvitationDto);
    return new InvitationResponseDto(invitation);
  }
  @Get()
  @Public()
  // @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all invitations' })
  @ApiQuery({
    name: 'status',
    enum: InvitationStatus,
    required: false,
  })
  @ApiQuery({
    name: 'email',
    required: false,
    description: 'Filter by email address',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns all invitations.',
    type: [InvitationResponseDto],
  })
  async findAll(
    @Query('status') status?: InvitationStatus,
    @Query('email') email?: string
  ): Promise<InvitationResponseDto[]> {
    const invitations = await this.invitationService.findAll({
      status,
      email,
    });
    return invitations.map((inv) => new InvitationResponseDto(inv));
  }

  @Get(':id')
  @Public()
  // @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get invitation by ID' })
  @ApiParam({ name: 'id', description: 'Invitation ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the invitation.',
    type: InvitationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Invitation not found.',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<InvitationResponseDto> {
    const invitation = await this.invitationService.findOne(id);
    return new InvitationResponseDto(invitation);
  }

  @Get('verify/:token')
  @Public()
  @ApiOperation({ summary: 'Verify invitation token' })
  @ApiParam({ name: 'token', description: 'Invitation token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the invitation if valid.',
    type: InvitationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Invitation not found.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid or expired token.',
  })
  async verifyToken(
    @Param('token') token: string
  ): Promise<InvitationResponseDto> {
    const invitation = await this.invitationService.verifyToken(token);
    return new InvitationResponseDto(invitation);
  }

  @Post(':id/resend')
  @Public()
  // @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Resend invitation email' })
  @ApiParam({ name: 'id', description: 'Invitation ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Invitation has been resent.',
    type: InvitationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Invitation not found.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invitation cannot be resent (e.g., already accepted).',
  })
  async resend(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<InvitationResponseDto> {
    const invitation = await this.invitationService.resend(id);
    return new InvitationResponseDto(invitation);
  }

  @Post(':id/cancel')
  @Public()
  // @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Cancel invitation' })
  @ApiParam({ name: 'id', description: 'Invitation ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Invitation has been cancelled.',
    type: InvitationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Invitation not found.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invitation cannot be cancelled (e.g., already accepted).',
  })
  async cancel(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<InvitationResponseDto> {
    const invitation = await this.invitationService.cancel(id);
    return new InvitationResponseDto(invitation);
  }

  @Get('clerk/:clerkInvitationId')
  @Public()
  @ApiOperation({ summary: 'Get invitation by Clerk invitation ID' })
  @ApiParam({
    name: 'clerkInvitationId',
    description: 'Clerk Invitation ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the invitation.',
    type: InvitationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Invitation not found.',
  })
  async findByClerkId(
    @Param('clerkInvitationId') clerkInvitationId: string
  ): Promise<InvitationResponseDto> {
    const invitation =
      await this.invitationService.findByClerkId(clerkInvitationId);
    return new InvitationResponseDto(invitation);
  }

  @Post('accept')
  @Public()
  @ApiOperation({ summary: 'Accept an invitation and update status' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Invitation accepted successfully.',
    type: InvitationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid invitation or already accepted.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Invitation not found.',
  })
  async acceptInvitation(
    @Body() payload: { userId: string; ticket: string }
  ): Promise<InvitationResponseDto> {
    console.log('Accepting invitation:', payload);

    const invitation = await this.invitationService.acceptInvitation(
      payload.userId,
      payload.ticket
    );

    return new InvitationResponseDto(invitation);
  }
}
