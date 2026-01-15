/**
 * Database Service Layer
 * 
 * Provides business logic methods for database operations using Prisma.
 * Implements repository pattern for data access abstraction.
 */

import { PrismaClient, UserProfile, Repository } from '@prisma/client'
import { prisma as defaultPrisma } from './prisma'

export interface CreateUserProfileData {
  userId: string
  githubId: number
  username: string
}

export interface RepositoryData {
  githubId: number
  name: string
  fullName: string
  owner: string
  isActive?: boolean
}

export class DatabaseService {
  constructor(private prisma: PrismaClient = defaultPrisma) {}

  // ============================================================================
  // User Profile Management
  // ============================================================================

  /**
   * Create a new user profile linked to an Auth.js user
   * @throws Error if user profile already exists or user not found
   */
  async createUserProfile(data: CreateUserProfileData): Promise<UserProfile> {
    try {
      return await this.prisma.userProfile.create({
        data: {
          userId: data.userId,
          githubId: data.githubId,
          username: data.username,
          lastActiveAt: new Date(),
        },
      })
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to create user profile: ${error.message}`)
      }
      throw error
    }
  }

  /**
   * Get user profile by user ID
   * @returns UserProfile or null if not found
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    return this.prisma.userProfile.findUnique({
      where: { userId },
    })
  }

  /**
   * Get user profile by GitHub ID
   * @returns UserProfile or null if not found
   */
  async getUserProfileByGitHubId(githubId: number): Promise<UserProfile | null> {
    return this.prisma.userProfile.findUnique({
      where: { githubId },
    })
  }

  /**
   * Update user's last active timestamp
   * Used for session activity tracking
   */
  async updateUserLastActive(userId: string): Promise<void> {
    try {
      await this.prisma.userProfile.update({
        where: { userId },
        data: { lastActiveAt: new Date() },
      })
    } catch (error) {
      // Silently fail - this is a non-critical update
      console.warn(`Failed to update last active for user ${userId}:`, error)
    }
  }

  /**
   * Delete user profile and all associated data
   * Cascade deletes repositories due to onDelete: Cascade
   */
  async deleteUserProfile(userId: string): Promise<void> {
    await this.prisma.userProfile.delete({
      where: { userId },
    })
  }

  // ============================================================================
  // Repository Management
  // ============================================================================

  /**
   * Get all repositories for a user
   * @param activeOnly - If true, only return active repositories
   */
  async getUserRepositories(
    userId: string,
    activeOnly = false
  ): Promise<Repository[]> {
    return this.prisma.repository.findMany({
      where: {
        userId,
        ...(activeOnly && { isActive: true }),
      },
      orderBy: { updatedAt: 'desc' },
    })
  }

  /**
   * Get a single repository by GitHub ID
   */
  async getRepositoryByGitHubId(githubId: number): Promise<Repository | null> {
    return this.prisma.repository.findUnique({
      where: { githubId },
    })
  }

  /**
   * Get a single repository by full name (owner/repo)
   */
  async getRepositoryByFullName(fullName: string): Promise<Repository | null> {
    return this.prisma.repository.findUnique({
      where: { fullName },
    })
  }

  /**
   * Add a new repository to monitor for a user
   * @throws Error if repository already exists
   */
  async addRepository(
    userId: string,
    data: RepositoryData
  ): Promise<Repository> {
    try {
      return await this.prisma.repository.create({
        data: {
          userId,
          githubId: data.githubId,
          name: data.name,
          fullName: data.fullName,
          owner: data.owner,
          isActive: data.isActive ?? true,
        },
      })
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to add repository: ${error.message}`)
      }
      throw error
    }
  }

  /**
   * Update repository settings
   * Currently supports updating isActive status
   */
  async updateRepository(
    id: string,
    data: { isActive?: boolean }
  ): Promise<Repository> {
    return this.prisma.repository.update({
      where: { id },
      data,
    })
  }

  /**
   * Delete a repository
   */
  async deleteRepository(id: string): Promise<void> {
    await this.prisma.repository.delete({
      where: { id },
    })
  }

  /**
   * Delete multiple repositories by their IDs
   * Useful for bulk operations
   */
  async deleteRepositories(ids: string[]): Promise<number> {
    const result = await this.prisma.repository.deleteMany({
      where: { id: { in: ids } },
    })
    return result.count
  }

  // ============================================================================
  // Cleanup Operations
  // ============================================================================

  /**
   * Cleanup inactive users and their associated data
   * Removes users who haven't been active for specified days
   * @param daysInactive - Number of days of inactivity threshold
   * @returns Number of user profiles deleted
   */
  async cleanupInactiveUsers(daysInactive = 30): Promise<number> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysInactive)

    const result = await this.prisma.userProfile.deleteMany({
      where: {
        lastActiveAt: {
          lt: cutoffDate,
        },
      },
    })

    return result.count
  }

  // ============================================================================
  // Health Check
  // ============================================================================

  /**
   * Check database connection health
   * Used by health check endpoints
   */
  async checkConnection(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`
      return true
    } catch (error) {
      console.error('Database connection check failed:', error)
      return false
    }
  }
}

// Export singleton instance
export const db = new DatabaseService()
