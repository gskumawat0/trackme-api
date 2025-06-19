import { Request, Response, NextFunction } from 'express';
import { prisma } from '@/config/database';
import { hashPassword, comparePassword, generateToken } from '@/utils/auth';
import { createError } from '@/middleware/errorHandler';
import { AuthenticatedRequest, ApiResponse, User } from '@/types';
import { RegisterRequest, LoginRequest } from '@/validations/auth';

export const register = async (
  req: Request<RegisterRequest>,
  res: Response<ApiResponse<{ user: User; }>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, name } = req.body!;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw createError('User with this email already exists', 409);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userWithoutPassword,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request<LoginRequest>,
  res: Response<ApiResponse<{ user: User; token: string }>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body!;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw createError('Invalid email or password', 401);
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw createError('Invalid email or password', 401);
    }

    // Generate token
    const token = generateToken(user);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<User>>,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401);
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = req.user;

    res.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: userWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
};
